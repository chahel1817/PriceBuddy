const pool = require('./db');
const axios = require('axios');
const cheerio = require('cheerio');
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

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

const getHostname = (value) => {
    if (!value) return null;
    try {
        const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
        return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
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

async function scrapeAmazonPrice(url) {
    try {
        const asin = getAmazonAsin(url);
        const hostname = getHostname(url) || 'amazon.com';

        if (SERPAPI_KEY && asin) {
            const serpUrl = 'https://serpapi.com/search.json';
            const params = {
                api_key: SERPAPI_KEY,
                amazon_domain: hostname,
                type: 'product',
                asin
            };
            const { data } = await axios.get(serpUrl, { params, timeout: 10000 });
            const value = data?.product_results?.price?.value;
            if (value) return parseFloat(value);
        }
    } catch (e) {
        console.error("Amazon SerpApi error:", e.message);
    }

    // Fallback to HTML
    return scrapeGeneric(url);
}

async function scrapeFlipkartPrice(url) {
    return scrapeGeneric(url);
}

async function scrapeGeneric(url) {
    try {
        const { data } = await fetchHtml(url);
        const $ = cheerio.load(data);
        const priceText =
            $('.x-price-primary').text() ||
            $('#prcIsum').text() ||
            $('.x-price-approx__price').text() ||
            $('._30jeq3._16Jk6d').text() ||
            $('._25b18c ._30jeq3').text() ||
            $('[itemprop="price"]').attr('content');
        if (!priceText) return null;
        const cleanPrice = priceText.replace(/[^\d.]/g, '');
        return cleanPrice ? parseFloat(cleanPrice) : null;
    } catch (e) {
        console.error("Scrape error for", url, e.message);
        return null;
    }
}

async function scrapeByUrl(url) {
    const host = getHostname(url) || '';
    if (host.includes('amazon.')) return scrapeAmazonPrice(url);
    if (host.includes('flipkart.')) return scrapeFlipkartPrice(url);
    return scrapeGeneric(url);
}

(async () => {
    try {
        const [rows] = await pool.query('SELECT id, product_url FROM product_sources');
        console.log(`Found ${rows.length} products to sync.`);

        for (const row of rows) {
            console.log(`Checking: ${row.product_url}`);
            const price = await scrapeByUrl(row.product_url);
            if (price) {
                await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [price, row.id]);
                // Clear and re-add initial history if needed, or just add one entry
                await pool.query('INSERT IGNORE INTO price_history (product_source_id, price) VALUES (?, ?)', [row.id, price]);
                console.log(`✅ Updated ${row.id} to ₹${price}`);
            } else {
                console.log(`❌ Failed to fetch price for ${row.id}`);
            }
        }
    } catch (err) {
        console.error("Sync error:", err);
    } finally {
        process.exit();
    }
})();
