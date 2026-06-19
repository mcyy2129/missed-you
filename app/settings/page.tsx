'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';

const PRESET_BACKGROUNDS = [
  { name: '默认', url: '/bg.png' },
  { name: '星空', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop' },
  { name: '海洋', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop' },
  { name: '森林', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop' },
  { name: '日落', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2000&auto=format&fit=crop' },
  { name: '城市', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000&auto=format&fit=crop' },
  { name: '极光', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2000&auto=format&fit=crop' },
  { name: '粉色', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop' },
  { name: '薰衣草', url: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?q=80&w=2000&auto=format&fit=crop' },
  { name: '极简', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop' },
];

const CHAT_BG_PRESETS = [
  { name: '无背景', url: '' },
  { name: '浅色磨砂', url: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2000&auto=format&fit=crop' },
  { name: '深色渐变', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop' },
  { name: '薄荷', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2000&auto=format&fit=crop' },
  { name: '珊瑚', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2000&auto=format&fit=crop' },
  { name: '星空', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop' },
  { name: '日落', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2000&auto=format&fit=crop' },
  { name: '海洋', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop' },
];

const settingsGroups = [
  {
    title: '账号',
    items: [
      { label: '编辑资料', icon: '✏️' },
      { label: '账号安全', icon: '🔒' },
      { label: '绑定手机', icon: '📱' },
    ],
  },
  {
    title: '通知',
    items: [
      { label: '消息通知', icon: '🔔' },
      { label: '匹配提醒', icon: '💫' },
      { label: '推广信息', icon: '📢' },
    ],
  },
  {
    title: '隐私',
    items: [
      { label: '隐私设置', icon: '🛡️' },
      { label: '屏蔽列表', icon: '🚫' },
      { label: '在线状态', icon: '🟢' },
    ],
  },
  {
    title: '关于',
    items: [
      { label: '关于我们', icon: 'ℹ️' },
      { label: '用户协议', icon: '📄' },
      { label: '隐私政策', icon: '📋' },
      { label: '联系我们', icon: '💌' },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const { currentUser, logout, themeBackground, chatBackground, setThemeBackground, setChatBackground } = useApp();
  const router = useRouter();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showChatBgPicker, setShowChatBgPicker] = useState(false);
  const [customThemeUrl, setCustomThemeUrl] = useState('');
  const [customChatUrl, setCustomChatUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const themeFileRef = useRef<HTMLInputElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File, type: 'theme' | 'chat') => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1920;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          if (type === 'theme') {
            setThemeBackground(dataUrl);
            setShowThemePicker(false);
          } else {
            setChatBackground(dataUrl);
            setShowChatBgPicker(false);
          }
        }
        setUploading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [setThemeBackground, setChatBackground]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-display font-semibold text-white mb-6">
            设置
          </h1>

          {/* Profile Summary Card */}
          {currentUser && (
            <motion.div
              className="glass-card rounded-card p-5 shadow-md mb-6 flex items-center gap-4 cursor-pointer border border-white/10"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => (window.location.href = '/profile')}
            >
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-white/60">
                  {currentUser.age}岁 · {currentUser.city}
                </p>
              </div>
              <span className="text-white/60 text-lg">›</span>
            </motion.div>
          )}

          {/* Theme Settings */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {/* Theme Customization */}
            <motion.div variants={item} className="glass-card border border-white/10 rounded-card overflow-hidden">
              <h4 className="px-5 pt-4 pb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                主题外观
              </h4>
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/8"
                onClick={() => setShowThemePicker(true)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🎨</span>
                  <span className="text-sm text-white/80">主题背景</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 bg-cover bg-center"
                    style={{ backgroundImage: `url(${themeBackground || '/bg.png'})` }}
                  />
                  <span className="text-white/50 text-sm">›</span>
                </div>
              </div>
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowChatBgPicker(true)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">💬</span>
                  <span className="text-sm text-white/80">聊天背景</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border border-white/20 bg-cover bg-center"
                    style={{
                      backgroundImage: chatBackground ? `url(${chatBackground})` : 'none',
                      backgroundColor: chatBackground ? 'transparent' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {!chatBackground && <span className="flex items-center justify-center w-full h-full text-[10px] text-white/40">无</span>}
                  </div>
                  <span className="text-white/50 text-sm">›</span>
                </div>
              </div>
            </motion.div>

            {/* Other Settings Groups */}
            {settingsGroups.map((group) => (
              <motion.div
                key={group.title}
                variants={item}
                className="glass-card border border-white/10 rounded-card overflow-hidden"
              >
                <h4 className="px-5 pt-4 pb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                  {group.title}
                </h4>
                {group.items.map((settingItem, idx) => (
                  <div
                    key={settingItem.label}
                    className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors ${
                      idx < group.items.length - 1 ? 'border-b border-white/8' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{settingItem.icon}</span>
                      <span className="text-sm text-white/80">{settingItem.label}</span>
                    </div>
                    <span className="text-white/60/50 text-sm">›</span>
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>

          {/* Logout */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleLogout}
              className="text-sm text-white/50 hover:text-white/40 transition-colors"
            >
              退出登录
            </button>
          </div>
        </motion.div>
      </main>

      {/* Theme Background Picker Modal */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowThemePicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass-card border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">选择主题背景</h3>
                <button
                  onClick={() => setShowThemePicker(false)}
                  className="text-white/50 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {PRESET_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => {
                      setThemeBackground(bg.url);
                      setShowThemePicker(false);
                    }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      (themeBackground || '/bg.png') === bg.url
                        ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${bg.url})` }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 backdrop-blur-sm">
                      <span className="text-[10px] text-white/80">{bg.name}</span>
                    </div>
                    {(themeBackground || '/bg.png') === bg.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  ref={themeFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'theme');
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => themeFileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? '上传中...' : '上传图片'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入自定义图片URL..."
                  value={customThemeUrl}
                  onChange={(e) => setCustomThemeUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-lime-400/50"
                />
                <button
                  onClick={() => {
                    if (customThemeUrl.trim()) {
                      setThemeBackground(customThemeUrl.trim());
                      setCustomThemeUrl('');
                      setShowThemePicker(false);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-lime-500/20 text-lime-400 text-sm font-medium hover:bg-lime-500/30 transition-colors"
                >
                  应用
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Background Picker Modal */}
      <AnimatePresence>
        {showChatBgPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChatBgPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-t-3xl p-6 pb-10 glass-card border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">选择聊天背景</h3>
                <button
                  onClick={() => setShowChatBgPicker(false)}
                  className="text-white/50 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {CHAT_BG_PRESETS.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => {
                      setChatBackground(bg.url);
                      setShowChatBgPicker(false);
                    }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                      chatBackground === bg.url
                        ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {bg.url ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${bg.url})` }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="text-2xl">🚫</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 backdrop-blur-sm">
                      <span className="text-[10px] text-white/80">{bg.name}</span>
                    </div>
                    {chatBackground === bg.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  ref={chatFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'chat');
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => chatFileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? '上传中...' : '上传图片'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入自定义图片URL..."
                  value={customChatUrl}
                  onChange={(e) => setCustomChatUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-lime-400/50"
                />
                <button
                  onClick={() => {
                    if (customChatUrl.trim()) {
                      setChatBackground(customChatUrl.trim());
                      setCustomChatUrl('');
                      setShowChatBgPicker(false);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-lime-500/20 text-lime-400 text-sm font-medium hover:bg-lime-500/30 transition-colors"
                >
                  应用
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
