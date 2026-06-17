'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Navbar from '@/components/layout/Navbar';

interface DatabaseStats {
  userCount: number;
  conversationCount: number;
  messageCount: number;
  matchCount: number;
  postCount: number;
  commentCount: number;
  dbSize: string;
  tableStats: Array<{ name: string; count: number; size: string }>;
  recentActivity: Array<{ action: string; count: number; time: string }>;
}

const COLORS = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminDatabasePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/database-stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white/5">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-white/50">加载数据库信息...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pieData = stats ? [
    { name: '用户', value: stats.userCount },
    { name: '对话', value: stats.conversationCount },
    { name: '消息', value: stats.messageCount },
    { name: '匹配', value: stats.matchCount },
    { name: '帖子', value: stats.postCount },
    { name: '评论', value: stats.commentCount },
  ] : [];

  return (
    <div className="min-h-screen bg-white/5">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-white/50 hover:text-white/80 mb-2"
            >
              ← 返回管理后台
            </button>
            <h1 className="text-2xl font-display font-semibold text-white">
              数据库管理
            </h1>
            <p className="text-sm text-white/50 mt-1">
              数据库状态监控与管理
            </p>
          </div>

          {/* Database Info Card */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">数据库概览</h3>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                运行正常
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">数据库类型</p>
                <p className="text-xl font-bold">SQLite</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">存储大小</p>
                <p className="text-xl font-bold">{stats?.dbSize || '0 KB'}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">表数量</p>
                <p className="text-xl font-bold">9</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">索引数量</p>
                <p className="text-xl font-bold">6</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart - Table Counts */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">各表数据量</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.tableStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Distribution */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">数据分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Statistics Grid */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="font-semibold text-white mb-4">数据表详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.tableStats.map((table, index) => (
                <motion.div
                  key={table.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{table.name}</span>
                    <span className="text-xs text-white/50">{table.size}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{table.count.toLocaleString()}</p>
                  <p className="text-xs text-white/50 mt-1">条记录</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Schema Info */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
            <h3 className="font-semibold text-white mb-4">数据表结构</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'users',
                  columns: ['id (TEXT, PK)', 'email (TEXT, UNIQUE)', 'password (TEXT)', 'name (TEXT)', 'age (INTEGER)', 'city (TEXT)', 'avatar (TEXT)', 'bio (TEXT)', 'interests (TEXT)', 'photos (TEXT)', 'role (TEXT)', 'is_online (INTEGER)', 'last_seen (INTEGER)', 'created_at (INTEGER)', 'updated_at (INTEGER)']
                },
                {
                  name: 'conversations',
                  columns: ['id (TEXT, PK)', 'created_at (INTEGER)', 'updated_at (INTEGER)']
                },
                {
                  name: 'messages',
                  columns: ['id (TEXT, PK)', 'conversation_id (TEXT, FK)', 'sender_id (TEXT, FK)', 'text (TEXT)', 'image (TEXT)', 'audio (TEXT)', 'is_read (INTEGER)', 'read_at (INTEGER)', 'created_at (INTEGER)']
                },
                {
                  name: 'matches',
                  columns: ['id (TEXT, PK)', 'user1_id (TEXT, FK)', 'user2_id (TEXT, FK)', 'created_at (INTEGER)']
                },
                {
                  name: 'posts',
                  columns: ['id (TEXT, PK)', 'user_id (TEXT, FK)', 'content (TEXT)', 'image (TEXT)', 'likes_count (INTEGER)', 'comments_count (INTEGER)', 'created_at (INTEGER)', 'updated_at (INTEGER)']
                },
                {
                  name: 'comments',
                  columns: ['id (TEXT, PK)', 'post_id (TEXT, FK)', 'user_id (TEXT, FK)', 'content (TEXT)', 'created_at (INTEGER)']
                },
              ].map((table) => (
                <div key={table.name} className="border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                    <span className="text-sm font-medium text-white">{table.name}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {table.columns.map((col) => (
                        <span key={col} className="px-2 py-1 bg-white/5 rounded text-xs text-white/60 font-mono">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">最近活动</h3>
            <div className="space-y-3">
              {stats?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center">
                      <span className="text-lg">
                        {activity.action === '用户注册' ? '👤' :
                         activity.action === '新消息' ? '💬' :
                         activity.action === '新匹配' ? '💕' :
                         activity.action === '新帖子' ? '📝' : '📊'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{activity.action}</p>
                      <p className="text-xs text-white/50">{activity.time}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">+{activity.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
