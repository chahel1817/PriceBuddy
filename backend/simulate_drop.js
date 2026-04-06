const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pricebuddy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function simulateDrop() {
    console.log("🧪 Starting PriceBuddy Alert Simulation...");
    console.log("-----------------------------------------");

    if (process.env.EMAIL_USER === 'your-email@gmail.com' || !process.env.EMAIL_PASS) {
        console.error("❌ ERROR: You must update your backend/.env with real EMAIL_USER and EMAIL_PASS first!");
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        // 1. Find the latest product tracked by the user
        const [products] = await pool.query(`
            SELECT s.id, s.last_price, p.name, u.email as user_email, s.product_url
            FROM product_sources s
            JOIN products p ON s.product_id = p.id
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC LIMIT 1
        `);

        if (products.length === 0) {
            console.log("❌ No products found. Please add a product first inside the PriceBuddy Dashboard!");
            process.exit(0);
        }

        const product = products[0];
        const oldPrice = parseFloat(product.last_price || 100);
        const newPrice = (oldPrice * 0.9).toFixed(2); // Simulate a 10% drop

        // Detect Store
        const url = product.product_url.toLowerCase();
        const isAmazon = url.includes('amazon');
        const isEbay = url.includes('ebay');
        const store = isAmazon ? 'Amazon' : (isEbay ? 'eBay' : 'Store');
        const themeColor = isAmazon ? '#FF9900' : (isEbay ? '#00E5FF' : '#2874f0');
        const storeLogo = isAmazon
            ? "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
            : (isEbay ? "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg" : null);

        console.log(`🔍 Found latest product: "${product.name}"`);
        console.log(`📉 Owner: ${product.user_email}`);
        console.log(`💰 Simulating Price Drop: ₹${oldPrice} -> ₹${newPrice}`);

        // 2. Update Database to record this fake drop
        console.log("💾 Updating database history...");
        await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [newPrice, product.id]);
        await pool.query('INSERT INTO price_history (product_source_id, price) VALUES (?, ?)', [product.id, newPrice]);

        // 3. Trigger Email Alert
        console.log("📨 Sending Alert Email...");
        const mailOptions = {
            from: `"PriceBuddy ${store} Simulation" <${process.env.EMAIL_USER}>`,
            to: product.user_email,
            subject: `📉 ${store} PRICE DROP SIMULATION: ${product.name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; margin: 0; background-color: #f9f9f9;">
                    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee;">
                        <div style="background: ${themeColor}; padding: 30px; text-align: center;">
                            ${storeLogo ? `<img src="${storeLogo}" alt="${store}" style="height: 40px; filter: brightness(0) invert(1);" />` : `<h1 style="color: white; margin: 0;">${store}</h1>`}
                            <h2 style="color: white; margin-top: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Simulation: Price Drop!</h2>
                        </div>
                        <div style="padding: 40px 30px;">
                            <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello, this is a <strong>Simulation</strong> of a price drop on <strong>${store}</strong>:</p>
                            <div style="margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 10px; border: 1px solid #dcfce7;">
                                <h3 style="margin: 0 0 15px 0; color: #111; font-size: 18px;">${product.name}</h3>
                                <div style="display: flex; align-items: baseline; gap: 15px;">
                                    <span style="font-size: 28px; font-weight: 900; color: #16a34a;">₹${newPrice}</span>
                                    <span style="font-size: 18px; color: #94a3b8; text-decoration: line-through; margin-left: 10px;">₹${oldPrice}</span>
                                </div>
                                <p style="color: #16a34a; font-weight: bold; margin: 10px 0 0 0; font-size: 14px;">⚡ 10% Savings simulated!</p>
                            </div>
                            <div style="text-align: center; margin-top: 35px;">
                                <a href="${product.product_url}" style="display: inline-block; padding: 16px 35px; background: ${themeColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px ${themeColor}44;">Check on ${store}</a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Simulation Successful! Email sent:", info.messageId);
        console.log("Check your inbox (and spam folder) for the notification!");

    } catch (e) {
        console.error("❌ Simulation Failed:", e.message);
        if (e.message.includes('Invalid login')) {
            console.log("💡 TIP: Make sure you are using a 'Google App Password', not your regular login password!");
        }
    } finally {
        process.exit();
    }
}

simulateDrop();
