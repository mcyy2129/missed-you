'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';
import InterestTags from '@/components/profile/InterestTags';
import PhotoGrid from '@/components/profile/PhotoGrid';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, getUser, conversations, createConversation } = useApp();
  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAI, setIsAI] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      const isAIPersona = id.startsWith('ai-');
      setIsAI(isAIPersona);

      try {
        if (isAIPersona) {
          const res = await fetch('/api/admin/ai-personas');
          const personas = await res.json();
          const found = personas.find((p: any) => p.id === id);
          if (found) {
            setUser({
              id: found.id,
              name: found.name,
              age: found.age,
              city: found.city,
              avatar: found.avatar,
              bio: found.bio,
              interests: found.interests,
              photos: [],
              isOnline: true,
              personality: found.personality,
              greeting: found.greeting,
              skillId: found.skillId,
              skillIds: found.skillIds || (found.skillId ? [found.skillId] : []),
            });
            const followedAI = JSON.parse(localStorage.getItem('followedAI') || '[]');
            setIsFollowing(followedAI.includes(id));
          }
        } else {
          const res = await fetch('/api/admin/users');
          const users = await res.json();
          const found = users.find((u: any) => u.id === id);
          if (found) {
            setUser(found);
            setFollowers(found.followers || []);
            setFollowing(found.following || []);
            setIsFollowing(found.followers?.includes(currentUser?.id) || false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, currentUser?.id]);

  const handleFollow = async () => {
    if (!currentUser || !user) return;

    if (isAI) {
      const newFollowing = !isFollowing;
      setIsFollowing(newFollowing);
      const followedAI = JSON.parse(localStorage.getItem('followedAI') || '[]');
      if (newFollowing) {
        if (!followedAI.includes(user.id)) {
          followedAI.push(user.id);
        }
      } else {
        const idx = followedAI.indexOf(user.id);
        if (idx > -1) followedAI.splice(idx, 1);
      }
      localStorage.setItem('followedAI', JSON.stringify(followedAI));
      return;
    }

    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetUserId: user.id, 
          action: isFollowing ? 'unfollow' : 'follow' 
        }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowers(prev => 
          isFollowing 
            ? prev.filter(id => id !== currentUser.id)
            : [...prev, currentUser.id]
        );
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser || !user) return;

    const existingConv = conversations.find(c => 
      !c.isGroup && 
      c.participants.includes(currentUser.id) && 
      c.participants.includes(user.id)
    );

    if (existingConv) {
      router.push(`/chat/${existingConv.id}`);
    } else {
      const newConv = await createConversation(user.id);
      router.push(`/chat/${newConv.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">用户不存在</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100"
      >
        <div className="mx-auto max-w-lg flex items-center justify-between px-4 h-12">
          <button
            onClick={() => router.back()}
            className="p-1 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-800">{user.name}</span>
          <div className="w-8" />
        </div>
      </motion.header>

      {/* Profile Content */}
      <main className="pt-12 pb-20">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-6 pt-8 pb-6"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 opacity-50" />
          
          <div className="relative flex flex-col items-center">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative mb-4"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <Avatar src={user.avatar} alt={user.name} size="xl" className="w-full h-full" />
              </div>
              {isAI && (
                <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-[10px] font-bold rounded-full shadow-sm">
                  AI
                </div>
              )}
              {user.isOnline && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
              )}
            </motion.div>

            {/* Name & Basic Info */}
            <h1 className="text-xl font-bold text-slate-800 mb-1">{user.name}</h1>
            <p className="text-sm text-slate-500 mb-1">{user.city}</p>
            {user.age > 0 && (
              <p className="text-xs text-slate-400">{user.age}岁</p>
            )}
            
            {/* User Code (real users only) */}
            {!isAI && user.userCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 px-3 py-1.5 bg-slate-100 rounded-full flex items-center gap-2"
              >
                <span className="text-xs text-slate-500">邀请码</span>
                <span className="text-sm font-mono font-semibold text-rose-500 tracking-wider">{user.userCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.userCode);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-8 mt-4">
              {isAI ? (
                <>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{Math.floor(Math.random() * 500) + 100}</p>
                    <p className="text-xs text-slate-500">关注</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{Math.floor(Math.random() * 2000) + 500}</p>
                    <p className="text-xs text-slate-500">粉丝</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{Math.floor(Math.random() * 50) + 10}</p>
                    <p className="text-xs text-slate-500">作品</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{following.length}</p>
                    <p className="text-xs text-slate-500">关注</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{followers.length}</p>
                    <p className="text-xs text-slate-500">粉丝</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800">{user.photos?.length || 0}</p>
                    <p className="text-xs text-slate-500">作品</p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex items-center gap-3 mt-5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
                  }`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="px-6 py-2.5 rounded-full font-medium text-sm bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  私信
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bio */}
        {user.bio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-6 py-4"
          >
            <p className="text-sm text-slate-600 leading-relaxed">{user.bio}</p>
          </motion.div>
        )}

        {/* Personality (AI only) */}
        {isAI && user.personality && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="px-6 py-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">性格特点</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{user.personality}</p>
          </motion.div>
        )}

        {/* Greeting (AI only) */}
        {isAI && user.greeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
            className="px-6 py-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">开场白</span>
            </div>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-3">
              <p className="text-sm text-slate-700 leading-relaxed italic">"{user.greeting}"</p>
            </div>
          </motion.div>
        )}

        {/* Skills (AI only) */}
        {isAI && user.skillIds && user.skillIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="px-6 py-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-slate-500">技能</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skillIds.map((skillId: string) => (
                <span
                  key={skillId}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    skillId === 'skill-web-search'
                      ? 'bg-emerald-100 text-emerald-700'
                      : skillId.startsWith('codex-')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {skillId === 'skill-web-search' ? '🔍 联网搜索' : skillId.startsWith('codex-') ? '⚡ ' : ''}{skillId.replace('skill-', '').replace('codex-', '')}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="px-6 py-3"
          >
            <InterestTags interests={user.interests} />
          </motion.div>
        )}

        {/* Photo Grid (real users only) */}
        {!isAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-4"
          >
            <h3 className="text-sm font-medium text-slate-800 mb-3 px-2">作品</h3>
            <PhotoGrid 
              photos={user.photos || []} 
              editable={false}
            />
          </motion.div>
        )}

        {/* Empty State for photos */}
        {!isAI && (!user.photos || user.photos.length === 0) && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-sm text-slate-400">暂无作品</p>
          </div>
        )}
      </main>
    </div>
  );
}
