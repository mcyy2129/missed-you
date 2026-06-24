import type { Metadata, Viewport } from "next";
import AppProvider from "@/lib/store";
import ThemeBackground from "@/components/ui/ThemeBackground";
import PointerCaptureFix from "@/components/ui/PointerCaptureFix";
import GlobalDanmaku from "@/components/entertainment/GlobalDanmaku";
import { MusicProvider } from "@/components/blog/MusicProvider";
import GlobalMusicPlayer from "@/components/blog/GlobalMusicPlayer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Missed You - 真诚交友平台",
  description: "一个专注于真诚交友的平台，帮助你找到志同道合的朋友",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Missed You',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="preload" href="/bg.png" as="image" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col film-grain">
        <PointerCaptureFix />
        <AppProvider>
          <ThemeBackground />
          <MusicProvider>
            {children}
            <GlobalMusicPlayer />
          </MusicProvider>
          <GlobalDanmaku />
        </AppProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
