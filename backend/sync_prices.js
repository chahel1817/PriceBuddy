const pool = require('./db');
const axios = require('axios');
const cheerio = require('cheerio');
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const AMAZON_DOMAIN = process.env.AMAZON_DOMAIN || 'amazon.in';

let USD_TO_INR = 85.5;
let lastExchangeRateFetch = 0;

async function getUsdToInr() {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    if (Date.now() - lastExchangeRateFetch < SIX_HOURS) return USD_TO_INR;
    try {
        const { data } = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
        if (data?.rates?.INR) {
            USD_TO_INR = data.rates.INR;
            lastExchangeRateFetch = Date.now();
            console.log(`💱 Exchange rate updated: 1 USD = ₹${USD_TO_INR}`);
        }
    } catch (e) {
        console.warn('⚠️ Failed to fetch exchange rate, using cached:', USD_TO_INR);
    }
    return USD_TO_INR;
}

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
    const asin = getAmazonAsin(url);
    const hostname = getHostname(url) || 'amazon.com';
    // Preferred domain for local INR prices
    const preferredDomain = AMAZON_DOMAIN || hostname;

    // Helper to extract price from SerpApi response
    function extractPrice(data) {
        const results = data?.product_results;
        if (!results) return null;
        const priceStr = results.price;
        const currency = results.currency || '';
        const priceVal = results.price?.value ||
            (typeof results.price === 'number' ? results.price : null) ||
            (results.price?.replace ? parseFloat(results.price.replace(/[^\d.]/g, '')) : null);
        if (!priceVal) return null;
        const isInr = preferredDomain.endsWith('.in') ||
            (priceStr && String(priceStr).includes('₹')) ||
            currency.toUpperCase() === 'INR';
        return { price: parseFloat(priceVal), isInr };
    }

    if (SERPAPI_KEY && asin) {
        // Step 1: Try preferred domain (amazon.in) for direct INR price
        try {
            console.log(`  🔍 Trying ${preferredDomain} for ASIN ${asin}...`);
            const { data } = await axios.get('https://serpapi.com/search.json', {
                params: { api_key: SERPAPI_KEY, engine: 'amazon_product', amazon_domain: preferredDomain, asin },
                timeout: 10000
            });
            const result = extractPrice(data);
            if (result) {
                console.log(`  ✅ Found on ${preferredDomain}: ₹${result.price}`);
                return result;
            }
        } catch (e) {
            console.warn(`  ⚠️ ${preferredDomain} lookup failed:`, e.response?.data?.error || e.message);
        }

        // Step 2: Fallback to original domain (amazon.com) if ASIN not found on preferred
        if (preferredDomain !== hostname) {
            try {
                console.log(`  🔄 Falling back to ${hostname} for ASIN ${asin}...`);
                const { data } = await axios.get('https://serpapi.com/search.json', {
                    params: { api_key: SERPAPI_KEY, engine: 'amazon_product', amazon_domain: hostname, asin },
                    timeout: 10000
                });
                const results = data?.product_results;
                const priceStr = results?.price;
                const priceVal = results?.price?.value ||
                    (typeof results?.price === 'number' ? results.price : null) ||
                    (results?.price?.replace ? parseFloat(results.price.replace(/[^\d.]/g, '')) : null);
                if (priceVal) {
                    // Price from amazon.com is in USD
                    console.log(`  ✅ Found on ${hostname}: $${priceVal} (will convert to INR)`);
                    return { price: parseFloat(priceVal), isInr: false };
                }
            } catch (e) {
                console.error(`  ❌ ${hostname} fallback also failed:`, e.response?.data?.error || e.message);
            }
        }
    }

    // Fallback to HTML scrape
    const genericPrice = await scrapeGeneric(url);
    if (genericPrice) {
        return { price: genericPrice, isInr: hostname.endsWith('.in') };
    }
    return null;
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
    const genericPrice = await scrapeGeneric(url);
    if (genericPrice) {
        return { price: genericPrice, isInr: host.endsWith('.in') };
    }
    return null;
}

(async () => {
    try {
        const [rows] = await pool.query('SELECT id, product_url FROM product_sources');
        console.log(`Found ${rows.length} products to sync.`);

        const rate = await getUsdToInr();

        for (const row of rows) {
            console.log(`Checking: ${row.product_url}`);
            const result = await scrapeByUrl(row.product_url);

            if (result && result.price) {
                let finalPrice = result.price;
                const hostname = getHostname(row.product_url) || '';
                const isLocalStore = hostname.endsWith('.in');
                const alreadyInr = result.isInr || isLocalStore;

                if (!alreadyInr) {
                    finalPrice = parseFloat((result.price * rate).toFixed(2));
                    console.log(`💱 Converted $${result.price} → ₹${finalPrice} (rate: ${rate})`);
                } else {
                    console.log(`🇮🇳 Price already in INR: ₹${finalPrice}`);
                }

                await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [finalPrice, row.id]);
                await pool.query('INSERT IGNORE INTO price_history (product_source_id, price) VALUES (?, ?)', [row.id, finalPrice]);
                console.log(`✅ Updated ${row.id} to ₹${finalPrice}`);
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
