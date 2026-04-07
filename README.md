# PriceBuddy 💹

**PriceBuddy** is a smart price tracking and comparison platform designed to help users save money by monitoring product prices across popular e-commerce platforms like **Amazon** and **eBay**.

![PriceBuddy Dashboard](https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1000)

## 🚀 Key Features

- **Multi-Store Tracking**: Track prices from Amazon and eBay in one place.
- **Price History Charts**: Visualize price trends over time with interactive charts.
- **Target Price Alerts**: Set your desired price and get notified when it drops.
- **Automated Sync**: Background cron jobs keep prices updated every few hours.
- **Currency Conversion**: Automatic conversion of international prices (USD) to INR.
- **Modern UI**: Sleek, responsive dashboard built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Heroicons](https://heroicons.com/)
- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/)
- **Scraping/APIs**: [Axios](https://axios-http.com/), [Cheerio](https://cheerio.js.org/), [SerpApi](https://serpapi.com/) (Amazon), [eBay Find/Browse APIs](https://developer.ebay.com/)

## 📂 Project Structure

```text
pricebuddy/
├── frontend/          # Next.js application
├── backend/           # Express.js server & Database scripts
│   ├── schema.sql     # Database initialization script
│   └── sync_prices.js # Price synchronization script
└── README.md          # Project documentation
```

## ⚙️ Setup & Installation

### 1. Database Setup
Create a MySQL database and run the schema found in `backend/schema.sql`:
```bash
mysql -u your_user -p your_database < backend/schema.sql
```

### 2. Backend Configuration
1. Navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add your credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=pricebuddy
   PORT=5001
   
   # Optional: For better scraping
   SERPAPI_KEY=your_serpapi_key
   EBAY_APP_ID=your_ebay_app_id
   EBAY_CERT_ID=your_ebay_cert_id
   ```
4. Start the server: `node server.js`.

### 3. Frontend Configuration
1. Navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```
4. Start the development server: `npm run dev`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
