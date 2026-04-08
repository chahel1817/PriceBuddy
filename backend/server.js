const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const { URL } = require('url');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

dotenv.config();

// Handle process-level errors to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
});


const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; // e.g., scraperapi.com key for Amazon/eBay bypass
const SERPAPI_KEY = process.env.SERPAPI_KEY; // Optional Amazon product API via SerpApi
const AMAZON_DOMAIN = process.env.AMAZON_DOMAIN || 'amazon.com';
const PULSE_CRON = process.env.PULSE_CRON || '0 */6 * * *'; // default every 6 hours
const SERPAPI_DAILY_CAP = parseInt(process.env.SERPAPI_DAILY_CAP || '2', 10); // cap cron calls per day
const SERPAPI_MONTHLY_LIMIT = parseInt(process.env.SERPAPI_MONTHLY_LIMIT || '250', 10);
const app = express();
const PORT = process.env.PORT || 5001;
const USD_TO_INR = 83.0; // Conversion rate

// ── SerpAPI Monthly Usage Tracker ────────────────────────────────
// Resets automatically on the 1st of each month
let serpapiMonthlyUsage = { count: 0, month: new Date().getMonth() };

function canUseSerpApi() {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== serpapiMonthlyUsage.month) {
        serpapiMonthlyUsage = { count: 0, month: currentMonth };
        console.log('📅 SerpAPI monthly counter reset.');
    }
    return serpapiMonthlyUsage.count < SERPAPI_MONTHLY_LIMIT;
}

function trackSerpApiCall() {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== serpapiMonthlyUsage.month) {
        serpapiMonthlyUsage = { count: 0, month: currentMonth };
    }
    serpapiMonthlyUsage.count++;
    console.log(`📊 SerpAPI usage: ${serpapiMonthlyUsage.count}/${SERPAPI_MONTHLY_LIMIT} this month`);
}

// Middleware
app.use(cors());
app.use(express.json());

const EBAY_LOGO = "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg";
const AMAZON_LOGO = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg";

/**
 * Detect store name and logo from a product URL.
 */
function detectStore(productUrl) {
    if (!productUrl) return { store: 'Unknown', storeLogo: null };
    const host = (getHostname(productUrl) || '').toLowerCase();
    if (host.includes('amazon')) return { store: 'Amazon', storeLogo: AMAZON_LOGO };
    if (host.includes('ebay')) return { store: 'eBay', storeLogo: EBAY_LOGO };
    return { store: host.split('.')[0] || 'Store', storeLogo: null };
}

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
        // In this join, we also fetch the second-to-last price point from history to calculate trend
        let query = `
            SELECT p.*, s.id as source_id, s.product_url, s.last_price, s.target_price,
            (SELECT ph.price FROM price_history ph 
             WHERE ph.product_source_id = s.id 
             ORDER BY ph.scraped_at DESC LIMIT 1 OFFSET 1) as prev_price,
            (SELECT ph.scraped_at FROM price_history ph
             WHERE ph.product_source_id = s.id
             ORDER BY ph.scraped_at DESC LIMIT 1) as scraped_at
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

        // Fetch history for each product to power dashboard charts
        for (let row of rows) {
            const [history] = await pool.query(
                'SELECT price, scraped_at as created_at FROM price_history WHERE product_source_id = ? ORDER BY scraped_at DESC LIMIT 20',
                [row.source_id]
            );
            row.history = history;
        }

        // ── Calculate Stats for Dashboard ─────────────────────────
        let totalDrop = 0;
        let dropCount = 0;
        let totalCurrentValue = 0;

        // Enrich each row with detected store info and calc stats
        const enriched = rows.map(r => {
            const { store, storeLogo } = detectStore(r.product_url);

            // Calc stats
            const current = parseFloat(r.last_price || 0);
            const prev = parseFloat(r.prev_price || 0);
            if (prev > 0 && current < prev) {
                totalDrop += (prev - current);
                dropCount++;
            }
            totalCurrentValue += current;

            return { ...r, store, storeLogo };
        });

        const statsStore = {
            avgPriceDrop: dropCount > 0 ? (totalDrop / dropCount).toFixed(2) : 0,
            totalSavings: totalDrop.toFixed(2),
            productCount: enriched.length
        };

        res.json({
            success: true,
            count: enriched.length,
            stats: statsStore,
            data: enriched
        });
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
/**
 * Strip tracking and search parameters from URLs to keep database clean.
 */
const cleanUrl = (value) => {
    if (!value) return null;
    try {
        const url = new URL(value.startsWith('http') ? value : `https://${value}`);
        // For eBay, we really only need the item ID for scraping
        if (url.hostname.includes('ebay')) {
            const itmMatch = url.pathname.match(/\/itm\/(\d+)/);
            if (itmMatch) {
                return `https://www.ebay.com/itm/${itmMatch[1]}`;
            }
        }
        // Amazon canonical: keep ASIN
        if (url.hostname.includes('amazon.')) {
            const asinMatch = url.pathname.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
            if (asinMatch) {
                return `https://${url.hostname}/dp/${asinMatch[1]}`;
            }
        }
        // General cleaning: Strip query params except for common IDs
        url.search = '';
        return url.toString();
    } catch (err) {
        return value;
    }
};

