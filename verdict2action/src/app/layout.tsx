import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verdict 2 Action — From Legal Text to Action Plans",
  description:
    "AI-powered decision support system for government departments. Convert complex court judgment PDFs into clear, actionable, and verified decisions.",
  keywords: ["court judgments", "AI", "government", "legal", "action plans", "compliance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {/* Fixed background layer */}
        <div className="fixed inset-0 -z-10">
          <img
            src="/supreme-court.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 min-h-screen text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
