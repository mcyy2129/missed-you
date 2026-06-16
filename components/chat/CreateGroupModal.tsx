'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

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
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participantIds: string[]) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const { users, currentUser } = useApp();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [aiPersonas, setAiPersonas] = useState<AIPersona[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users');

  useEffect(() => {
    if (isOpen) {
      fetchAIPersonas();
    }
  }, [isOpen]);

  const fetchAIPersonas = async () => {
    try {
      const res = await fetch('/api/admin/ai-personas');
      const data = await res.json();
      setAiPersonas(data);
    } catch (error) {
      console.error('Failed to fetch AI personas:', error);
    }
  };

  const availableUsers = users.filter(u => u.id !== currentUser?.id && !u.id.startsWith('ai-'));

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (selectedUsers.length === 0) return;
    const name = groupName.trim() || selectedUsers
      .map(id => {
        const user = users.find(u => u.id === id);
        const ai = aiPersonas.find(a => a.id === id);
        return user?.name || ai?.name;
      })
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');
    onCreateGroup(name, selectedUsers);
    handleClose();
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    setStep('select');
    setActiveTab('users');
    onClose();
  };

  const getSelectedNames = () => {
    return selectedUsers.map(id => {
      const user = users.find(u => u.id === id);
      const ai = aiPersonas.find(a => a.id === id);
      return user?.name || ai?.name || '';
    }).filter(Boolean);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl"
          >
            <div className="w-10 h-1 bg-white/8 rounded-full mx-auto mt-3" />

            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">
                  {step === 'select' ? '选择成员' : '群聊名称'}
                </h3>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/8 transition-colors"
                >
                  ✕
                </button>
              </div>

              {step === 'select' ? (
                <>
                  {/* Selected Count */}
                  {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-white/50">已选 {selectedUsers.length} 人</span>
                      <div className="flex -space-x-2">
                        {selectedUsers.slice(0, 5).map(id => {
                          const user = users.find(u => u.id === id);
                          const ai = aiPersonas.find(a => a.id === id);
                          const avatar = user?.avatar || ai?.avatar;
                          const name = user?.name || ai?.name;
                          return avatar ? (
                            <div key={id} className="relative">
                              <img src={avatar} alt={name} className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                              {id.startsWith('ai-') && (
                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-violet-500 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-[5px] text-white font-bold">AI</span>
                                </div>
                              )}
                              <button
                                onClick={() => toggleUser(id)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center"
                              >
                                ✕
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tab Switcher */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'users'
                          ? 'bg-slate-800 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/8'
                      }`}
                    >
                      👥 真实用户
                    </button>
                    <button
                      onClick={() => setActiveTab('ai')}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === 'ai'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/8'
                      }`}
                    >
                      🤖 AI 伙伴
                    </button>
                  </div>

                  {/* User List */}
                  <div className="max-h-[350px] overflow-y-auto">
                    {activeTab === 'users' && availableUsers.map((user) => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                        <motion.button
                          key={user.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleUser(user.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isSelected ? 'bg-rose-50' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="relative">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                            {user.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-white/50">{user.city}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}

                    {activeTab === 'ai' && aiPersonas.map((persona) => {
                      const isSelected = selectedUsers.includes(persona.id);
                      return (
                        <motion.button
                          key={persona.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleUser(persona.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isSelected ? 'bg-violet-50' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="relative">
                            <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[6px] font-bold rounded-full">
                              AI
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{persona.name}</p>
                            <p className="text-xs text-white/50 line-clamp-1">{persona.bio}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-violet-500 border-violet-500' : 'border-slate-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <Button
                      onClick={() => selectedUsers.length > 0 && setStep('name')}
                      disabled={selectedUsers.length === 0}
                      className="w-full"
                    >
                      下一步 ({selectedUsers.length})
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Group Name Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      群聊名称
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="输入群聊名称（可选）"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      maxLength={20}
                    />
                    <p className="text-xs text-white/40 mt-1">
                      不填则自动使用成员昵称
                    </p>
                  </div>

                  {/* Selected Members Preview */}
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-2">群成员 ({selectedUsers.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(id => {
                        const user = users.find(u => u.id === id);
                        const ai = aiPersonas.find(a => a.id === id);
                        const name = user?.name || ai?.name;
                        const isAI = id.startsWith('ai-');
                        return name ? (
                          <div key={id} className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                            isAI ? 'bg-violet-100' : 'bg-white/5'
                          }`}>
                            <span className="text-xs text-white/80">{name}</span>
                            {isAI && <span className="text-[8px] text-violet-600 font-medium">AI</span>}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setStep('select')}
                    >
                      返回
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleCreate}
                    >
                      创建群聊
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