const getHostname = (value) => {
    if (!value) return null;
    try {
        const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
        return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch (err) {
        return null;
    }
};

const getAmazonAsin = (value) => {
    try {
        const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
        const asinMatch = url.pathname.match(/\/([A-Z0-9]{10})(?:[/?]|$)/);
        return asinMatch ? asinMatch[1] : null;
    } catch {
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
        const { data } = await fetchHtml(url);
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

/**
 * Scrape price from Amazon product page.
 * Uses optional ScraperAPI-style proxy when SCRAPER_API_KEY is set.
 */
async function scrapeAmazonPrice(url) {
    try {
        const asin = getAmazonAsin(url);
        const hostname = getHostname(url) || 'amazon.com';

        // Preferred: SerpApi product endpoint (more reliable than HTML scraping)
        if (SERPAPI_KEY && asin && canUseSerpApi()) {
            trackSerpApiCall();
            const serpUrl = 'https://serpapi.com/search.json';
            const params = {
                api_key: SERPAPI_KEY,
                engine: 'amazon_product',
                amazon_domain: hostname,
                asin
            };
            const { data } = await axios.get(serpUrl, { params, timeout: 15000 });
            const priceStr = data?.product_results?.price;
            if (priceStr) {
                const cleaned = String(priceStr).replace(/[^\d.]/g, '');
                if (cleaned) return parseFloat(cleaned);
            }
        }

        // Fallback: HTML scrape (may be blocked without proxy)
        const { data } = await fetchHtml(url);
        const $ = cheerio.load(data);
        const priceText =
            $('#priceblock_ourprice').text() ||
            $('#priceblock_dealprice').text() ||
            $('span.a-price-whole').first().text() + '.' + $('span.a-price-fraction').first().text() ||
            $('[data-a-color="price"] .a-offscreen').first().text();
        if (!priceText) return null;
        const cleanPrice = priceText.replace(/[^\d.]/g, '');
        return cleanPrice ? parseFloat(cleanPrice) : null;
    } catch (e) {
        console.error("Amazon scrape error for", url, e.message);
        return null;
    }
}


/**
 * Shared HTML fetcher with optional ScraperAPI proxy to bypass bot checks.
 */
async function fetchHtml(targetUrl) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    };
    const timeout = 10000;

    if (SCRAPER_API_KEY) {
        const proxyUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&render=false&url=${encodeURIComponent(targetUrl)}`;
        return axios.get(proxyUrl, { headers, timeout });
    }

    return axios.get(targetUrl, { headers, timeout });
}

/**
 * Pick the right scraper based on hostname and convert to INR if needed.
 */
async function scrapePriceByUrl(url) {
    const hostname = getHostname(url) || '';
    let price = null;

    // Check if the store is likely already in INR (ends with .in)
    const isLocalStore = hostname.endsWith('.in');

    if (hostname.includes('ebay')) {
        price = await scrapeEbayPrice(url);
    } else if (hostname.includes('amazon.')) {
        price = await scrapeAmazonPrice(url);
    } else {
        price = await scrapeEbayPrice(url);
    }

    if (price && !isLocalStore) {
        price = price * USD_TO_INR; // Convert global USD prices to INR
    }

    return price ? parseFloat(price.toFixed(2)) : null;
}

// Add a product AND its source link — tied to a specific user
app.post(['/products', '/api/products'], async (req, res) => {
    const { name, category, image_url, url, user_id, target_price } = req.body;

    if (!name || !url) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: 'name' and 'url' are mandatory."
        });
    }

    const cleanedUrl = cleanUrl(url);
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
        const initialPrice = await scrapePriceByUrl(url);

        const sourceQuery = "INSERT INTO product_sources (product_id, website_id, product_url, last_price, target_price) VALUES (?, ?, ?, ?, ?)";
        const [sourceResult] = await connection.query(sourceQuery, [productId, websiteId, cleanedUrl, initialPrice, target_price || null]);
        const sourceId = sourceResult.insertId;

        // 3. Record history if price found (use product_source_id)
        if (initialPrice) {
            await connection.query("INSERT INTO price_history (product_source_id, price, scraped_at) VALUES (?, ?, ?)", [sourceId, initialPrice, new Date()]);
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
            'SELECT p.*, s.product_url, s.last_price, s.target_price, s.id as source_id FROM products p LEFT JOIN product_sources s ON p.id = s.product_id WHERE p.id = ?',
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

        const { store, storeLogo } = detectStore(product.product_url);
        res.json({
            success: true,
            data: {
                ...product,
                history: history,
                store,
                storeLogo
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
            'SELECT p.*, s.product_url, s.last_price, s.target_price, s.id as source_id FROM products p LEFT JOIN product_sources s ON p.id = s.product_id WHERE p.id = ?',
            [id]
        );
        if (products.length === 0) return res.status(404).json({ success: false, message: "Product not found" });
        const product = products[0];
        const { store, storeLogo } = detectStore(product.product_url);
        // Align with schema: price_history is keyed by product_source_id, not source_id
        const [history] = await pool.query(
            'SELECT price, scraped_at as created_at FROM price_history WHERE product_source_id = ? ORDER BY scraped_at ASC',
            [product.source_id]
        );
        res.json({ success: true, data: { ...product, history, store, storeLogo } });
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

// Update Target Price for a product source
app.patch('/api/products/:id/target-price', async (req, res) => {
    const { id } = req.params;
    const { target_price } = req.body;
    try {
        await pool.query('UPDATE product_sources SET target_price = ? WHERE product_id = ?', [target_price, id]);
        res.json({ success: true, message: `Target price updated to ₹${target_price}` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
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
                return items.slice(0, 20).map((item, i) => {
                    const priceVal = item.price?.value ? parseFloat(item.price.value) : 0;
                    return {
                        id: `ebay-br-${item.itemId}`,
                        name: item.title?.substring(0, 100) || 'Unknown',
                        price: priceVal > 0 ? `₹${(priceVal * USD_TO_INR).toLocaleString('en-IN')}` : 'N/A',
                        image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || null,
                        url: item.itemWebUrl || '#',
                        store: 'eBay',
                        storeLogo: EBAY_LOGO
                    };
                });
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

        return items.slice(0, 20).map((item, i) => {
            const priceVal = item.sellingStatus?.[0]?.currentPrice?.[0]?.['__value__'] ? parseFloat(item.sellingStatus[0].currentPrice[0]['__value__']) : 0;
            return {
                id: `ebay-fn-${i}`,
                name: item.title?.[0]?.substring(0, 100) || 'Unknown',
                price: priceVal > 0 ? `₹${(priceVal * USD_TO_INR).toLocaleString('en-IN')}` : 'N/A',
                image: item.galleryURL?.[0] || null,
                url: item.viewItemURL?.[0] || '#',
                store: 'eBay',
                storeLogo: EBAY_LOGO
            };
        });
    } catch (e) {
        console.error('eBay Finding API critical failure:', e.response?.data || e.message);
        throw new Error('All eBay API attempts failed. Please verify your App ID and Cert ID are valid for Production (not Sandbox) and are active.');
    }
}

/**
 * Amazon search via SerpApi (recommended: SERPAPI_KEY must be set)
 */
async function searchAmazon(query) {
    if (!SERPAPI_KEY) {
        return [];
    }
    if (!canUseSerpApi()) {
        console.log('🚦 SerpAPI monthly limit reached — skipping Amazon search');
        return [];
    }
    trackSerpApiCall();

    try {
        const params = {
            api_key: SERPAPI_KEY,
            engine: 'amazon',
            amazon_domain: AMAZON_DOMAIN,
            k: query
        };
        console.log('🔍 SerpAPI Amazon search for:', query);
        const { data } = await axios.get('https://serpapi.com/search.json', { params, timeout: 15000 });

        // Debug: log what keys came back
        console.log('📦 SerpAPI response keys:', Object.keys(data));

        const items = data?.organic_results || [];
        console.log(`📦 Amazon results: ${items.length} products found`);

        return items.slice(0, 20).map((item, idx) => {
            const priceVal = item.extracted_price || (item.price ? parseFloat(item.price.replace(/[^\d.]/g, '')) : 0);
            return {
                id: `amz-${item.asin || idx}`,
                name: item.title || 'Unknown',
                price: priceVal > 0 ? `₹${(priceVal * USD_TO_INR).toLocaleString('en-IN')}` : 'N/A',
                image: item.thumbnail || null,
                url: item.link || '#',
                store: 'Amazon',
                storeLogo: AMAZON_LOGO
            };
        });
    } catch (error) {
        console.error('Amazon search error:', error.response?.data || error.message);
        return [];
    }
}

// ── Search Endpoint ───────────────────────────────────────────────
app.get(['/search', '/api/search'], async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Query 'q' is required (min 2 chars)." });
    }

    try {
        const [ebayResults, amazonResults] = await Promise.all([
            process.env.EBAY_APP_ID ? searchEbay(q) : [],
            (SERPAPI_KEY && canUseSerpApi()) ? searchAmazon(q) : []
        ]);

        const combined = [...amazonResults, ...ebayResults];
        const sources = {
            amazon: amazonResults.length,
            ebay: ebayResults.length
        };

        res.json({
            success: true,
            count: combined.length,
            sources,
            ebayKeyMissing: !process.env.EBAY_APP_ID,
            amazonKeyMissing: !SERPAPI_KEY,
            serpapiUsage: `${serpapiMonthlyUsage.count}/${SERPAPI_MONTHLY_LIMIT}`,
            data: combined
        });
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ success: false, message: error.message || "Error fetching search results." });
    }
});

// ── SerpAPI Usage Check ───────────────────────────────────────────
app.get('/api/serpapi-usage', (req, res) => {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== serpapiMonthlyUsage.month) {
        serpapiMonthlyUsage = { count: 0, month: currentMonth };
    }
    res.json({
        used: serpapiMonthlyUsage.count,
        limit: SERPAPI_MONTHLY_LIMIT,
        remaining: SERPAPI_MONTHLY_LIMIT - serpapiMonthlyUsage.count,
        dailyCronCap: SERPAPI_DAILY_CAP
    });
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
                email: user.email,
                notifications_active: user.notifications_active
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

/**
 * Core Logic for Syncing Prices
 * Can be triggered by CRON or manually by a user via the UI.
 */
async function runPriceSync(targetUserId = null, forceSync = false) {
    console.log(`📡 Sync Initiated: ${targetUserId ? `User ${targetUserId}` : 'System-wide'} ${forceSync ? '(FORCED)' : ''}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        let query = `
            SELECT 
                s.id, s.product_url, s.last_price as old_price, s.target_price, p.name, u.email as user_email, u.notifications_active,
                (SELECT MAX(scraped_at) FROM price_history ph WHERE ph.product_source_id = s.id) as last_scraped_at
            FROM product_sources s
            JOIN products p ON s.product_id = p.id
            JOIN users u ON p.user_id = u.id
        `;
        let params = [];

        if (targetUserId) {
            query += " WHERE p.user_id = ?";
            params.push(targetUserId);
        }

        const [rows] = await pool.query(query, params);
        let serpapiCalls = 0;

        for (const row of rows) {
            const hostname = getHostname(row.product_url) || '';

            // Optimization for Amazon: limit calls unless forced
            if (hostname.includes('amazon.')) {
                if (!canUseSerpApi()) continue;

                const last = row.last_scraped_at ? new Date(row.last_scraped_at) : null;
                const tooRecent = last && (Date.now() - last.getTime() < 24 * 60 * 60 * 1000);

                if (tooRecent && !forceSync) {
                    console.log(`⏳ Skipping Amazon ${row.id} - Refreshed recently.`);
                    continue;
                }

                if (serpapiCalls >= SERPAPI_DAILY_CAP && !forceSync) {
                    console.log(`🚦 SerpApi Cap reached - Skipping Amazon ${row.id}`);
                    continue;
                }

                serpapiCalls += 1;
            }

            const freshPrice = await scrapePriceByUrl(row.product_url);

            if (freshPrice !== null && freshPrice !== undefined) {
                const oldPrice = parseFloat(row.old_price);
                const targetPrice = row.target_price ? parseFloat(row.target_price) : null;
                const currentPrice = parseFloat(freshPrice);

                // Update DB
                await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [currentPrice, row.id]);
                await pool.query('INSERT INTO price_history (product_source_id, price, scraped_at) VALUES (?, ?, ?)', [row.id, currentPrice, new Date()]);

                // Alert Detection
                const isDrop = currentPrice < oldPrice;
                const metTarget = targetPrice ? currentPrice <= targetPrice : true;

                if (Number.isFinite(oldPrice) && isDrop && metTarget && row.notifications_active) {
                    const savings = (oldPrice - currentPrice).toFixed(2);
                    const { store, storeLogo } = detectStore(row.product_url);
                    const themeColor = store === 'Amazon' ? '#FF9900' : '#00E5FF';

                    await transporter.sendMail({
                        from: `"PriceBuddy ${store} Alerts" <${process.env.EMAIL_USER}>`,
                        to: row.user_email,
                        subject: `📉 ${store} PRICE DROP: ${row.name}`,
                        html: `<div style="padding: 20px; font-family: sans-serif;">
                            <h2>Price Drop Detected for ${row.name}!</h2>
                            <p>Current Price: <strong>₹${currentPrice.toLocaleString()}</strong> (was ₹${oldPrice.toLocaleString()})</p>
                            <p>You are saving ₹${savings}!</p>
                            <a href="${row.product_url}" style="padding: 10px 20px; background: ${themeColor}; color: white; border-radius: 5px; text-decoration: none;">View Detail</a>
                        </div>`
                    }).catch(err => console.error("Email fail:", err.message));
                }
                console.log(`✅ Updated ${row.name} to ₹${currentPrice}`);
            }
        }
        return { success: true, count: rows.length };
    } catch (e) {
        console.error('Core Sync Error:', e);
        throw e;
    }
}

// ── Automated Price Pulse ───────────────────────────────────────────
cron.schedule(PULSE_CRON, () => {
    console.log(`⏰ Scheduled Pulse (${PULSE_CRON})`);
    runPriceSync().catch(console.error);
});

// ── Manual Sync Endpoint ────────────────────────────────────────────
app.post('/api/sync-now', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: "user_id required" });

    try {
        const result = await runPriceSync(user_id, true);
        res.json({ success: true, message: `Sync completed for ${result.count} items.`, data: result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Toggle Notification Status for a user
app.patch('/api/users/:id/notifications', async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    try {
        await pool.query('UPDATE users SET notifications_active = ? WHERE id = ?', [active, id]);
        res.json({ success: true, message: `Notifications ${active ? 'activated' : 'deactivated'}` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Sync user profile state
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT notifications_active FROM users WHERE id = ?', [id]);
        if (users.length > 0) {
            res.json({ success: true, notifications_active: users[0].notifications_active });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
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

app.listen(PORT, () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
    console.log(`📡 Access via http://127.0.0.1:${PORT}`);
});

