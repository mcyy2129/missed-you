'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/profile/ProfileCard';
import Button from '@/components/ui/Button';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { isLoggedIn, users } = useApp();
  const router = useRouter();

  return (
    <div className="relative min-h-screen">
      {isLoggedIn ? (
        <>
          <Navbar />

          <main className="mx-auto max-w-lg px-4 pt-20 pb-24">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-display font-semibold text-white mb-1">
                发现新朋友
              </h1>
              <p className="text-sm text-white/50">
                为你推荐志同道合的人
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              {users.map((user) => (
                <motion.div key={user.id} variants={item}>
                  <ProfileCard user={user} />
                </motion.div>
              ))}
            </motion.div>
          </main>

          <BottomNav />
        </>
      ) : (
        <main className="flex flex-col items-center justify-center min-h-screen px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center max-w-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <h1 className="text-5xl font-display font-bold mb-3" style={{ color: '#84cc16', textShadow: '0 0 30px rgba(132, 204, 22, 0.3)' }}>
                Missed You
              </h1>
            </motion.div>
            <p className="text-lg text-white/60 font-serif mb-10">
              真诚交友平台
            </p>

            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={() => router.push('/auth')}
              >
                开始探索
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full"
                onClick={() => router.push('/auth')}
              >
                了解更多
              </Button>
            </div>
          </motion.div>
        </main>
      )}
    </div>
  );
}
