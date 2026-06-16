'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { AI_PERSONAS } from '@/lib/ai-personas';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  created_at: number;
  author_name: string;
  author_avatar: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const AI_POST_TEMPLATES = [
  { personaId: 'ai-xiaomei', contents: [
    '今天奶茶店来了好多客人呀！忙了一整天，但是很开心～🧋 你们今天喝了什么呀？',
    '刚学会了一首新歌，有没有人想听我唱呀？嘻嘻～',
    '追剧追到凌晨3点，现在好困但是好满足！有人也在追《xxx》吗？',
    '今天试了一家新的甜品店，蛋糕超好吃的！强烈推荐！🍰',
  ]},
  { personaId: 'ai-zhihui', contents: [
    '今天解决了一个超难的 bug，成就感满满！程序员的快乐就是这么简单。',
    '推荐一本最近在看的书《思考，快与慢》，很有启发。你们最近在看什么书？',
    '健身第100天打卡！坚持真的很重要，分享一下我的变化。',
    '周末去了一个技术沙龙，认识了很多有趣的人。学习永无止境！',
  ]},
  { personaId: 'ai-wanwan', contents: [
    '今天画了一幅水彩画，是窗外的风景。阳光透过树叶的感觉真好～🎨',
    '去了一个超棒的插画展！被很多作品感动到了，艺术真的能治愈人心。',
    '团子（我的猫）今天特别粘人，一直在我画画的时候蹭我，哈哈～',
    '分享一张今天拍的照片，秋天的落叶真的太美了！📸',
  ]},
  { personaId: 'ai-tiantian', contents: [
    '今天发现了一家超好吃的火锅店！毛肚和鸭肠绝了！🍲 有谁要一起去？',
    '尝试做了一次提拉米苏，虽然卖相一般但是味道还不错！下次会更好的～',
    '成都的天气终于凉快了，最适合吃串串的季节到了！你们喜欢吃串串吗？',
    '今天吃到了一家隐藏在小巷里的面馆，味道太正宗了！这种宝藏店真的好难找～',
  ]},
  { personaId: 'ai-qingqing', contents: [
    '今天晨练的时候看到了超美的日出，分享给大家～🧘‍♀️ 早起的鸟儿有虫吃！',
    '推荐一个简单的冥想方法：闭上眼睛，深呼吸5次，感受当下的平静。',
    '做了一顿健康的午餐，全谷物+蔬菜+蛋白质，营养均衡才是王道！',
    '今天教了一个新学员，看到她从做不到到做到的过程，真的很有成就感。',
  ]},
  { personaId: 'ai-yoyo', contents: [
    '刚从日本回来！京都的红叶真的太美了，分享几张照片给大家～✈️',
    '旅行小tip：去一个新的城市，一定要去当地的菜市场逛逛，最能感受当地生活！',
    '整理了一下今年的旅行足迹，已经去了8个国家了！下一个目标是冰岛！',
    '在清迈遇到了一家超棒的咖啡店，老板人超好，还教我做泰式奶茶～',
  ]},
];

const AI_POST_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop',
];

