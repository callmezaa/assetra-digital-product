import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assetra | Digital Marketplace",
  description: "A premium digital product marketplace for selling and downloading assets.",
};

import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme={false}
        >
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <PageTransition>
              <main className="flex-1">
                {children}
              </main>
            </PageTransition>
            <Toaster position="top-center" />
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
