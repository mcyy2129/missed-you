'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import QQLoginButton from '@/components/auth/QQLoginButton';
import LoginForm from '@/components/auth/LoginForm';
import { useApp } from '@/lib/store';

export default function AuthPage() {
  const router = useRouter();
  const { login } = useApp();

  const handleLogin = () => {
    login('新用户', 25, '北京');
    router.push('/onboarding');
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
          <h1 className="font-display text-3xl text-brown-800 tracking-tight">
            Missed You
          </h1>
          <p className="font-serif text-sm text-brown-600 mt-2">
            遇见真诚，不再错过
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <QQLoginButton onClick={handleLogin} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-bronze-300/30" />
            <span className="text-xs text-brown-600/60 font-sans">或</span>
            <div className="flex-1 h-px bg-bronze-300/30" />
          </div>

          <LoginForm onSubmit={handleLogin} />
        </div>

        <p className="text-xs text-brown-600/50 font-sans text-center">
          登录即代表同意{' '}
          <a href="#" className="text-bronze-400 hover:text-bronze-500 underline">
            服务条款
          </a>{' '}
          和{' '}
          <a href="#" className="text-bronze-400 hover:text-bronze-500 underline">
            隐私政策
          </a>
        </p>
      </motion.div>
    </div>
  );
}
