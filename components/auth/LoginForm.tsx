'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Tab = 'phone' | 'email';

interface LoginFormProps {
  onSubmit?: () => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = () => {
    setCodeSent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-1 bg-cream-100 rounded-card p-1">
        {(['phone', 'email'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-sans font-medium rounded-card transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-brown-800 shadow-sm'
                : 'text-brown-600 hover:text-brown-700'
            }`}
          >
            {tab === 'phone' ? '手机号' : '邮箱'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'phone' ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="验证码"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeSent}
                className="text-sm text-bronze-400 hover:text-bronze-500 whitespace-nowrap pb-2.5 font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {codeSent ? '已发送' : '发送验证码'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3"
          >
            <Input
              label="邮箱"
              placeholder="请输入邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="验证码"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeSent}
                className="text-sm text-bronze-400 hover:text-bronze-500 whitespace-nowrap pb-2.5 font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {codeSent ? '已发送' : '发送验证码'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button type="submit" className="w-full mt-2">
        注册 / 登录
      </Button>
    </form>
  );
}
