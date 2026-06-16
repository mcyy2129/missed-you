'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useApp } from '@/lib/store';
import { User } from '@/lib/types';

interface MatchResult {
  user: User;
  matchScore: number;
  commonInterests: string[];
}

export default function SoulMatchPage() {
  const router = useRouter();
  const { currentUser, users, isLoggedIn } = useApp();
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  const calculateMatchScore = useCallback((user1: User, user2: User): { score: number; commonInterests: string[] } => {
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    
    let score = 0;
    
    // 兴趣匹配度 (40%)
    const maxInterests = Math.max(user1.interests.length, user2.interests.length);
    const interestScore = maxInterests > 0 ? (commonInterests.length / maxInterests) * 40 : 0;
    score += interestScore;
    
    // 年龄接近度 (20%)
    const ageDiff = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 20 - ageDiff * 2);
    score += ageScore;
    
    // 城市相同 (15%)
    if (user1.city === user2.city) {
      score += 15;
    }
    
    // 随机因素 (25%) - Soul风格的随机匹配
    score += Math.random() * 25;
    
    return { score: Math.min(100, Math.round(score)), commonInterests };
  }, []);

  const findRandomMatch = useCallback(() => {
    if (!currentUser || users.length === 0) return null;
    
    const availableUsers = users.filter(u => 
      u.id !== currentUser.id && 
      !matchHistory.some(m => m.user.id === u.id)
    );
    
    if (availableUsers.length === 0) return null;
    
    // 随机选择一个用户
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const matchedUser = availableUsers[randomIndex];
    
    const { score, commonInterests } = calculateMatchScore(currentUser, matchedUser);
    
    return {
      user: matchedUser,
      matchScore: score,
      commonInterests,
    };
  }, [currentUser, users, matchHistory, calculateMatchScore]);

  const startMatching = useCallback(() => {
    setIsMatching(true);
    setMatchResult(null);
    setShowResult(false);
    setNoMatch(false);
    
    // 模拟匹配动画
    setTimeout(() => {
      const result = findRandomMatch();
      if (result) {
        setMatchResult(result);
        setMatchHistory(prev => [...prev, result]);
        setShowResult(true);
      } else {
        setNoMatch(true);
      }
      setIsMatching(false);
    }, 2000);
  }, [findRandomMatch]);

  const handleStartChat = useCallback(() => {
    if (matchResult) {
      router.push(`/chat/${matchResult.user.id}`);
    }
  }, [matchResult, router]);

  const handleSkip = useCallback(() => {
    setShowResult(false);
    setMatchResult(null);
    setNoMatch(false);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-display font-semibold text-brown-800 mb-4">
            请先登录
          </h2>
          <Button onClick={() => router.push('/auth')}>去登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-display font-semibold text-brown-800 mb-2">
            灵魂匹配
          </h1>
          <p className="text-sm text-bronze-500">
            基于兴趣和性格的随机匹配，遇见最懂你的人
          </p>
        </motion.div>

        {/* 匹配按钮 */}
        {!showResult && !isMatching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startMatching}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center cursor-pointer shadow-lg shadow-rose-200 mb-8"
            >
              <div className="text-center text-white">
                <div className="text-4xl mb-2">💫</div>
                <div className="text-sm font-medium">开始匹配</div>
              </div>
            </motion.div>
            
            <p className="text-xs text-slate-400 text-center max-w-xs">
              点击开始，系统将根据你的兴趣和性格为你推荐最合适的灵魂伴侣
            </p>
          </motion.div>
        )}

        {/* 匹配中动画 */}
        <AnimatePresence>
          {isMatching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center mb-8"
              >
                <div className="text-4xl">✨</div>
              </motion.div>
              
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-slate-600"
              >
                正在寻找你的灵魂伴侣...
              </motion.p>
              
              <div className="flex gap-1 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-rose-400"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 没有匹配到用户 */}
        <AnimatePresence>
          {noMatch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="text-5xl mb-4">🤷</div>
              <h3 className="text-lg font-display font-semibold text-brown-800 mb-2">
                暂时没有匹配到
              </h3>
              <p className="text-sm text-bronze-500 mb-6">
                稍后再试试，或者完善你的个人资料提高匹配率
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setNoMatch(false); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  返回
                </button>
                <Button onClick={startMatching}>再试一次</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 匹配结果 */}
        <AnimatePresence>
          {showResult && matchResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              {/* 匹配成功动画 */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-center mb-6"
              >
                <div className="text-5xl mb-3">💕</div>
                <h2 className="text-xl font-display font-semibold text-brown-800">
                  匹配成功！
                </h2>
                <p className="text-sm text-bronze-500 mt-1">
                  匹配度 {matchResult.matchScore}%
                </p>
              </motion.div>

              {/* 用户卡片 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl p-6 shadow-xl w-full max-w-sm mb-6 glass-card border border-white/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar src={matchResult.user.avatar} alt={matchResult.user.name} size="lg" />
                    {matchResult.user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {matchResult.user.name}
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        {matchResult.user.age}岁
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{matchResult.user.city}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {matchResult.user.bio}
                </p>

                {/* 共同兴趣 */}
                {matchResult.commonInterests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">共同兴趣</p>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.commonInterests.map(interest => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 所有兴趣 */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">兴趣爱好</p>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.user.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 w-full max-w-sm"
              >
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  跳过
                </button>
                <Button onClick={handleStartChat} className="flex-1">
                  💬 开始聊天
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 匹配历史 */}
        {matchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12"
          >
            <h3 className="text-sm font-medium text-slate-600 mb-4">
              最近匹配 ({matchHistory.length})
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {matchHistory.slice(-5).reverse().map((match, index) => (
                <motion.div
                  key={match.user.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/chat/${match.user.id}`)}
                  className="flex-shrink-0 w-20 text-center cursor-pointer"
                >
                  <div className="relative mb-2">
                    <Avatar src={match.user.avatar} alt={match.user.name} size="md" />
                    <div className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-rose-500 text-white text-[8px] rounded-full">
                      {match.matchScore}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 truncate">{match.user.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}