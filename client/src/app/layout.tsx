import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",        // prevents invisible text during font load
  preload: true,
});

export const metadata: Metadata = {
  title: "Pratik Rajput | Creative Designer & Video Editor",
  description: "Professional graphic design and video editing services. Creating stunning visuals that tell your brand story.",
  keywords: "graphic design, video editing, creative services, branding, motion graphics",
  openGraph: {
    title: "Pratik Rajput | Creative Designer & Video Editor",
    description: "Professional graphic design and video editing services.",
    type: "website",
  },
  verification: {
    google: "rMaFF4DU_l6AU1aGcjuz3zzt-NIgOgnguu9qnl9gwDs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── Preconnect to external media origins for faster first load ── */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://drive.google.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS-prefetch as fallback for older browsers */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased relative`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid #f97316",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
