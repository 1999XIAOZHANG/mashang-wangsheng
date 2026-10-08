import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "码上往生 · 给代码一场体面的葬礼",
  description:
    "验尸、致悼、火化、投胎，一条龙。多家 AI 殡葬师同题竞写悼词，你票选谁最有资格送它走。",
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-ink-950 font-serif text-stele-light antialiased">
        {children}
      </body>
    </html>
  );
}
