'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';
import BottomNav from '@/components/layout/BottomNav';

export default function SearchUserPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchCode.trim()) return;
    
    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/users/search?code=${searchCode.trim().toUpperCase()}`);
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '用户不存在');
        return;
      }

      const user = await res.json();
      setSearchResult(user);
    } catch (err) {
      setError('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (searchResult) {
      router.push(`/user/${searchResult.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/60"
      >
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 h-12">
          <button
            onClick={() => router.back()}
            className="p-1 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-medium text-slate-800">搜索用户</h1>
        </div>
      </motion.header>

      <main className="pt-16 pb-24 px-4 max-w-lg mx-auto">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4"
        >
          <p className="text-sm text-slate-600 mb-3">输入对方的邀请码添加好友</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="输入8位邀请码"
              maxLength={8}
              className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-center font-mono text-lg tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={loading || !searchCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '搜索'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Result */}
        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={searchResult.avatar} alt={searchResult.name} size="lg" />
                  {searchResult.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-800">{searchResult.name}</h3>
                  <p className="text-xs text-slate-500">{searchResult.city} · {searchResult.age}岁</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{searchResult.userCode}</p>
                </div>
              </div>

              {searchResult.bio && (
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">{searchResult.bio}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleViewProfile}
                className="w-full mt-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                查看主页
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My User Code */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100"
          >
            <p className="text-sm text-slate-600 mb-2">我的邀请码</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-rose-500 tracking-widest">
                {(currentUser as any).userCode || '加载中...'}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const code = (currentUser as any).userCode;
                  if (code) {
                    navigator.clipboard.writeText(code);
                    alert('邀请码已复制');
                  }
                }}
                className="px-4 py-2 bg-white text-rose-500 rounded-xl text-sm font-medium border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                复制
              </motion.button>
            </div>
            <p className="text-xs text-slate-500 mt-2">分享给好友，让他们输入邀请码添加你</p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
