const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const { URL } = require('url');
const axios = require('axios');
const cheerio = require('cheerio');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

const EBAY_LOGO = "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg";

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: "PriceBuddy API V2 is running on port " + PORT });
});

// Test DB Route
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: "Database connection clear!", data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get products — filtered by user_id if provided
app.get('/products', async (req, res) => {
    try {
        const { user_id } = req.query;
        let query = `
            SELECT p.*, s.product_url, s.last_price 
            FROM products p 
            LEFT JOIN product_sources s ON p.id = s.product_id 
        `;
        let params = [];
        if (user_id) {
            query += " WHERE p.user_id = ?";
            params.push(user_id);
        }
        query += " ORDER BY p.id DESC";

        const [rows] = await pool.query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error("Error in GET /products:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { user_id } = req.query;
        let [rows] = await pool.query('SELECT * FROM products WHERE user_id = ? ORDER BY id DESC', [user_id]);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Normalize hostname for comparison.
 * Adds protocol when missing and strips common www prefix.
 */
const getHostname = (value) => {
    if (!value) return null;
    try {
        const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
        return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch (err) {
        return null;
    }
};

/**
 * Match a product URL to an existing website row.
 * If no match exists, optionally insert a new website record.
 */
const resolveWebsiteId = async (connection, productUrl) => {
    const hostname = getHostname(productUrl);
    if (!hostname) {
        const error = new Error('Invalid product URL supplied.');
        error.status = 400;
        throw error;
    }

    // Fetch known websites and try to match by hostname
    const [websites] = await connection.query('SELECT id, name, base_url FROM websites');
    const matched = websites.find((w) => {
        const websiteHost = getHostname(w.base_url);
        return websiteHost && (hostname === websiteHost || hostname.endsWith(`.${websiteHost}`));
    });

    if (matched) return matched.id;

    // If website not found, create it so we always link a source
    const inferredName = hostname.split('.').shift() || 'unknown';
    const insertQuery = 'INSERT INTO websites (name, base_url) VALUES (?, ?)';
    const [insertResult] = await connection.query(insertQuery, [inferredName, `https://${hostname}`]);
    return insertResult.insertId;
};

/**
 * Scrape price from eBay page using Cheerio
 */
async function scrapeEbayPrice(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000
        });
        const $ = cheerio.load(data);

        // Try multiple common eBay price selectors
        let priceText = $('.x-price-primary').text() ||
            $('#prcIsum').text() ||
            $('.x-price-approx__price').text() ||
            $('[itemprop="price"]').attr('content');

        if (!priceText) return null;

        // Extract numbers and decimal point
        const cleanPrice = priceText.replace(/[^\d.]/g, '');
        return cleanPrice ? parseFloat(cleanPrice) : null;
    } catch (e) {
        console.error("Scraping error for", url, ":", e.message);
        return null;
    }
}

// Add a product AND its source link — tied to a specific user
app.post(['/products', '/api/products'], async (req, res) => {
    const { name, category, image_url, url, user_id } = req.body;

    if (!name || !url) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: 'name' and 'url' are mandatory."
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert into products (with user_id)
        const productQuery = "INSERT INTO products (name, category, image_url, user_id) VALUES (?, ?, ?, ?)";
        const [productResult] = await connection.query(productQuery, [name, category || 'Electronics', image_url, user_id || null]);
        const productId = productResult.insertId;

        // 2. Detect website and add to product_sources
        const websiteId = await resolveWebsiteId(connection, url);

        // 2.1 Fetch initial price
        const initialPrice = await scrapeEbayPrice(url);

        const sourceQuery = "INSERT INTO product_sources (product_id, website_id, product_url, last_price) VALUES (?, ?, ?, ?)";
        const [sourceResult] = await connection.query(sourceQuery, [productId, websiteId, url, initialPrice]);
        const sourceId = sourceResult.insertId;

        // 3. Record history if price found (use product_source_id)
        if (initialPrice) {
            await connection.query("INSERT INTO price_history (product_source_id, price) VALUES (?, ?)", [sourceId, initialPrice]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Product tracked and saved to your dashboard!",
            product_id: productId,
            website_id: websiteId,
            source_id: sourceId
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error in POST /products:", error);
        res.status(error.status || 500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// Get single product details by ID
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Fetching detail for product: ${id}`);
    try {
        const [products] = await pool.query(
            'SELECT p.*, s.product_url, s.last_price, s.id as source_id FROM products p LEFT JOIN product_sources s ON p.id = s.product_id WHERE p.id = ?',
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const product = products[0];

        // Fetch price history (mapped to correct schema fields)
        const [history] = await pool.query(
            'SELECT price, scraped_at as created_at FROM price_history WHERE product_source_id = ? ORDER BY scraped_at ASC',
            [product.source_id]
        );

        res.json({
            success: true,
            data: {
                ...product,
                history: history,
                store: 'eBay',
                storeLogo: EBAY_LOGO
            }
        });
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await pool.query(
            'SELECT p.*, s.product_url, s.last_price, s.id as source_id FROM products p LEFT JOIN product_sources s ON p.id = s.product_id WHERE p.id = ?',
            [id]
        );
        if (products.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
        const product = products[0];
        const [history] = await pool.query('SELECT price, created_at FROM price_history WHERE source_id = ? ORDER BY created_at ASC', [product.source_id]);
        res.json({ success: true, data: { ...product, history, store: 'eBay', storeLogo: EBAY_LOGO } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a product (Tied to user_id for security)
app.delete(['/products/:id', '/api/products/:id'], async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query; // Accept it from query for easy fetch DELETE calls

    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    try {
        let query = "DELETE FROM products WHERE id = ?";
        let params = [id];

        if (user_id) {
            query += " AND user_id = ?";
            params.push(user_id);
        }

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found or not owned by you." });
        }

        res.json({ success: true, message: "Product removed from tracking." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT SEARCH  —  uses official/open APIs (no HTML scraping needed)
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. eBay Finding API (FREE — 5,000 calls/day) ─────────────────────────────
//  Get your free App ID at: https://developer.ebay.com/signin/
//  Add it to .env as EBAY_APP_ID=YourAppIdHere
let ebayAccessToken = null;
let ebayTokenExpiry = 0;

async function getEbayOAuthToken() {
    if (ebayAccessToken && Date.now() < ebayTokenExpiry) {
        return ebayAccessToken;
    }

    const appId = process.env.EBAY_APP_ID;
    const certId = process.env.EBAY_CERT_ID;

    if (!appId || !certId) {
        throw new Error('EBAY_APP_ID or EBAY_CERT_ID not provided');
    }

    const auth = Buffer.from(`${appId}:${certId}`).toString('base64');
    const params = new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope'
    });

    try {
        const { data } = await axios.post('https://api.ebay.com/identity/v1/oauth2/token', params.toString(), {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        ebayAccessToken = data.access_token;
        ebayTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
        return ebayAccessToken;
    } catch (e) {
        console.error('eBay OAuth Error:', Math.floor(Date.now() / 1000), e.response?.data || e.message);
        throw new Error('OAuth token generation failed.');
    }
}

async function searchEbay(query) {
    const appId = process.env.EBAY_APP_ID;
    if (!appId) throw new Error('EBAY_APP_ID not set in .env');

    try {
        // Attempt 1: Modern Browse API (OAuth)
        if (process.env.EBAY_CERT_ID) {
            const token = await getEbayOAuthToken();
            const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=50`;
            const { data } = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            const items = data.itemSummaries || [];
            if (items.length > 0) {
                return items.slice(0, 20).map((item, i) => ({
                    id: `ebay-br-${item.itemId}`,
                    name: item.title?.substring(0, 100) || 'Unknown',
                    price: item.price?.value ? `$${parseFloat(item.price.value).toFixed(2)}` : 'N/A',
                    image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
                    url: item.itemWebUrl || '#',
                    store: 'eBay',
                    storeLogo: EBAY_LOGO
                }));
            }
        }
    } catch (error) {
        console.warn('eBay Browse API failed:', error.response?.data || error.message, 'Falling back to Finding API...');
    }


    // Attempt 2: Fallback to Legacy Finding API (only requires App ID)
    try {
        const params = new URLSearchParams({
            'OPERATION-NAME': 'findItemsByKeywords',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
            'keywords': query,
            'paginationInput.entriesPerPage': '50',
            'sortOrder': 'BestMatch',
            'itemFilter(0).name': 'ListingType',
            'itemFilter(0).value': 'FixedPrice',
        });

        const url = `https://svcs.ebay.com/services/search/FindingService/v1?${params}`;
        const { data } = await axios.get(url, { timeout: 10000 });

        // Extract the explicit human-readable error from eBay's nested array structure
        if (data?.errorMessage) {
            const ebayErrs = data.errorMessage[0]?.error?.map(e => e.message?.[0]).filter(Boolean).join(', ') || 'Unknown API Error';
            throw new Error(`eBay API Error: ${ebayErrs}`);
        }

        const items = data?.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];

        return items.slice(0, 20).map((item, i) => ({
            id: `ebay-fn-${i}`,
            name: item.title?.[0]?.substring(0, 100) || 'Unknown',
            price: item.sellingStatus?.[0]?.currentPrice?.[0]?.['__value__']
                ? `$${parseFloat(item.sellingStatus[0].currentPrice[0]['__value__']).toFixed(2)}`
                : 'N/A',
            image: item.galleryURL?.[0] || null,
            url: item.viewItemURL?.[0] || '#',
            store: 'eBay',
            storeLogo: EBAY_LOGO
        }));
    } catch (e) {
        console.error('eBay Finding API critical failure:', e.response?.data || e.message);
        throw new Error('All eBay API attempts failed. Please verify your App ID and Cert ID are valid for Production (not Sandbox) and are active.');
    }
}

// ── Search Endpoint ───────────────────────────────────────────────
app.get(['/search', '/api/search'], async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Query 'q' is required (min 2 chars)." });
    }

    const hasEbayKey = !!process.env.EBAY_APP_ID;

    if (!hasEbayKey) {
        return res.json({
            success: true,
            count: 0,
            sources: { ebay: 0 },
            ebayKeyMissing: true,
            data: []
        });
    }

    try {
        const ebayResults = await searchEbay(q);
        res.json({
            success: true,
            count: ebayResults.length,
            sources: { ebay: ebayResults.length },
            ebayKeyMissing: false,
            data: ebayResults
        });
    } catch (error) {
        console.error("eBay Search Error:", error);
        res.status(500).json({ success: false, message: error.message || "Error fetching data from eBay." });
    }
});

// Add a product source
app.post(['/product-source', '/api/product-source'], async (req, res) => {
    const { product_id, website_id, product_url } = req.body;

    if (!product_id || !website_id || !product_url) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: product_id, website_id, and product_url are required."
        });
    }

    try {
        const query = "INSERT INTO product_sources (product_id, website_id, product_url) VALUES (?, ?, ?)";
        const [result] = await pool.query(query, [product_id, website_id, product_url]);
        res.json({
            success: true,
            message: "Product source added successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const bcrypt = require('bcryptjs');

// ── User Authentication ───────────────────────────────────────

// Register User
app.post(['/register', '/api/register'], async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: name, email, and password are required."
        });
    }

    try {
        // Check if user already exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A user with this email already exists."
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        const [result] = await pool.query(query, [name, email, hashedPassword]);

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            user: {
                id: result.insertId,
                name,
                email
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

// Login User
app.post(['/login', '/api/login'], async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    try {
        // Find user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Successful login
        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// 404 Handler - MUST BE LAST
app.use((req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.url,
        method: req.method
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});
