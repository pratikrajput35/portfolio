import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pratik Rajput | Creative Designer & Video Editor",
  description: "Professional graphic design and video editing services. Creating stunning visuals that tell your brand story.",
  keywords: "graphic design, video editing, creative services, branding, motion graphics",
  openGraph: {
    title: "Pratik Rajput | Creative Designer & Video Editor",
    description: "Professional graphic design and video editing services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
