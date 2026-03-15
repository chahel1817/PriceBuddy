/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#060b13",
                foreground: "#ffffff",
                brand: {
                    cyan: "#00e5ff",
                    bg: "#060b13",
                    card: "#0c1523",
                    border: "#1e293b",
                },
            },
        },
    },
    plugins: [],
};
