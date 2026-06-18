'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

type Tab = 'posts' | 'chatters' | 'moments' | 'projects' | 'friends' | 'albums' | 'config';

export default function BlogAdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Editor form state
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'admin') setIsAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) fetchData();
  }, [activeTab, isAuthed]);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 2000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (['posts', 'chatters', 'moments'].includes(activeTab)) {
        const res = await fetch(`/api/admin/blog?type=${activeTab}`);
        const data = await res.json();
        setItems(data.items || []);
      } else if (['projects', 'friends', 'albums'].includes(activeTab)) {
        const res = await fetch(`/api/admin/blog/data?file=${activeTab}.ts`);
        const data = await res.json();
        setItems(data.data || []);
      } else {
        setItems([]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      if (['posts', 'chatters', 'moments'].includes(activeTab)) {
        const body: any = { type: activeTab, ...form }
        if (editingItem) body.filename = editingItem.filename
        const method = editingItem ? 'PUT' : 'POST'
        await fetch('/api/admin/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        const item: any = { ...form, id: editingItem?.id || `${activeTab}-${Date.now()}` }
        if (activeTab === 'projects') { item.tags = (form.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean) }
        if (activeTab === 'albums') { item.photos = editingItem?.photos || [] }
        if (editingItem) {
          await fetch('/api/admin/blog/data', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: `${activeTab}.ts`, id: editingItem.id, item }) })
        } else {
          await fetch('/api/admin/blog/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: `${activeTab}.ts`, item }) })
        }
      }
      setShowEditor(false); setEditingItem(null); setForm({}); fetchData()
      showSuccess(editingItem ? '更新成功！' : '创建成功！')
    } catch (e) { alert('保存失败'); }
  };

  const handleDelete = async (item: any) => {
    if (!confirm('确认删除？')) return
    try {
      if (['posts', 'chatters', 'moments'].includes(activeTab)) {
        await fetch('/api/admin/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: activeTab, filename: item.filename }) })
      } else {
        await fetch('/api/admin/blog/data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: `${activeTab}.ts`, id: item.id }) })
      }
      fetchData(); showSuccess('删除成功！')
    } catch (e) { alert('删除失败'); }
  };

  const openEditor = (item?: any) => {
    if (item) {
      setEditingItem(item)
      if (['posts', 'chatters', 'moments'].includes(activeTab)) {
        setForm({ title: item.title || '', content: item.content || '', date: item.date || '', description: item.description || '', tags: Array.isArray(item.tags) ? item.tags.join(', ') : '', cover: item.cover || '', mood: item.mood || '' })
      } else {
        const f: Record<string, string> = {}
        for (const [k, v] of Object.entries(item)) { if (typeof v === 'string') f[k] = v; else if (Array.isArray(v)) f[k] = v.join(', '); else f[k] = String(v || '') }
        setForm(f)
      }
    } else {
      setEditingItem(null)
      setForm(activeTab === 'posts' ? { title: '', content: '', date: new Date().toISOString().split('T')[0], tags: '', cover: '', description: '' }
        : activeTab === 'chatters' ? { title: '', content: '', date: new Date().toISOString().split('T')[0], mood: '', tags: '', cover: '' }
        : activeTab === 'moments' ? { content: '', date: new Date().toISOString().split('T')[0], location: '', images: '' }
        : activeTab === 'projects' ? { name: '', description: '', icon: '🚀', githubUrl: '', tags: '' }
        : activeTab === 'friends' ? { name: '', url: '', description: '', avatar: '', themeColor: 'rgba(94,234,212,0.5)' }
        : activeTab === 'albums' ? { title: '', description: '', cover: '', date: '' }
        : {})
    }
    setShowEditor(true)
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      title: '标题', content: '内容', date: '日期', tags: '标签(逗号分隔)', cover: '封面URL', description: '描述', mood: '心情',
      name: '名称', githubUrl: 'GitHub链接', icon: '图标', url: '链接', avatar: '头像URL', themeColor: '主题色', location: '地点', images: '图片(逗号分隔)'
    }
    return labels[key] || key
  };

  if (!isAuthed) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-white/50">请先登录管理后台</p></div>;

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'posts', label: '文章', icon: '📄', count: items.length },
    { id: 'chatters', label: '杂谈', icon: '💬', count: items.length },
    { id: 'moments', label: '说说', icon: '📸', count: items.length },
    { id: 'projects', label: '项目', icon: '🚀', count: items.length },
    { id: 'friends', label: '友链', icon: '🔗', count: items.length },
    { id: 'albums', label: '相册', icon: '🖼️', count: items.length },
    { id: 'config', label: '站点配置', icon: '⚙️', count: 0 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-semibold text-white">博客内容管理</h1>
              <p className="text-sm text-white/50 mt-1">管理所有页面的内容和数据</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin" className="px-3 py-1.5 rounded-xl text-xs text-white/50 hover:text-white/70 border border-white/10">返回管理后台</Link>
              <Link href="/blog" target="_blank" className="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20">预览博客</Link>
            </div>
          </div>

          {/* Success toast */}
          <AnimatePresence>{successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed top-20 right-4 z-50 px-4 py-2 bg-emerald-500/90 text-white rounded-xl text-sm font-medium shadow-lg">{successMsg}</motion.div>
          )}</AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setEditingItem(null); setShowEditor(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-white/50 hover:text-white/70 border border-white/10'}`}>
                <span>{t.icon}</span><span>{t.label}</span>
                {t.id !== 'config' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{items.length}</span>}
              </button>
            ))}
          </div>

          <div className="flex gap-6">
            {/* List */}
            <div className={`${showEditor ? 'w-1/2' : 'w-full'} transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/70">{tabs.find(t => t.id === activeTab)?.label} 列表</h3>
                {activeTab !== 'config' && (
                  <button onClick={() => openEditor()} className="px-3 py-1.5 rounded-xl text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/20">+ 新建</button>
                )}
              </div>

              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                {loading ? <p className="text-center text-white/50 py-12">加载中...</p> : (
                  items.length === 0 ? <p className="text-center text-white/30 py-12">暂无数据</p> : (
                    <div className="divide-y divide-white/5">
                      {items.map((item: any, i: number) => (
                        <motion.div key={item.id || item.filename || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors group">
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-2">
                              {item.icon && <span>{item.icon}</span>}
                              <h4 className="text-sm font-medium text-white truncate">{item.title || item.name || item.id || item.filename}</h4>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5 truncate">
                              {item.date && <span>{item.date}</span>}
                              {item.description && <span> · {item.description.substring(0, 50)}</span>}
                              {item.tags && <span> · {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditor(item)} className="px-2 py-1 rounded-lg text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">编辑</button>
                            <button onClick={() => handleDelete(item)} className="px-2 py-1 rounded-lg text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30">删除</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Editor panel */}
            <AnimatePresence>
              {showEditor && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-1/2 glass-card rounded-2xl border border-white/10 p-5 sticky top-24 self-start">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">{editingItem ? '编辑' : '新建'}{tabs.find(t => t.id === activeTab)?.label}</h3>
                    <button onClick={() => { setShowEditor(false); setEditingItem(null); }} className="text-white/40 hover:text-white/70 text-sm">✕</button>
                  </div>
                  <div className="space-y-3">
                    {Object.keys(form).map(key => (
                      <div key={key}>
                        <label className="text-[10px] text-white/50 uppercase tracking-wider mb-1 block">{getFieldLabel(key)}</label>
                        {key === 'content' ? (
                          <textarea value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-rose-500/50" />
                        ) : (
                          <input type="text" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/50" />
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSave} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600">{editingItem ? '保存修改' : '创建'}</button>
                      <button onClick={() => { setShowEditor(false); setEditingItem(null); setForm({}); }} className="px-4 py-2 bg-white/5 text-white/70 rounded-xl text-sm hover:bg-white/10">取消</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Site Config editor */}
          {activeTab === 'config' && (
            <div className="glass-card rounded-2xl border border-white/10 p-6 mt-4">
              <p className="text-sm text-white/50 mb-4">站点配置需要修改 <code className="text-rose-400">siteConfig_blog.ts</code> 文件</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-white/70 font-medium">当前配置项：</p>
                  <ul className="space-y-1 text-white/40 text-xs">
                    <li>• 站点标题 / 副标题</li>
                    <li>• 作者名 / 简介</li>
                    <li>• 头像 / 背景图</li>
                    <li>• 音乐ID列表</li>
                    <li>• 弹幕文案</li>
                    <li>• 备案信息</li>
                    <li>• AI 猫咪提示词</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70 font-medium">快捷操作：</p>
                  <a href="https://github.com/heiehiehi/XinghuisamaBlogs" target="_blank" className="block px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-xs">查看 XinghuisamaBlogs 源码</a>
                  <Link href="/blog" target="_blank" className="block px-3 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-xs">预览博客首页</Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
