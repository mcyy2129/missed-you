'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import InterestTags from '@/components/profile/InterestTags';

interface AIPersona {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  personality: string;
  greeting: string;
  avatar: string;
}

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
}

export default function PersonaProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, isLoggedIn, conversations, createConversation } = useApp();
  const [persona, setPersona] = useState<AIPersona | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersona();
  }, [id]);

  const fetchPersona = async () => {
    try {
      const res = await fetch('/api/admin/ai-personas');
      const personas = await res.json();
      const found = personas.find((p: AIPersona) => p.id === id);
      if (found) {
        setPersona(found);
        fetchPosts(id);
      }
    } catch (error) {
      console.error('Failed to fetch persona:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (personaId: string) => {
    try {
      const res = await fetch('/api/social/posts');
      const allPosts = await res.json();
      const personaPosts = allPosts.filter((p: Post) => p.user_id === personaId);
      setPosts(personaPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleFollow = () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }
    setIsFollowing(!isFollowing);
  };

  const handleMessage = async () => {
    if (!isLoggedIn) {
      router.push('/auth');
      return;
    }
    if (!currentUser || !persona) return;

    const conv = await createConversation(persona.id);
    router.push(`/chat/${conv.id}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/50">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/50">角色不存在</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-transparent rounded-card p-6 shadow-md mb-6">
            <div className="flex items-center gap-5 mb-4">
              <div className="relative">
                <Avatar src={persona.avatar} alt={persona.name} size="xl" />
                <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-[10px] font-bold rounded-full shadow-sm">
                  AI
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  {persona.name}
                  <span className="text-sm font-normal text-white/50 ml-2">{persona.age}岁</span>
                </h1>
                <p className="text-sm text-white/60 mt-0.5">{persona.city}</p>
              </div>
            </div>

            <p className="text-sm text-white/60 leading-relaxed mb-4">
              {persona.bio}
            </p>

            <InterestTags interests={persona.interests} />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-5">
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                className="flex-1"
                onClick={handleFollow}
              >
                {isFollowing ? '已关注' : '+ 关注'}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleMessage}
              >
                💬 发消息
              </Button>
            </div>
          </div>

          {/* Posts Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">动态</h3>
            
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm text-white/50">暂无动态</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-transparent rounded-card p-4 shadow-md"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar src={persona.avatar} alt={persona.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white">{persona.name}</h3>
                          <span className="text-[10px] text-white/40">{formatTime(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    
                    {post.image && (
                      <img
                        src={post.image}
                        alt="帖子图片"
                        className="w-full rounded-lg mt-3"
                      />
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/8">
                      <span className="flex items-center gap-1.5 text-xs text-white/50">
                        <span>❤️</span>
                        <span>{post.likes_count}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-white/50">
                        <span>💬</span>
                        <span>{post.comments_count}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
