'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useApp } from '@/lib/store';

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          router.push('/');
        } else {
          setError('登录失败，请检查邮箱和密码');
        }
      } else {
        if (!name.trim()) {
          setError('请输入昵称');
          setLoading(false);
          return;
        }
        const success = await register(email, password, name);
        if (success) {
          router.push('/onboarding');
        } else {
          setError('注册失败，请稍后重试');
        }
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm flex flex-col items-center gap-8"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl tracking-tight" style={{ color: '#84cc16' }}>
            Missed You
          </h1>
          <p className="font-serif text-sm text-white/60 mt-2">
            遇见真诚，不再错过
          </p>
        </div>

        <div className="w-full rounded-2xl p-6 shadow-md" style={{ background: 'rgba(20, 20, 24, 0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isLogin
                  ? 'text-black shadow-sm'
                  : 'text-white/50 hover:text-white/70'
              }`}
              style={isLogin ? { background: '#84cc16' } : {}}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                !isLogin
                  ? 'text-black shadow-sm'
                  : 'text-white/50 hover:text-white/70'
              }`}
              style={!isLogin ? { background: '#84cc16' } : {}}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <Input
                label="昵称"
                placeholder="请输入你的昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading || !email || !password}
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </Button>
          </form>
        </div>

        <p className="text-xs text-white/30 font-sans text-center">
          登录即代表同意{' '}
          <a href="#" className="text-lime-500/60 hover:text-lime-500 underline">
            服务条款
          </a>{' '}
          和{' '}
          <a href="#" className="text-lime-500/60 hover:text-lime-500 underline">
            隐私政策
          </a>
        </p>
      </motion.div>
    </div>
  );
}
