'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';

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
  const { currentUser, logout } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-display font-semibold text-brown-800 mb-6">
            设置
          </h1>

          {/* Profile Summary Card */}
          {currentUser && (
            <motion.div
              className="bg-cream-50 rounded-card p-5 shadow-md mb-6 flex items-center gap-4 cursor-pointer"
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => (window.location.href = '/profile')}
            >
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-brown-800">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-brown-600">
                  {currentUser.age}岁 · {currentUser.city}
                </p>
              </div>
              <span className="text-brown-600 text-lg">›</span>
            </motion.div>
          )}

          {/* Settings Groups */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {settingsGroups.map((group) => (
              <motion.div
                key={group.title}
                variants={item}
                className="bg-cream-50 border border-cream-200 rounded-card overflow-hidden"
              >
                <h4 className="px-5 pt-4 pb-2 text-xs font-medium text-bronze-500 uppercase tracking-wide">
                  {group.title}
                </h4>
                {group.items.map((settingItem, idx) => (
                  <div
                    key={settingItem.label}
                    className={`flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-cream-100/50 transition-colors ${
                      idx < group.items.length - 1 ? 'border-b border-cream-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{settingItem.icon}</span>
                      <span className="text-sm text-brown-700">{settingItem.label}</span>
                    </div>
                    <span className="text-brown-600/50 text-sm">›</span>
                  </div>
                ))}
              </motion.div>
            ))}
          </motion.div>

          {/* Logout */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleLogout}
              className="text-sm text-bronze-500 hover:text-bronze-400 transition-colors"
            >
              退出登录
            </button>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
