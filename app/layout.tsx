import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Aiman Mengesha — A universe of ideas",
  description:
    "An interactive universe of software by Aiman Mengesha. Explore developer tools, operational software, and sports analytics, one planet at a time.",
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#080b09" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=gambetta@400,401&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
