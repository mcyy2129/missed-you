'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import InterestTags from '@/components/profile/InterestTags';
import PhotoGrid from '@/components/profile/PhotoGrid';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { currentUser, getUser, matchedUsers } = useApp();
  const [photos, setPhotos] = useState<string[]>([]);

  const isOwn = !id || id === 'current';
  const user = isOwn ? currentUser : getUser(id);

  useEffect(() => {
    if (user) {
      setPhotos(user.photos || []);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 pt-20 pb-28 flex flex-col items-center justify-center">
          <p className="text-sm text-white/50">用户不存在</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isMatched = matchedUsers.has(user.id);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-semibold text-white">
              {isOwn ? '我的主页' : '个人资料'}
            </h1>
          </div>

          <div className="glass-card rounded-card p-6 shadow-md mb-6 border border-white/10">
            <div className="flex items-center gap-5 mb-4">
              <motion.div
                whileHover={isOwn ? { scale: 1.05 } : {}}
                whileTap={isOwn ? { scale: 0.95 } : {}}
                onClick={isOwn ? () => router.push('/douyin') : undefined}
                className={isOwn ? 'cursor-pointer' : ''}
              >
                <Avatar src={user.avatar} alt={user.name} size="xl" />
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user.name}
                  <span className="text-sm font-normal text-white/50 ml-2">{user.age}岁</span>
                </h2>
                <p className="text-sm text-white/60 mt-0.5">{user.city}</p>
              </div>
            </div>

            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {user.bio}
            </p>

            <InterestTags interests={user.interests} />

            {isOwn && user.userCode && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-white/40 mb-1">我的邀请码</p>
                <p className="text-lg font-mono font-semibold text-white tracking-wider">{user.userCode}</p>
              </div>
            )}

            {isOwn && (
              <div className="flex gap-3 mt-5">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => router.push('/profile/edit')}
                >
                  编辑资料
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => router.push('/settings')}
                >
                  设置
                </Button>
              </div>
            )}

            {!isOwn && (
              <div className="flex gap-3 mt-5">
                <Button variant="primary" size="md" className="flex-1">
                  {isMatched ? '发消息' : '喜欢'}
                </Button>
                <Button variant="secondary" size="md" className="flex-1" onClick={() => router.back()}>
                  返回
                </Button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">相册</h3>
            <PhotoGrid 
              photos={photos} 
              editable={isOwn} 
              onPhotosChange={isOwn ? setPhotos : undefined}
            />
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <p className="text-sm text-white/50">加载中...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
