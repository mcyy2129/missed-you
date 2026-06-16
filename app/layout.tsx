import type { Metadata } from "next";
import AppProvider from "@/lib/store";
import GlobalDanmaku from "@/components/entertainment/GlobalDanmaku";
import "./globals.css";

export const metadata: Metadata = {
  title: "Missed You - 真诚交友平台",
  description: "一个专注于真诚交友的平台，帮助你找到志同道合的朋友",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col film-grain">
        <AppProvider>{children}<GlobalDanmaku /></AppProvider>
      </body>
    </html>
  );
}
