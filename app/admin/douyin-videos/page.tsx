'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface DouyinVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  cover_url: string;
  author_name: string;
  author_avatar: string;
  category: string;
  duration: number;
  music_name: string;
  music_author: string;
  digg_count: number;
  comment_count: number;
  share_count: number;
  status: string;
  created_at: number;
}

export default function DouyinAdminPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<DouyinVideo> | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/douyin/videos?limit=100');
      const data = await res.json();
      setVideos(data.data?.list || []);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingVideo?.video_url) return;
    setSaving(true);
    try {
      const method = editingVideo.id ? 'PUT' : 'POST';
      const res = await fetch('/api/douyin/videos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVideo),
      });
      if (res.ok) {
        await fetchVideos();
        setShowModal(false);
        setEditingVideo(null);
      }
    } catch (error) {
      console.error('Failed to save video:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个视频？')) return;
    try {
      await fetch('/api/douyin/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const videos = Array.isArray(data) ? data : data.videos || [];
      if (videos.length === 0) {
        setImportResult('文件中没有视频数据');
        return;
      }
      const res = await fetch('/api/douyin/videos/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos }),
      });
      const result = await res.json();
      setImportResult(`导入完成：成功 ${result.successCount} 条，失败 ${result.failCount} 条`);
      if (result.successCount > 0) await fetchVideos();
    } catch (error) {
      setImportResult('JSON解析失败，请检查文件格式');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => router.push('/admin')} className="text-sm text-white/50 hover:text-white/60 mb-2">← 返回管理后台</button>
              <h1 className="text-2xl font-display font-semibold text-white">视频管理</h1>
              <p className="text-sm text-white/50 mt-1">共 {videos.length} 个视频</p>
            </div>
            <div className="flex gap-3">
              <label className="px-4 py-2.5 bg-white/5 text-white/80 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                {importing ? '导入中...' : '📄 导入JSON'}
                <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" disabled={importing} />
              </label>
              <Button onClick={() => { setEditingVideo({ title: '', description: '', video_url: '', cover_url: '', author_name: '', category: '推荐', duration: 15 }); setShowModal(true); }}>
                + 添加视频
              </Button>
            </div>
          </div>

          {importResult && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
              {importResult}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-white/50">加载中...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-white/50 mb-4">暂无视频，点击上方"添加视频"开始</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 border border-white/10">
                  {video.cover_url && (
                    <img src={video.cover_url} alt={video.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                  )}
                  <h3 className="text-sm font-medium text-white truncate">{video.title || '无标题'}</h3>
                  <p className="text-xs text-white/50 mt-1">{video.author_name} · {video.category} · {video.duration}秒</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                    <span>❤️ {video.digg_count}</span>
                    <span>💬 {video.comment_count}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditingVideo(video); setShowModal(true); }} className="flex-1 px-3 py-1.5 bg-white/5 text-white/80 rounded-lg text-xs hover:bg-white/8 transition-colors">编辑</button>
                    <button onClick={() => handleDelete(video.id)} className="px-3 py-1.5 text-white/40 hover:text-red-400 text-xs">删除</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showModal && editingVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">{editingVideo.id ? '编辑视频' : '添加视频'}</h3>
              <div className="space-y-4">
                <Input label="视频URL" value={editingVideo.video_url || ''} onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })} placeholder="https://example.com/video.mp4" />
                <Input label="封面URL" value={editingVideo.cover_url || ''} onChange={(e) => setEditingVideo({ ...editingVideo, cover_url: e.target.value })} placeholder="https://example.com/cover.jpg" />
                <Input label="标题" value={editingVideo.title || ''} onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })} />
                <Input label="作者名" value={editingVideo.author_name || ''} onChange={(e) => setEditingVideo({ ...editingVideo, author_name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">分类</label>
                    <select value={editingVideo.category || '推荐'} onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
                      {['推荐', '旅行', '美食', '萌宠', '风景', '时尚', '音乐', '舞蹈', '搞笑', '知识'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Input label="时长(秒)" type="number" value={String(editingVideo.duration || 15)} onChange={(e) => setEditingVideo({ ...editingVideo, duration: parseInt(e.target.value) || 15 })} />
                </div>
                <Input label="背景音乐名" value={editingVideo.music_name || ''} onChange={(e) => setEditingVideo({ ...editingVideo, music_name: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-white/5 text-white/80 rounded-xl text-sm hover:bg-white/8 transition-colors">取消</button>
                <Button onClick={handleSave} disabled={saving || !editingVideo.video_url} className="flex-1">{saving ? '保存中...' : '保存'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
