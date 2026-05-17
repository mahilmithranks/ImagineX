import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImagineX — AI Generative Media Workspace",
  description:
    "Generate production-quality visuals from natural language. Iterate, tweak, and build your creative output with AI.",
  keywords: ["AI image generation", "generative AI", "text to image", "FLUX", "creative workspace"],
  openGraph: {
    title: "ImagineX — AI Generative Media Workspace",
    description: "Generate production-quality visuals from natural language.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="font-sans text-[#ededfc] antialiased min-h-screen"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          <main className="relative">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
