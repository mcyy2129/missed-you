// @ts-nocheck
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

import Navbar from '@/components/blog/Navbar';
import PageTransition from '@/components/blog/PageTransition';
import { siteConfig } from '@/siteConfig_blog';
import CloudPlayer from '@/components/blog/CloudPlayer';
import ProfileCard from '@/components/blog/ProfileCard';
import SiteDashboard from '@/components/blog/SiteDashboard';
import { albums } from '@/data/blog/albums';
import { ToastProvider } from '@/components/blog/ToastProvider';
import LatestPostsCarousel from '@/components/blog/LatestPostsCarousel';
import LatestChatterCarousel from '@/components/blog/LatestChatterCarousel';
import QuickTools from '@/components/blog/QuickTools';
import AnimeStats from '@/components/blog/AnimeStats';

function formatUpdateTime(dateString: string) {
  if (!dateString || dateString === '1970-01-01') return '刚刚更新';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    if (hours === '00' && mins === '00') return `${d.getFullYear()}.${month}.${day}`;
    return `${d.getFullYear()}.${month}.${day} ${hours}:${mins}`;
  } catch { return dateString; }
}

export default function Home() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let allPosts: any[] = [];
  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));
      allPosts = fileNames.map(fileName => {
        const fullPath = path.join(postsDirectory, fileName);
        const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
        const rawDate = data.date || '1970-01-01';
        return { slug: fileName.replace(/\.md$/, ''), ...data, title: data.title || '', description: data.description || '', content: content || '', date: rawDate, formattedDate: formatUpdateTime(rawDate) };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (e) {}
  const top5Posts = allPosts.length > 0 ? allPosts.slice(0, 5) : [{ slug: 'none', title: '暂无文章', description: '快去写第一篇吧！', cover: siteConfig.defaultPostCover, date: '', formattedDate: '' }];

  const chattersDirectory = path.join(process.cwd(), 'chatters');
  let allChatters: any[] = [];
  try {
    if (fs.existsSync(chattersDirectory)) {
      const chatterFiles = fs.readdirSync(chattersDirectory).filter(f => f.endsWith('.md'));
      allChatters = chatterFiles.map(fileName => {
        const fullPath = path.join(chattersDirectory, fileName);
        const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
        const rawDate = data.date || '1970-01-01';
        const cover = data.cover || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop';
        return { slug: fileName.replace(/\.md$/, ''), title: data.title || '碎片记录', description: data.description || content.substring(0, 60), cover, date: rawDate, formattedDate: formatUpdateTime(rawDate) };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (e) {}
  const top5Chatters = allChatters.length > 0 ? allChatters.slice(0, 5) : [{ slug: 'none', title: '暂无记录', description: '记录一段思绪...', cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop', date: '', formattedDate: '' }];

  const chatterCount = allChatters.length;
  const realPhotoCount = albums.reduce((total, album) => total + album.photos.length, 0);
  const latestAlbum = albums.length > 0 ? albums[0] : { id: '', title: '照片墙', description: '查看摄影', cover: siteConfig.photoWallImage, date: '' };

  return (
    <ToastProvider>
      <div className="min-h-screen relative pb-10">
        <Navbar />
        <PageTransition>
          <div className="w-full max-w-6xl mx-auto mt-24 sm:mt-28 px-4 sm:px-6 lg:px-10 relative z-10">

            <main className="flex flex-col gap-5 w-full mt-6">

              {/* Row 1: Profile + Player */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                <div className="col-span-1 lg:col-span-7 flex flex-col">
                  <ProfileCard postCount={allPosts.length} chatterCount={chatterCount} photoCount={realPhotoCount} />
                </div>
                <div className="col-span-1 lg:col-span-5 flex flex-col">
                  <CloudPlayer />
                </div>
              </div>

              {/* Row 2: Quick Tools */}
              <QuickTools />

              {/* Row 3: Stats */}
              <AnimeStats postCount={allPosts.length} chatterCount={chatterCount} photoCount={realPhotoCount} buildDate={siteConfig.buildDate} />

              {/* Row 4: Posts + PhotoWall + Chatter */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                <div className="col-span-1 lg:col-span-4 flex flex-col min-h-[300px]">
                  <LatestPostsCarousel posts={top5Posts} />
                </div>
                <div className="col-span-1 lg:col-span-8 flex flex-col gap-5">
                  <Link href="/blog/photowall" className="w-full rounded-[20px] overflow-hidden transition-all duration-700 hover:scale-[1.01] relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0 glass-card">
                    <img src={latestAlbum.cover} className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a]/80 via-[#0a1a1a]/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-6">
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 gradient-text">{latestAlbum.title}</h3>
                      <p className="text-white/70 text-sm sm:text-lg line-clamp-1">{latestAlbum.description}</p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full flex-1">
                    <div className="sm:col-span-2 flex flex-col min-h-[200px]">
                      <LatestChatterCarousel chatters={top5Chatters} />
                    </div>
                    <div className="sm:col-span-1 flex flex-col min-h-[120px]">
                      <SiteDashboard />
                    </div>
                  </div>
                </div>
              </div>

            </main>
          </div>
        </PageTransition>
      </div>
    </ToastProvider>
  );
}
