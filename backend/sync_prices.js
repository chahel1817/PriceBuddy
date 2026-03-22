const pool = require('./db');
const axios = require('axios');
const cheerio = require('cheerio');

async function scrape(url) {
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const priceText = $('.x-price-primary').text() || $('#prcIsum').text() || $('.x-price-approx__price').text();
        if (!priceText) return null;
        const cleanPrice = priceText.replace(/[^\d.]/g, '');
        return cleanPrice ? parseFloat(cleanPrice) : null;
    } catch (e) {
        console.error("Scrape error for", url, e.message);
        return null;
    }
}

(async () => {
    try {
        const [rows] = await pool.query('SELECT id, product_url FROM product_sources');
        console.log(`Found ${rows.length} products to sync.`);

        for (const row of rows) {
            console.log(`Checking: ${row.product_url}`);
            const price = await scrape(row.product_url);
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
