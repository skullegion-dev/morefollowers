import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoreFollowers – Get More Followers Instantly",
  description:
    "Buy real followers, likes & views for Instagram, TikTok, YouTube, Facebook, Spotify & more. Pay with M-Pesa, Stripe, PayPal or Crypto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="min-h-screen flex flex-col w-full">
              <Navbar />
              <main className="flex-1 w-full flex justify-center">
                <div className="w-full max-w-7xl">{children}</div>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>

        {/* Replace with your real Google Analytics ID */}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}