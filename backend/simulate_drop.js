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

        console.log(`🔍 Found latest product: "${product.name}"`);
        console.log(`📉 Owner: ${product.user_email}`);
        console.log(`💰 Simulating Price Drop: $${oldPrice} -> $${newPrice}`);

        // 2. Update Database to record this fake drop
        console.log("💾 Updating database history...");
        await pool.query('UPDATE product_sources SET last_price = ? WHERE id = ?', [newPrice, product.id]);
        await pool.query('INSERT INTO price_history (product_source_id, price) VALUES (?, ?)', [product.id, newPrice]);

        // 3. Trigger Email Alert
        console.log("📨 Sending Alert Email...");
        const mailOptions = {
            from: `"PriceBuddy Simulation" <${process.env.EMAIL_USER}>`,
            to: product.user_email,
            subject: `📉 PRICE DROP ALERT: ${product.name} just got cheaper!`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #00E5FF; border-radius: 10px;">
                    <h2 style="color: #00E5FF;">Simulation: Price Drop Detected!</h2>
                    <p>PriceBuddy found a great deal on your item:</p>
                    <h3>${product.name}</h3>
                    <p style="font-size: 18px;">
                        Old Price: <span style="text-decoration: line-through; color: #888;">$${oldPrice}</span><br />
                        <b>New Price: <span style="color: #10b981;">$${newPrice}</span></b>
                    </p>
                    <a href="${product.product_url}" style="display: inline-block; padding: 10px 20px; background: #00E5FF; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Check on eBay</a>
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
