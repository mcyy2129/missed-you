'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import { AISkill } from '@/lib/types';

const RESPONSE_STYLES = [
  { value: 'cute', label: '可爱甜美', emoji: '😊' },
  { value: 'mature', label: '成熟知性', emoji: '🧐' },
  { value: 'mysterious', label: '神秘魅力', emoji: '🌙' },
  { value: 'playful', label: '幽默风趣', emoji: '😄' },
  { value: 'gentle', label: '温柔体贴', emoji: '🌸' },
];

export default function AISkillsAdminPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<AISkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<AISkill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/ai-skills');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSkill) return;
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/ai-skills', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSkill),
      });
      if (res.ok) {
        await fetchSkills();
        setEditingSkill(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to save skill:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个Skill吗？')) return;
    try {
      await fetch(`/api/admin/ai-skills?id=${id}`, { method: 'DELETE' });
      await fetchSkills();
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleCreate = () => {
    setEditingSkill({
      id: '',
      name: '',
      description: '',
      systemPrompt: '',
      responseStyle: 'cute',
      greetingTemplate: '你好呀~',
      personalityTraits: [],
      conversationStarters: [],
      responseTemplates: { default: ['嗯嗯~'] },
    });
    setIsCreating(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/ai-skills/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const newSkill = await res.json();
        await fetchSkills();
        setEditingSkill(newSkill);
        setIsCreating(false);
      } else {
        const err = await res.json();
        alert(err.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

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
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ← 返回
                </button>
              </div>
              <h1 className="text-2xl font-display font-semibold text-slate-800">
                AI Skill 管理
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                管理AI聊天机器人的对话风格和人设技能
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileInput}
                className="hidden"
              />
              <button
                onClick={() => fetchSkills()}
                className="px-4 py-2.5 bg-slate-500 text-white rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors"
              >
                🔄 刷新
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {uploading ? '上传中...' : '📄 上传文件'}
              </button>
              <Button onClick={handleCreate}>
                + 新建Skill
              </Button>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`mb-6 border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-violet-400 bg-violet-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-4xl mb-2">📁</div>
            <p className="text-sm text-slate-600 mb-1">
              拖拽 Skill 文件到这里，或点击上方「上传文件」按钮
            </p>
            <p className="text-xs text-slate-400">
              支持 .txt（纯文本提示词）、.md（Markdown提示词）、.json（完整Skill配置）
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-slate-500">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      skill.id.startsWith('codex-')
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                        : skill.id.startsWith('skill-')
                          ? 'bg-gradient-to-br from-violet-400 to-pink-400'
                          : 'bg-gradient-to-br from-emerald-400 to-teal-400'
                    }`}>
                      {skill.id.startsWith('codex-') ? '⚡' : RESPONSE_STYLES.find(s => s.value === skill.responseStyle)?.emoji || '😊'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {skill.name}
                        </h3>
                        {skill.id.startsWith('codex-') && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[8px] font-bold">CODEX</span>
                        )}
                        {skill.id.startsWith('skill-') && !skill.id.startsWith('skill-cute') && !skill.id.startsWith('skill-mature') && !skill.id.startsWith('skill-mysterious') && !skill.id.startsWith('skill-playful') && !skill.id.startsWith('skill-gentle') && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-bold">上传</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {skill.id.startsWith('codex-') ? 'Codex技能库' : RESPONSE_STYLES.find(s => s.value === skill.responseStyle)?.label}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">
                    {skill.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skill.personalityTraits.slice(0, 4).map(trait => (
                      <span
                        key={trait}
                        className="px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full text-[10px]"
                      >
                        {trait}
                      </span>
                    ))}
                    {skill.personalityTraits.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px]">
                        +{skill.personalityTraits.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSkill(skill);
                        setIsCreating(false);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="px-3 py-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                  {isCreating ? '新建Skill' : '编辑Skill'}
                </h3>
                <button
                  onClick={() => setEditingSkill(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Skill名称</label>
                  <input
                    type="text"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                    placeholder="可爱甜美"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">描述</label>
                  <input
                    type="text"
                    value={editingSkill.description}
                    onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                    placeholder="活泼可爱，喜欢用表情包..."
                  />
                </div>

                {/* Response Style */}
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">回复风格</label>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_STYLES.map(style => (
                      <button
                        key={style.value}
                        onClick={() => setEditingSkill({ ...editingSkill, responseStyle: style.value as any })}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          editingSkill.responseStyle === style.value
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {style.emoji} {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Greeting Template */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">开场白模板</label>
                  <textarea
                    value={editingSkill.greetingTemplate}
                    onChange={(e) => setEditingSkill({ ...editingSkill, greetingTemplate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 resize-none h-16"
                    placeholder="嗨～你好呀！我是{名字}..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    可用变量：{'{名字}'} {'{年龄}'} {'{城市}'} {'{兴趣}'} {'{emoji}'}
                  </p>
                </div>

                {/* Personality Traits */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">性格标签</label>
                  <input
                    type="text"
                    value={editingSkill.personalityTraits.join(', ')}
                    onChange={(e) => setEditingSkill({ 
                      ...editingSkill, 
                      personalityTraits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                    placeholder="活泼, 可爱, 爱撒娇"
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">系统提示词</label>
                  <textarea
                    value={editingSkill.systemPrompt}
                    onChange={(e) => setEditingSkill({ ...editingSkill, systemPrompt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 resize-none h-40 font-mono"
                    placeholder="你是{名字}，{年龄}岁，来自{城市}..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    定义AI角色的核心人设和对话规则
                  </p>
                </div>

                {/* Conversation Starters */}
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">话题启动器</label>
                  <input
                    type="text"
                    value={editingSkill.conversationStarters.join(', ')}
                    onChange={(e) => setEditingSkill({ 
                      ...editingSkill, 
                      conversationStarters: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                    placeholder="你今天过得怎么样呀？, 你喜欢吃什么呀？"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingSkill(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editingSkill.name}
                  className="flex-1"
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
