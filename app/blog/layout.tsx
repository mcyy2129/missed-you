import 'katex/dist/katex.min.css';
import "./globals.css";
import { ThemeProvider } from "@/components/blog/ThemeProvider";
import MusicPlayerBar from "@/components/blog/MusicPlayerBar";
import { siteConfig } from "@/siteConfig_blog";
import ClickEffect from "@/components/blog/ClickEffect";
import GlobalToolbox from "@/components/blog/GlobalToolbox";
import CyberCat from '@/components/blog/CyberCat';
import MobileBackButton from '@/components/blog/MobileBackButton';
import BackToMain from './BackToMain';
import MouseTrail from '@/components/blog/MouseTrail';
import AnimeParticles from '@/components/blog/AnimeParticles';

export const metadata = {
  title: siteConfig.title,
  description: siteConfig.bio,
};

export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
        <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#0a1a1a' }}>

          {/* Full background image */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${siteConfig.bgImages[0]})` }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a1a]/70 via-[#0a1a1a]/50 to-[#0a1a1a]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a1a]/60 via-transparent to-[#0a1a1a]/60" />
          </div>

          {/* Floating anime particles */}
          <AnimeParticles />

          {/* Mouse trail effect */}
          <MouseTrail />

          {/* Ambient glow orbs */}
          <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
            <div className="absolute bottom-[20%] left-[30%] w-[250px] h-[250px] rounded-full bg-cyan-500/5 blur-[80px] animate-pulse" style={{ animationDuration: '10s' }} />
          </div>

          <BackToMain />
          <div className="relative z-10 pb-16">{children}</div>
          <MusicPlayerBar />
          <GlobalToolbox />
          <MobileBackButton />
          <ClickEffect />
          <CyberCat />
        </div>
    </ThemeProvider>
  );
}
