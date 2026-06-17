'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Stats {
  userCount: number;
  conversationCount: number;
  messageCount: number;
  matchCount: number;
  recentUsers: any[];
  recentMessages: any[];
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      if (data.role !== 'admin') {
        setError('账号权限不足，仅管理员可登录');
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data));
      document.cookie = 'isLoggedIn=true; path=/; max-age=86400';
      document.cookie = 'userRole=admin; path=/; max-age=86400';

      setIsAuthed(true);
      fetchStats();
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
      
      fetch('/api/admin/migrate-codes', { method: 'POST' }).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🛡️</div>
            <h1 className="font-display text-2xl text-white tracking-tight">
              管理后台
            </h1>
            <p className="text-sm text-white/50 mt-2">
              请使用管理员账号登录
            </p>
          </div>

          <div            className="rounded-2xl p-6 shadow-md glass-card border border-white/10">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input
                label="管理员邮箱"
                type="email"
                placeholder="admin@missed.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="密码"
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-semibold text-white">
                管理后台
              </h1>
              <p className="text-sm text-white/50 mt-1">
                管理用户、对话和系统数据
              </p>
            </div>
            <button
              onClick={() => {
                setIsAuthed(false);
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-white/50 hover:text-white/70"
            >
              退出管理
            </button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-white/50">加载中...</p>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-5 mb-8 border border-white/10">
                <h3 className="font-semibold text-white mb-3">快捷操作</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      if (confirm('确认清空所有对话记录？此操作不可恢复！')) {
                        await fetch('/api/admin/conversations', { method: 'DELETE' });
                        fetchStats();
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm text-white/70 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    🗑️ 清空对话
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('确认重置所有用户数据？')) {
                        await fetch('/api/admin/users/reset', { method: 'POST' });
                        fetchStats();
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm text-white/70 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    🔄 重置用户
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/database'}
                    className="px-4 py-2 rounded-xl text-sm text-white/70 hover:bg-white/10 transition-colors border border-white/10"
                  >
                    📦 数据库备份
                  </button>
                  <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-rose-500/80 text-white rounded-xl text-sm hover:bg-rose-500 transition-colors"
                  >
                    🔄 刷新数据
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/ai-autopost/batch', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ count: 3 }),
                        });
                        const data = await res.json();
                        alert(`成功生成 ${data.created} 条AI动态！`);
                        fetchStats();
                      } catch (e) {
                        alert('AI发帖失败');
                      }
                    }}
                    className="px-4 py-2 bg-violet-500/80 text-white rounded-xl text-sm hover:bg-violet-500 transition-colors"
                  >
                    🤖 AI自动发帖
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: '总用户数', value: stats?.userCount || 0, icon: '👥', accent: 'from-blue-500/20 to-blue-600/10' },
                  { label: '总对话数', value: stats?.conversationCount || 0, icon: '💬', accent: 'from-emerald-500/20 to-emerald-600/10' },
                  { label: '总消息数', value: stats?.messageCount || 0, icon: '✉️', accent: 'from-amber-500/20 to-amber-600/10' },
                  { label: '总匹配数', value: stats?.matchCount || 0, icon: '💕', accent: 'from-rose-500/20 to-rose-600/10' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${stat.accent} glass-card rounded-2xl p-5 border border-white/10`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-white/60">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/users'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">👥</span>
                  <h3 className="font-semibold text-white mb-1">用户管理</h3>
                  <p className="text-xs text-white/50">查看、编辑、删除用户</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/ai-personas'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">🤖</span>
                  <h3 className="font-semibold text-white mb-1">AI 角色管理</h3>
                  <p className="text-xs text-white/50">配置AI机器人资料和头像</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/ai-skills'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.2))', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                >
                  <span className="text-2xl mb-2 block">✨</span>
                  <h3 className="font-semibold mb-1">AI Skill 管理</h3>
                  <p className="text-xs text-white/80">配置AI对话风格和人设技能</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/model-config'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">⚙️</span>
                  <h3 className="font-semibold text-white mb-1">模型配置</h3>
                  <p className="text-xs text-white/50">配置AI模型和API接口</p>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2))', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
                  <span className="text-2xl mb-2 block">📊</span>
                  <h3 className="font-semibold mb-1">数据分析</h3>
                  <p className="text-xs text-white/80">可视化运营数据</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/settings'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow text-white"
                  style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(234, 88, 12, 0.2))', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                >
                  <span className="text-2xl mb-2 block">⚙️</span>
                  <h3 className="font-semibold mb-1">站点设置</h3>
                  <p className="text-xs text-white/80">配置平台参数</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/conversations'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">💬</span>
                  <h3 className="font-semibold text-white mb-1">对话管理</h3>
                  <p className="text-xs text-white/50">查看所有对话记录</p>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/douyin-videos'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">🎬</span>
                  <h3 className="font-semibold text-white mb-1">抖音视频管理</h3>
                  <p className="text-xs text-white/50">管理抖音页面的视频内容</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/database'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">🗄️</span>
                  <h3 className="font-semibold text-white mb-1">数据库</h3>
                  <p className="text-xs text-white/50">数据库状态和管理</p>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/admin/ai-personas'}
                  className="rounded-2xl p-5 shadow-md text-left hover:shadow-lg transition-shadow glass-card border border-white/10"
                >
                  <span className="text-2xl mb-2 block">🤖</span>
                  <h3 className="font-semibold text-white mb-1">AI 角色管理</h3>
                  <p className="text-xs text-white/50">配置AI机器人资料和头像</p>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">最近注册用户</h3>
                  {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentUsers.map((user: any) => (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-sm">
                            {user.name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                          </div>
                          <span className="text-[10px] text-white/40">
                            {new Date(user.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 text-center py-4">暂无数据</p>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">最近消息</h3>
                  {stats?.recentMessages && stats.recentMessages.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentMessages.slice(0, 5).map((msg: any) => (
                        <div key={msg.id} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                          <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-sm shrink-0">
                            {msg.sender_name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/50">{msg.sender_name}</p>
                            <p className="text-sm text-white/70 truncate">{msg.text || '[图片/语音]'}</p>
                          </div>
                          <span className="text-[10px] text-white/40 shrink-0">
                            {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/50 text-center py-4">暂无数据</p>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
