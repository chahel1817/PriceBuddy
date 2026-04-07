import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getStoreFromUrl(url) {
    if (!url) return null;

    const stores = [
        {
            name: 'Amazon',
            domains: ['amazon.in', 'amazon.com', 'amzn.to', 'amzn.in'],
            logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'
        },
        {
            name: 'eBay',
            domains: ['ebay.com', 'ebay.in', 'ebay.co.uk'],
            logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg'
        }
    ];

    try {
        const domain = new URL(url).hostname.toLowerCase();
        return stores.find(store =>
            store.domains.some(d => domain.includes(d))
        ) || null;
    } catch (e) {
        // Fallback for incomplete URLs while typing
        const lowercaseUrl = url.toLowerCase();
        return stores.find(store =>
            store.domains.some(d => lowercaseUrl.includes(d))
        ) || null;
    }
}

