'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const menuItems = [
  { href: '/admin', label: '总览', icon: '📊' },
  { href: '/admin/analytics', label: '数据分析', icon: '📈' },
  { href: '/admin/users', label: '用户管理', icon: '👥' },
  { href: '/admin/conversations', label: '对话管理', icon: '💬' },
  { href: '/admin/ai-personas', label: 'AI 角色', icon: '🤖' },
  { href: '/admin/model-config', label: '模型配置', icon: '⚙️' },
  { href: '/admin/database', label: '数据库', icon: '🗄️' },
  { href: '/admin/settings', label: '站点设置', icon: '🔧' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-white/10 min-h-screen fixed left-0 top-0 pt-16">
      <div className="p-4">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 px-4">
          管理菜单
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="admin-menu-indicator"
                    className="absolute left-0 w-1 h-6 bg-rose-500 rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
