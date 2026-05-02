import "./globals.css";

import ClientWrapper from "@/components/ClientWrapper";

export const metadata = {
  title: "PriceBuddy | Global Price Intelligence",
  description: "Monitor, track and analyze product prices globally.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-cyan selection:text-brand-bg">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
