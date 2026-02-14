import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Swapped Geist for Outfit
import "./globals.css";
import Providers from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit", // Use a variable for Tailwind integration
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hill Top Resort",
  description: "Advanced Restaurant & Logistics Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
