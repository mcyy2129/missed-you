'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    logo: string;
    favicon: string;
    maintenanceMode: boolean;
  };
  matching: {
    algorithm: 'interest' | 'location' | 'random' | 'hybrid';
    maxDistance: number;
    ageRangeMin: number;
    ageRangeMax: number;
    matchCooldown: number;
  };
  ai: {
    enabled: boolean;
    responseDelay: number;
    personality: string;
    maxDailyMessages: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    matchNotification: boolean;
    messageNotification: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowProfileIndexing: boolean;
    dataRetentionDays: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({
    general: {
      siteName: 'Missed You',
      siteDescription: '真诚交友，不再错过',
      logo: '',
      favicon: '',
      maintenanceMode: false,
    },
    matching: {
      algorithm: 'hybrid',
      maxDistance: 100,
      ageRangeMin: 18,
      ageRangeMax: 60,
      matchCooldown: 24,
    },
    ai: {
      enabled: true,
      responseDelay: 2,
      personality: 'friendly',
      maxDailyMessages: 50,
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: false,
      matchNotification: true,
      messageNotification: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      allowProfileIndexing: false,
      dataRetentionDays: 365,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'matching' | 'ai' | 'notifications' | 'privacy'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SiteSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general' as const, label: '基本设置', icon: '⚙️' },
    { id: 'matching' as const, label: '匹配算法', icon: '💕' },
    { id: 'ai' as const, label: 'AI 设置', icon: '🤖' },
    { id: 'notifications' as const, label: '通知设置', icon: '🔔' },
    { id: 'privacy' as const, label: '隐私设置', icon: '🔒' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white/5">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-white/50">加载设置...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-sm text-white/50 hover:text-white/80 mb-2"
              >
                ← 返回管理后台
              </button>
              <h1 className="text-2xl font-display font-semibold text-white">
                站点设置
              </h1>
              <p className="text-sm text-white/50 mt-1">
                配置平台参数，设置将实时生效
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence>
                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-sm text-emerald-600 font-medium"
                  >
                    ✓ 保存成功
                  </motion.span>
                )}
              </AnimatePresence>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md border border-white/8 p-2 sticky top-24">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md border border-white/8 p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">基本设置</h3>

                    <Input
                      label="站点名称"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        站点描述
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    <Input
                      label="Logo URL"
                      value={settings.general.logo}
                      onChange={(e) => updateSetting('general', 'logo', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />

                    <Input
                      label="Favicon URL"
                      value={settings.general.favicon}
                      onChange={(e) => updateSetting('general', 'favicon', e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                    />

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">维护模式</p>
                        <p className="text-xs text-white/50">开启后普通用户无法访问</p>
                      </div>
                      <button
                        onClick={() => updateSetting('general', 'maintenanceMode', !settings.general.maintenanceMode)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.general.maintenanceMode ? 'bg-rose-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.general.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Matching Settings */}
                {activeTab === 'matching' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">匹配算法配置</h3>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        匹配算法
                      </label>
                      <select
                        value={settings.matching.algorithm}
                        onChange={(e) => updateSetting('matching', 'algorithm', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="interest">兴趣匹配</option>
                        <option value="location">地理位置</option>
                        <option value="random">随机推荐</option>
                        <option value="hybrid">混合算法</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        最大距离 (公里): {settings.matching.maxDistance}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        value={settings.matching.maxDistance}
                        onChange={(e) => updateSetting('matching', 'maxDistance', parseInt(e.target.value))}
                        className="w-full h-2 bg-white/8 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="最小年龄"
                        type="number"
                        value={settings.matching.ageRangeMin.toString()}
                        onChange={(e) => updateSetting('matching', 'ageRangeMin', parseInt(e.target.value) || 18)}
                      />
                      <Input
                        label="最大年龄"
                        type="number"
                        value={settings.matching.ageRangeMax.toString()}
                        onChange={(e) => updateSetting('matching', 'ageRangeMax', parseInt(e.target.value) || 60)}
                      />
                    </div>

                    <div>
                      <Input
                        label="匹配冷却时间 (小时)"
                        type="number"
                        value={settings.matching.matchCooldown.toString()}
                        onChange={(e) => updateSetting('matching', 'matchCooldown', parseInt(e.target.value) || 24)}
                      />
                      <p className="text-xs text-white/50 mt-1">用户再次看到同一人的最短间隔</p>
                    </div>
                  </motion.div>
                )}

                {/* AI Settings */}
                {activeTab === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">AI 设置</h3>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">启用 AI 聊天</p>
                        <p className="text-xs text-white/50">允许用户与 AI 角色对话</p>
                      </div>
                      <button
                        onClick={() => updateSetting('ai', 'enabled', !settings.ai.enabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.ai.enabled ? 'bg-rose-500' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.ai.enabled ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <Input
                        label="AI 响应延迟 (秒)"
                        type="number"
                        value={settings.ai.responseDelay.toString()}
                        onChange={(e) => updateSetting('ai', 'responseDelay', parseInt(e.target.value) || 1)}
                      />
                      <p className="text-xs text-white/50 mt-1">模拟真人打字的延迟时间</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        AI 性格类型
                      </label>
                      <select
                        value={settings.ai.personality}
                        onChange={(e) => updateSetting('ai', 'personality', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="friendly">友好亲切</option>
                        <option value="witty">幽默风趣</option>
                        <option value="serious">成熟稳重</option>
                        <option value="shy">害羞内向</option>
                        <option value="energetic">活力四射</option>
                      </select>
                    </div>

                    <div>
                      <Input
                        label="每日最大消息数"
                        type="number"
                        value={settings.ai.maxDailyMessages.toString()}
                        onChange={(e) => updateSetting('ai', 'maxDailyMessages', parseInt(e.target.value) || 50)}
                      />
                      <p className="text-xs text-white/50 mt-1">每个 AI 角色每天最多发送的消息数</p>
                    </div>
                  </motion.div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">通知设置</h3>

                    {[
                      { key: 'emailEnabled', label: '邮件通知', desc: '通过邮件发送重要通知' },
                      { key: 'pushEnabled', label: '推送通知', desc: '浏览器推送通知' },
                      { key: 'matchNotification', label: '匹配通知', desc: '当有新的匹配时通知' },
                      { key: 'messageNotification', label: '消息通知', desc: '收到新消息时通知' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-white/50">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => updateSetting('notifications', item.key, !(settings.notifications as any)[item.key])}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            (settings.notifications as any)[item.key] ? 'bg-rose-500' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              (settings.notifications as any)[item.key] ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">隐私设置</h3>

                    {[
                      { key: 'showOnlineStatus', label: '显示在线状态', desc: '允许其他用户看到你是否在线' },
                      { key: 'showLastSeen', label: '显示最后在线时间', desc: '允许其他用户看到你最后活跃时间' },
                      { key: 'allowProfileIndexing', label: '允许搜索引擎索引', desc: '允许搜索引擎收录用户资料页' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-white/50">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => updateSetting('privacy', item.key, !(settings.privacy as any)[item.key])}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            (settings.privacy as any)[item.key] ? 'bg-rose-500' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              (settings.privacy as any)[item.key] ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <div>
                      <Input
                        label="数据保留天数"
                        type="number"
                        value={settings.privacy.dataRetentionDays.toString()}
                        onChange={(e) => updateSetting('privacy', 'dataRetentionDays', parseInt(e.target.value) || 365)}
                      />
                      <p className="text-xs text-white/50 mt-1">用户数据自动清理的保留期限</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
