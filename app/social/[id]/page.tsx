'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
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
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: number;
  author_name: string;
  author_avatar: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, isLoggedIn } = useApp();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/social/posts?limit=100`);
      const posts = await res.json();
      const found = posts.find((p: Post) => p.id === id);
      setPost(found || null);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/social/comments?postId=${id}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUser || !post) {
      router.push('/auth');
      return;
    }
    try {
      const res = await fetch('/api/social/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, userId: currentUser.id }),
      });
      const { isLiked } = await res.json();
      setPost({
        ...post,
        isLiked,
        likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1,
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async () => {
    if (!currentUser || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: id,
          userId: currentUser.id,
          content: newComment.trim(),
        }),
      });
      const comment = await res.json();
      setComments([...comments, {
        ...comment,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
      }]);
      setPost(post ? { ...post, comments_count: post.comments_count + 1 } : null);
      setNewComment('');
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      await fetch('/api/social/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
      setComments(comments.filter(c => c.id !== commentId));
      setPost(post ? { ...post, comments_count: post.comments_count - 1 } : null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
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

  if (!post) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/50">帖子不存在</p>
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
          {/* Post */}
          <div className="bg-transparent rounded-card p-4 shadow-md mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Avatar src={post.author_avatar} alt={post.author_name} size="md" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white">{post.author_name}</h3>
                <span className="text-[10px] text-white/40">{formatTime(post.created_at)}</span>
              </div>
            </div>
            
            <p className="text-sm text-white/80 leading-relaxed mb-3 whitespace-pre-wrap">
              {post.content}
            </p>
            
            {post.image && (
              <img
                src={post.image}
                alt="帖子图片"
                className="w-full rounded-lg mb-3"
              />
            )}
            
            <div className="flex items-center gap-4 pt-2 border-t border-white/8">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  post.isLiked ? 'text-red-500' : 'text-white/50 hover:text-red-500'
                }`}
              >
                <span>{post.isLiked ? '❤️' : '🤍'}</span>
                <span>{post.likes_count}</span>
              </button>
              <span className="flex items-center gap-1.5 text-xs text-white/50">
                <span>💬</span>
                <span>{post.comments_count}</span>
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white mb-4">评论 ({comments.length})</h3>
            
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-white/40">暂无评论，快来抢沙发吧！</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar src={comment.author_avatar} alt={comment.author_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-white">{comment.author_name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{formatTime(comment.created_at)}</span>
                          {currentUser?.id === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-[10px] text-white/40 hover:text-red-500"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Comment Input */}
      {isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent/90 backdrop-blur-md border-t border-white/10/50">
          <div className="flex items-center gap-2 px-4 py-3 max-w-lg mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="写评论..."
              className="flex-1 rounded-full bg-white/5 border border-white/15/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10/30"
            />
            <Button
              size="sm"
              onClick={handleComment}
              disabled={!newComment.trim() || posting}
            >
              {posting ? '...' : '发送'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
