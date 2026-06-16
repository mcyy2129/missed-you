'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { AISkill } from '@/lib/types';

interface AIPersona {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  personality: string;
  greeting: string;
  avatar: string;
  skillId?: string;
  skillIds?: string[];
}

const INTEREST_OPTIONS = [
  '摄影', '旅行', '音乐', '绘画', '阅读', '健身',
  '烹饪', '电影', '咖啡', '手作', '瑜伽', '写作',
  '唱歌', '追剧', '甜品', '奶茶', '编程', '博客',
  '插画', '逛展', '猫咪', '火锅', '冥想', '健康饮食',
];

export default function AIPersonasAdminPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [skills, setSkills] = useState<AISkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPersonas();
    fetchSkills();
  }, []);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/admin/ai-personas');
      const data = await res.json();
      setPersonas(data);
    } catch (error) {
      console.error('Failed to fetch personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/admin/ai-skills');
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const handleSave = async () => {
    if (!editingPersona) return;
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/ai-personas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPersona),
      });
      if (res.ok) {
        await fetchPersonas();
        setEditingPersona(null);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to save persona:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个AI角色吗？')) return;
    try {
      await fetch(`/api/admin/ai-personas?id=${id}`, { method: 'DELETE' });
      await fetchPersonas();
    } catch (error) {
      console.error('Failed to delete persona:', error);
    }
  };

  const handleCreate = () => {
    setEditingPersona({
      id: '',
      name: '',
      age: 25,
      city: '北京',
      bio: '',
      interests: [],
      personality: '',
      greeting: '你好呀~',
      avatar: 'https://i.pravatar.cc/300?img=1',
      skillId: 'skill-cute',
      skillIds: ['skill-cute', 'skill-web-search'],
    });
    setIsCreating(true);
  };

  const toggleInterest = (interest: string) => {
    if (!editingPersona) return;
    const interests = editingPersona.interests.includes(interest)
      ? editingPersona.interests.filter(i => i !== interest)
      : [...editingPersona.interests, interest];
    setEditingPersona({ ...editingPersona, interests });
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
                  className="text-white/50 hover:text-white/80 transition-colors"
                >
                  ← 返回
                </button>
              </div>
              <h1 className="text-2xl font-display font-semibold text-white">
                AI 角色管理
              </h1>
              <p className="text-sm text-white/50 mt-1">
                管理AI聊天机器人的资料、头像和性格设置
              </p>
            </div>
            <Button onClick={handleCreate}>
              + 新建角色
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-white/50">加载中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona, index) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-md border border-white/8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar src={persona.avatar} alt={persona.name} size="lg" />
                      <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-[8px] font-bold rounded-full">
                        AI
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">
                        {persona.name}
                        <span className="text-sm font-normal text-white/50 ml-1.5">{persona.age}岁</span>
                      </h3>
                      <p className="text-xs text-white/50">{persona.city}</p>
                      {(persona.skillIds?.length || persona.skillId) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(persona.skillIds || (persona.skillId ? [persona.skillId] : [])).map(skillId => {
                            const skill = skills.find(s => s.id === skillId);
                            return skill ? (
                              <span key={skillId} className={`text-[8px] px-1.5 py-0.5 rounded ${
                                skillId === 'skill-web-search'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : skillId.startsWith('codex-')
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-violet-100 text-violet-600'
                              }`}>
                                {skillId === 'skill-web-search' ? '🔍' : skillId.startsWith('codex-') ? '⚡' : '🎨'} {skill.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">
                    {persona.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {persona.interests.slice(0, 4).map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 bg-white/5 text-white/60 rounded-full text-[10px]"
                      >
                        {interest}
                      </span>
                    ))}
                    {persona.interests.length > 4 && (
                      <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded-full text-[10px]">
                        +{persona.interests.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPersona(persona);
                        setIsCreating(false);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 text-white/80 rounded-lg text-sm hover:bg-white/8 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="px-3 py-2 text-white/40 hover:text-rose-500 transition-colors"
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
        {editingPersona && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingPersona(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {isCreating ? '新建AI角色' : '编辑AI角色'}
                </h3>
                <button
                  onClick={() => setEditingPersona(null)}
                  className="text-white/40 hover:text-white/60"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar src={editingPersona.avatar} alt={editingPersona.name} size="lg" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-white/50 mb-1 block">头像URL</label>
                    <input
                      type="text"
                      value={editingPersona.avatar}
                      onChange={(e) => setEditingPersona({ ...editingPersona, avatar: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="https://i.pravatar.cc/300?img=1"
                    />
                    <div className="flex gap-2 mt-2">
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => (
                        <button
                          key={num}
                          onClick={() => setEditingPersona({ ...editingPersona, avatar: `https://i.pravatar.cc/300?img=${num}` })}
                          className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-rose-500 transition-colors"
                        >
                          <img src={`https://i.pravatar.cc/300?img=${num}`} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">名字</label>
                    <input
                      type="text"
                      value={editingPersona.name}
                      onChange={(e) => setEditingPersona({ ...editingPersona, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                      placeholder="小美"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">年龄</label>
                    <input
                      type="number"
                      value={editingPersona.age}
                      onChange={(e) => setEditingPersona({ ...editingPersona, age: parseInt(e.target.value) || 25 })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="text-xs text-white/50 mb-1 block">城市</label>
                  <input
                    type="text"
                    value={editingPersona.city}
                    onChange={(e) => setEditingPersona({ ...editingPersona, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                    placeholder="上海"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs text-white/50 mb-1 block">个人简介</label>
                  <textarea
                    value={editingPersona.bio}
                    onChange={(e) => setEditingPersona({ ...editingPersona, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none h-20"
                    placeholder="活泼开朗的奶茶店店员..."
                  />
                </div>

                {/* Personality */}
                <div>
                  <label className="text-xs text-white/50 mb-1 block">性格描述</label>
                  <textarea
                    value={editingPersona.personality}
                    onChange={(e) => setEditingPersona({ ...editingPersona, personality: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none h-20"
                    placeholder="活泼可爱，喜欢用表情包..."
                  />
                </div>

                {/* Skill Selection */}
                <div>
                  <label className="text-xs text-white/50 mb-2 block">技能组合（可多选）</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => {
                      const selectedIds = editingPersona.skillIds || (editingPersona.skillId ? [editingPersona.skillId] : []);
                      const isSelected = selectedIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => {
                            let newIds: string[];
                            if (isSelected) {
                              newIds = selectedIds.filter(id => id !== skill.id);
                            } else {
                              newIds = [...selectedIds, skill.id];
                            }
                            setEditingPersona({
                              ...editingPersona,
                              skillIds: newIds,
                              skillId: newIds[0] || '',
                            });
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                            isSelected
                              ? skill.id.startsWith('codex-')
                                ? 'bg-blue-500 text-white'
                                : skill.id === 'skill-web-search'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-violet-500 text-white'
                              : skill.id.startsWith('codex-')
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : skill.id === 'skill-web-search'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-white/5 text-white/60 hover:bg-white/8'
                          }`}
                        >
                          {skill.id.startsWith('codex-') ? '⚡ ' : ''}{skill.id === 'skill-web-search' ? '🔍 ' : ''}{skill.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    🔍 = 联网搜索 | ⚡ = Codex技能库 | 点击选中/取消
                  </p>
                </div>

                {/* Greeting */}
                <div>
                  <label className="text-xs text-white/50 mb-1 block">开场白</label>
                  <textarea
                    value={editingPersona.greeting}
                    onChange={(e) => setEditingPersona({ ...editingPersona, greeting: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none h-16"
                    placeholder="嗨～你好呀！我是小美..."
                  />
                </div>

                {/* Interests */}
                <div>
                  <label className="text-xs text-white/50 mb-2 block">兴趣标签</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          editingPersona.interests.includes(interest)
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/8'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingPersona(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white/80 rounded-lg text-sm hover:bg-white/8 transition-colors"
                >
                  取消
                </button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editingPersona.name}
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
