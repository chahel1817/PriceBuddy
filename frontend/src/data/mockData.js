export const priceHistoryData = [
    { name: 'Jan 1', price: 300, avg: 310 },
    { name: 'Jan 8', price: 285, avg: 305 },
    { name: 'Jan 15', price: 290, avg: 315 },
    { name: 'Jan 22', price: 280, avg: 300 },
    { name: 'Jan 29', price: 275, avg: 295 },
    { name: 'Feb 5', price: 270, avg: 285 },
    { name: 'Feb 12', price: 260, avg: 280 },
];

export const categoryTrendData = [
    { name: 'Week 1', trend: 1200 },
    { name: 'Week 2', trend: 1150 },
    { name: 'Week 3', trend: 1250 },
    { name: 'Week 4', trend: 1100 },
    { name: 'Week 5', trend: 1050 },
    { name: 'Week 6', trend: 1120 },
];

export const products = [
    {
        id: 1,
        name: 'iPhone 15 Pro Max',
        category: 'Smartphones',
        stores: [
            { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', price: '₹1,59,900', url: 'https://amazon.in', trend: 'up' },
            { name: 'Flipkart', logo: 'https://images.icon-icons.com/729/PNG/512/flipkart_icon-icons.com_62718.png', price: '₹1,56,900', url: 'https://flipkart.com', trend: 'down' },
            { name: 'Croma', logo: 'https://cdn.brandfetch.io/domain/croma.com/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed', price: '₹1,59,900', url: 'https://croma.com', trend: 'neutral' }
        ],
        price: '₹1,56,900',
        change: '-7.7%',
        trend: 'down',
        updated: '2 hours ago',
        productImage: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRKj8NxFZGTq2Duw3kub7bAM6b-7zsd_1oF5GkGsknP4ex-A8Dk",
    },
    {
        id: 2,
        name: 'Sony WH-1000XM5',
        category: 'Audio',
        stores: [
            { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', price: '₹29,990', url: 'https://amazon.in', trend: 'down' },
            { name: 'Reliance Digital', logo: 'https://cdn.brandfetch.io/idYe1C76vX/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B', price: '₹31,990', url: 'https://reliancedigital.in', trend: 'up' }
        ],
        price: '₹29,990',
        change: '-12.5%',
        trend: 'down',
        updated: '5 hours ago',
        productImage: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6505/6505727_rd.jpg;maxHeight=1920;maxWidth=900?format=webp",
    },
    {
        id: 3,
        name: 'MacBook Pro 14"',
        category: 'Laptops',
        stores: [
            { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', price: '₹1,69,900', url: 'https://amazon.in', trend: 'up' }
        ],
        price: '₹1,69,900',
        change: '+5.3%',
        trend: 'up',
        updated: '1 day ago',
        productImage: "https://m.media-amazon.com/images/I/61eA9PkZ07L._SX679_.jpg",
    },
    {
        id: 4,
        name: 'Samsung OLED TV 55"',
        category: 'Electronics',
        stores: [
            { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', price: '₹1,24,990', url: 'https://amazon.in', trend: 'down' },
            { name: 'Flipkart', logo: 'https://images.icon-icons.com/729/PNG/512/flipkart_icon-icons.com_62718.png', price: '₹1,22,990', url: 'https://flipkart.com', trend: 'down' }
        ],
        price: '₹1,22,990',
        change: '-7.1%',
        trend: 'down',
        updated: '3 hours ago',
        productImage: "https://i5.walmartimages.com/seo/SAMSUNG-48-Class-S90D-OLED-Smart-TV-QN48S90DAEXZA-2024_c03d5884-29bc-49cd-9da6-dcac3c780ac6.e561d81669b03b7c72f69dfa7ea4692e.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
    },
    {
        id: 5,
        name: 'Nike Air Max 270',
        category: 'Footwear',
        stores: [
            { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', price: '₹12,495', url: 'https://amazon.in', trend: 'down' }
        ],
        price: '₹12,495',
        change: '-16.7%',
        trend: 'down',
        updated: '6 hours ago',
        productImage: "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e074bb24-56a7-44f1-b0a4-7d59a9ff16cd/AIR+MAX+270.png",
    },
];

export const alerts = [
    {
        id: 1,
        productId: 1,
        name: 'iPhone 15 Pro Max',
        productImage: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRKj8NxFZGTq2Duw3kub7bAM6b-7zsd_1oF5GkGsknP4ex-A8Dk",
        targetPrice: '₹1,50,000',
        currentPrice: '₹1,56,900',
        status: 'Active',
        lastChecked: '2 hours ago',
        notificationType: 'Email'
    },
    {
        id: 2,
        productId: 2,
        name: 'Sony WH-1000XM5',
        productImage: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6505/6505727_rd.jpg;maxHeight=1920;maxWidth=900?format=webp",
        targetPrice: '₹28,000',
        currentPrice: '₹29,990',
        status: 'Waiting',
        lastChecked: '5 hours ago',
        notificationType: 'Browser'
    },
    {
        id: 3,
        productId: 4,
        name: 'Samsung OLED TV 55"',
        productImage: "https://i5.walmartimages.com/seo/SAMSUNG-48-Class-S90D-OLED-Smart-TV-QN48S90DAEXZA-2024_c03d5884-29bc-49cd-9da6-dcac3c780ac6.e561d81669b03b7c72f69dfa7ea4692e.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF",
        targetPrice: '₹1,20,000',
        currentPrice: '₹1,22,990',
        status: 'Triggered',
        lastChecked: '1 day ago',
        notificationType: 'Push'
    }
];
