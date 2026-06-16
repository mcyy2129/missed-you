'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface User {
  id: string;
  user_code?: string;
  password?: string;
  plain_password?: string;
  email: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  bio: string;
  interests: string[];
  photos: string[];
  role: string;
  is_online: number;
  last_seen: number | null;
  created_at: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeUser, setPasswordChangeUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleUpdate = async (userId: string, data: Partial<User>) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, ...data } : u));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handlePasswordChange = async (userId: string) => {
    if (!newPassword.trim()) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPassword.trim() }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, plain_password: newPassword.trim() } : u));
        setPasswordChangeUser(null);
        setNewPassword('');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.user_code && user.user_code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/50">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-white/50 hover:text-white/60 mb-2"
              >
                ← 返回管理后台
              </button>
              <h1 className="text-2xl font-display font-semibold text-white">
                用户管理
              </h1>
              <p className="text-sm text-white/50 mt-1">
                共 {users.length} 位用户
              </p>
            </div>
          </div>

          <div className="mb-6">
            <Input
              placeholder="搜索用户（姓名、邮箱、城市）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-card shadow-md overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">用户</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">邀请码</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">邮箱</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">
                      <div className="flex items-center gap-2">
                        密码
                        <button
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="text-white/40 hover:text-white/60"
                          title={showPasswords ? '隐藏密码' : '显示密码'}
                        >
                          {showPasswords ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">城市</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">注册时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60">状态</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/60">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-white/50">{user.age}岁</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60 font-mono">{user.user_code || '-'}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-white/40 font-mono text-xs break-all max-w-[120px]">
                        {showPasswords ? (user.plain_password || user.password || '-') : '••••••••'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{user.city || '-'}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          user.is_online
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.is_online ? '在线' : '离线'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-xs text-white/50 hover:text-white/60"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => { setPasswordChangeUser(user.id); setNewPassword(''); }}
                            className="text-xs text-blue-500 hover:text-blue-600"
                          >
                            改密
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-white/50">没有找到匹配的用户</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-card p-6 w-full max-w-md shadow-xl"
              style={{ background: 'rgba(20, 20, 24, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">编辑用户</h3>
              
              <div className="space-y-4">
                <Input
                  label="昵称"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
                <Input
                  label="年龄"
                  type="number"
                  value={editingUser.age.toString()}
                  onChange={(e) => setEditingUser({ ...editingUser, age: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="城市"
                  value={editingUser.city}
                  onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditingUser(null)}
                >
                  取消
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUpdate(editingUser.id, editingUser)}
                >
                  保存
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {passwordChangeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => { setPasswordChangeUser(null); setNewPassword(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-card p-6 w-full max-w-sm shadow-xl"
              style={{ background: 'rgba(20, 20, 24, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">修改密码</h3>
              
              <div className="space-y-4">
                <Input
                  label="新密码"
                  type="text"
                  placeholder="请输入新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-white/50">
                  修改后用户将使用新密码登录
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => { setPasswordChangeUser(null); setNewPassword(''); }}
                >
                  取消
                </Button>
                <Button
                  className="flex-1"
                  disabled={!newPassword.trim()}
                  onClick={() => handlePasswordChange(passwordChangeUser)}
                >
                  确认修改
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-card p-6 w-full max-w-sm shadow-xl"
              style={{ background: 'rgba(20, 20, 24, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
              <p className="text-sm text-white/60 mb-6">
                确定要删除这个用户吗？此操作不可撤销。
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  删除
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