export default function SocialPage() {
  const router = useRouter();
  const { currentUser, isLoggedIn, users, conversations } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'people' | 'bookmarks'>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/social/posts');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/social/bookmarks?userId=${currentUser.id}`);
      const data = await res.json();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookmarks' && currentUser) {
      fetchBookmarks();
    }
  }, [activeTab, currentUser]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!currentUser || !newPostContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: newPostContent.trim(),
          image: newPostImage,
        }),
      });
      const post = await res.json();
      setPosts([{ ...post, author_name: currentUser.name, author_avatar: currentUser.avatar }, ...posts]);
      setNewPostContent('');
      setNewPostImage(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    try {
      const res = await fetch('/api/social/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id }),
      });
      const { isLiked } = await res.json();
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked,
            likes_count: isLiked ? p.likes_count + 1 : p.likes_count - 1,
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    try {
      const res = await fetch('/api/social/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id }),
      });
      const { isBookmarked } = await res.json();
      setPosts(posts.map(p => p.id === postId ? { ...p, isBookmarked } : p));
      if (activeTab === 'bookmarks') {
        fetchBookmarks();
      }
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await fetch('/api/social/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id }),
      });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleGenerateAIPost = async () => {
    const template = AI_POST_TEMPLATES[Math.floor(Math.random() * AI_POST_TEMPLATES.length)];
    const persona = AI_PERSONAS.find(p => p.id === template.personaId);
    if (!persona) return;

    const content = template.contents[Math.floor(Math.random() * template.contents.length)];
    const hasImage = Math.random() > 0.5;

    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: persona.id,
          content,
          image: hasImage ? AI_POST_IMAGES[Math.floor(Math.random() * AI_POST_IMAGES.length)] : null,
        }),
      });
      const post = await res.json();
      setPosts([{ ...post, author_name: persona.name, author_avatar: persona.avatar }, ...posts]);
    } catch (error) {
      console.error('Failed to generate AI post:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const allPeople = [
    ...users.filter(u => !u.id.startsWith('ai-')).map(u => ({ ...u, isAI: false })),
    ...AI_PERSONAS.map(ai => {
      const existingUser = users.find(u => u.id === ai.id);
      return {
        ...(existingUser || ai),
        id: ai.id,
        name: ai.name,
        age: ai.age,
        city: ai.city,
        avatar: ai.avatar,
        bio: ai.bio,
        interests: ai.interests,
        photos: existingUser?.photos || [],
        isAI: true,
        email: '',
        role: 'ai',
        isOnline: true,
        lastSeen: null,
        created_at: Date.now(),
      };
    })
  ];

  const PostCard = ({ post, index }: { post: Post; index: number }) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      className="rounded-2xl p-5 shadow-sm border border-white/10 hover:border-white/15 transition-all glass-card"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <Avatar src={post.author_avatar} alt={post.author_name} size="md" />
          {post.user_id.startsWith('ai-') && (
            <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[7px] font-bold rounded-full shadow-sm">
              AI
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{post.author_name}</h3>
            {post.user_id.startsWith('ai-') && (
              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-medium rounded">
                AI 伙伴
              </span>
            )}
          </div>
          <span className="text-[11px] text-white/40">{formatTime(post.created_at)}</span>
        </div>
        {currentUser?.id === post.user_id && (
          <button
            onClick={() => handleDeletePost(post.id)}
            className="text-white/40 hover:text-rose-500 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <p className="text-sm text-white/80 leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>
      
      {post.image && (
        <motion.div 
          className="mb-4 -mx-5 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={post.image}
            alt="帖子图片"
            className="w-full object-cover max-h-80"
            loading="lazy"
          />
        </motion.div>
      )}
      
      <div className="flex items-center gap-4 pt-3 border-t border-white/8">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handleLike(post.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            post.isLiked ? 'text-rose-500' : 'text-white/50 hover:text-rose-500'
          }`}
        >
          <motion.span
            animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {post.isLiked ? '❤️' : '🤍'}
          </motion.span>
          <span className="text-xs">{post.likes_count}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push(`/social/${post.id}`)}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <span>💬</span>
          <span className="text-xs">{post.comments_count}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => handleBookmark(post.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ml-auto ${
            post.isBookmarked ? 'text-amber-500' : 'text-white/40 hover:text-amber-500'
          }`}
        >
          <motion.span
            animate={post.isBookmarked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {post.isBookmarked ? '⭐' : '☆'}
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );

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
            <div>
              <h1 className="text-xl font-display font-semibold text-white">
                社交广场
              </h1>
              <p className="text-xs text-white/50 mt-1">
                分享生活，遇见有趣的人
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md shadow-rose-200"
                >
                  <span>✏️</span>
                  <span>发帖</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'feed' as const, label: '动态', icon: '📝' },
              { id: 'people' as const, label: '发现人', icon: '👥' },
              { id: 'bookmarks' as const, label: '收藏', icon: '⭐' },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:bg-white/8'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {activeTab === 'feed' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-xs text-white/60 hover:bg-white/8 transition-colors"
                >
                  <motion.span
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
                  >
                    🔄
                  </motion.span>
                  <span>{refreshing ? '刷新中...' : '刷新'}</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateAIPost}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 rounded-full text-xs text-violet-600 hover:bg-violet-200 transition-colors"
                >
                  <span>🤖</span>
                  <span>AI 发帖</span>
                </motion.button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white/50">加载中...</p>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">还没有动态</h3>
                  <p className="text-sm text-white/50 mb-6">快来发第一条动态吧！</p>
                  <div className="flex gap-3">
                    {isLoggedIn && (
                      <Button onClick={() => setShowCreateModal(true)}>
                        发布动态
                      </Button>
                    )}
                    <Button variant="secondary" onClick={handleGenerateAIPost}>
                      AI 生成
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'people' && (
            <div className="flex flex-col gap-3">
              {allPeople.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    if (person.isAI) {
                      router.push(`/persona/${person.id}`);
                    } else {
                      const conv = conversations.find(c => c.participants.includes(person.id));
                      if (conv) router.push(`/chat/${conv.id}`);
                      else router.push(`/profile?id=${person.id}`);
                    }
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl shadow-sm border border-white/10 cursor-pointer hover:border-white/15 transition-all glass-card"
                >
                  <div className="relative">
                    <Avatar src={person.avatar} alt={person.name} size="md" />
                    {person.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                    {person.isAI && (
                      <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[7px] font-bold rounded-full shadow-sm">
                        AI
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{person.name}</h3>
                      {person.isAI && (
                        <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-medium rounded">
                          AI 伙伴
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 line-clamp-1">{person.bio || person.city}</p>
                  </div>
                  <div className="text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <>
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">⭐</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">登录查看收藏</h3>
                  <p className="text-sm text-white/50 mb-6">登录后可以收藏喜欢的动态</p>
                  <Button onClick={() => router.push('/auth')}>
                    去登录
                  </Button>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">⭐</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">还没有收藏</h3>
                  <p className="text-sm text-white/50">浏览动态时点击 ⭐ 即可收藏</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookmarks.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      <BottomNav />

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl p-6 shadow-2xl"
              style={{ background: 'rgba(20, 20, 24, 0.97)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-10 h-1 bg-white/8 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">发布动态</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/8 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full h-32 p-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:border-lime-500/30 resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />

              {newPostImage && (
                <div className="relative mt-3">
                  <img src={newPostImage} alt="预览" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full text-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-5">
                <label className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => setNewPostImage(event.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="text-lg">📷</span>
                  <span>添加图片</span>
                </label>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || posting}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium shadow-md shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? '发布中...' : '发布'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
