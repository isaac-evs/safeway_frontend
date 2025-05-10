'use client'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '../components/layout/navbar'
import Footer from '../components/layout/footer'
import { ThemeProvider } from '../contexts/ThemeContext'
import "./globals.css";
import { usePathname } from 'next/navigation'
import Head from 'next/head'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  
  // Hide navbar and footer on dashboard and news feed
  const hideNavFooter = isDashboard;

  return (
    <html lang="en">
      <head>
        <title>SafeWay - Navigate Safely Through Your City</title>
        <meta name="description" content="SafeWay helps you navigate safely through your city with real-time safety information and incident reports." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {!hideNavFooter && <Navbar />}
          {children}
          {!hideNavFooter && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}
