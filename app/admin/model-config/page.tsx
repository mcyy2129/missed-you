'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

interface ModelConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

const AVAILABLE_MODELS = [
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', provider: 'NVIDIA' },
  { id: 'meta/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'NVIDIA' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'NVIDIA' },
  { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', provider: 'NVIDIA' },
  { id: 'mistralai/mixtral-8x22b-instruct-v0.1', name: 'Mixtral 8x22B', provider: 'NVIDIA' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
];

export default function ModelConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<ModelConfig>({
    apiKey: '',
    model: '',
    baseUrl: '',
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('配置已保存');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;
    setTesting(true);
    setTestResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testMessage }],
          userProfile: { name: '测试用户', age: 25, city: '北京', interests: ['测试'], bio: '测试' },
        }),
      });
      const data = await res.json();
      setTestResult(data.reply || '无回复');
    } catch (error) {
      setTestResult('测试失败: ' + (error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white/5">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  ← 返回
                </button>
              </div>
              <h1 className="text-2xl font-display font-semibold text-white">
                模型配置
              </h1>
              <p className="text-sm text-white/50 mt-1">
                配置AI模型、API接口和对话参数
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-white/50">加载中...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* API Configuration */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-white/8">
                <h2 className="text-lg font-semibold text-white mb-4">API 配置</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">API Key</label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="nvapi-..."
                    />
                    <p className="text-[10px] text-white/40 mt-1">密钥不会明文存储，仅用于当前配置</p>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">API Base URL</label>
                    <input
                      type="text"
                      value={config.baseUrl}
                      onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="https://integrate.api.nvidia.com/v1"
                    />
                  </div>
                </div>
              </div>

              {/* Model Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-white/8">
                <h2 className="text-lg font-semibold text-white mb-4">模型选择</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">选择模型</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AVAILABLE_MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => setConfig({ ...config, model: model.id })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            config.model === model.id
                              ? 'border-rose-500 bg-rose-50'
                              : 'border-white/10 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{model.name}</p>
                              <p className="text-xs text-white/50">{model.provider}</p>
                            </div>
                            {config.model === model.id && (
                              <span className="text-rose-500">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-1 block">自定义模型ID</label>
                    <input
                      type="text"
                      value={config.model}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="minimaxai/minimax-m3"
                    />
                  </div>
                </div>
              </div>

              {/* Generation Parameters */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-white/8">
                <h2 className="text-lg font-semibold text-white mb-4">生成参数</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">
                        Max Tokens: {config.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="128"
                        max="4096"
                        step="128"
                        value={config.maxTokens}
                        onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                        className="w-full accent-rose-500"
                      />
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>128</span>
                        <span>4096</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/50 mb-1 block">
                        Temperature: {config.temperature.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="w-full accent-rose-500"
                      />
                      <div className="flex justify-between text-[10px] text-white/40">
                        <span>精确</span>
                        <span>创意</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-white/8">
                <h2 className="text-lg font-semibold text-white mb-4">系统提示词</h2>
                
                <div>
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none h-32"
                    placeholder="你是一个友善、活泼的聊天伙伴..."
                  />
                  <p className="text-[10px] text-white/40 mt-1">
                    定义AI的基础人格和行为准则，会影响所有对话
                  </p>
                </div>
              </div>

              {/* Test Chat */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-white/8">
                <h2 className="text-lg font-semibold text-white mb-4">测试对话</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="输入测试消息..."
                      onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                    />
                    <Button
                      onClick={handleTest}
                      disabled={testing || !testMessage.trim()}
                    >
                      {testing ? '测试中...' : '发送测试'}
                    </Button>
                  </div>

                  {testResult && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-white/50 mb-2">AI 回复：</p>
                      <p className="text-sm text-white whitespace-pre-wrap">{testResult}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8"
                >
                  {saving ? '保存中...' : '保存配置'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
