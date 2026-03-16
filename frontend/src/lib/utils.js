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
            name: 'Flipkart',
            domains: ['flipkart.com', 'fkrt.it'],
            logo: 'https://images.icon-icons.com/729/PNG/512/flipkart_icon-icons.com_62718.png'
        },
        {
            name: 'Croma',
            domains: ['croma.com'],
            logo: 'https://cdn.brandfetch.io/domain/croma.com/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed'
        },
        {
            name: 'Reliance Digital',
            domains: ['reliancedigital.in'],
            logo: 'https://cdn.brandfetch.io/idYe1C76vX/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B'
        },
        {
            name: 'Myntra',
            domains: ['myntra.com'],
            logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png'
        },
        {
            name: 'Ajio',
            domains: ['ajio.com'],
            logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Ajio_Logo.svg'
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

