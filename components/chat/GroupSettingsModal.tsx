'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/Button';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
}

export default function GroupSettingsModal({ isOpen, onClose, conversationId }: GroupSettingsModalProps) {
  const { conversations, getUser, currentUser, users, updateGroupSettings, removeGroupMember, addGroupMember } = useApp();
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'settings'>('info');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const conversation = conversations.find((c: any) => c.id === conversationId);

  useEffect(() => {
    if (isOpen && conversation) {
      setGroupName(conversation.groupName || '');
      setGroupDescription(conversation.groupDescription || '');
      setGroupAvatar(conversation.groupAvatar || '');
    }
  }, [isOpen, conversation]);

  const members = conversation?.participants.map((id: string) => getUser(id)).filter(Boolean) || [];
  const isCreator = conversation?.createdBy === currentUser?.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      updateGroupSettings(conversationId, {
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        groupAvatar,
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save group settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setGroupAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm('确定要移除该成员吗？')) {
      removeGroupMember(conversationId, userId);
    }
  };

  const handleAddMember = (userId: string) => {
    addGroupMember(conversationId, userId);
    setShowAddMember(false);
  };

  if (!conversation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">群聊设置</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-100">
              {[
                { id: 'info' as const, label: '群信息', icon: '📋' },
                { id: 'members' as const, label: '成员', icon: '👥' },
                ...(isCreator ? [{ id: 'settings' as const, label: '管理', icon: '⚙️' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-rose-500'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="group-settings-tab"
                      className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-rose-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="p-5">
                  {/* Group Avatar & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {groupAvatar ? (
                        <img src={groupAvatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl">
                          👥
                        </div>
                      )}
                      {isCreator && (
                        <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1">
                      {isCreator ? (
                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="w-full text-lg font-semibold text-slate-800 bg-transparent border-b border-slate-200 focus:outline-none focus:border-rose-500 pb-1"
                          placeholder="输入群聊名称"
                        />
                      ) : (
                        <h4 className="text-lg font-semibold text-slate-800">{groupName || '未命名群聊'}</h4>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{members.length} 位成员</p>
                    </div>
                  </div>

                  {/* Group Description */}
                  <div className="mb-6">
                    <label className="text-xs text-slate-500 mb-2 block font-medium">群公告/简介</label>
                    {isCreator ? (
                      <textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
                        rows={3}
                        placeholder="输入群聊简介..."
                      />
                    ) : (
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {groupDescription || '暂无简介'}
                      </p>
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">群聊ID</span>
                      <span className="text-xs text-slate-400 font-mono">{conversationId.slice(0, 16)}...</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">创建时间</span>
                      <span className="text-xs text-slate-400">
                        {conversation.created_at 
                          ? new Date(conversation.created_at).toLocaleDateString('zh-CN')
                          : '未知'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">消息数量</span>
                      <span className="text-xs text-slate-400">{conversation.messages?.length || 0} 条</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  {isCreator && (
                    <div className="mt-6">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? '保存中...' : saveSuccess ? '✓ 已保存' : '保存修改'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-slate-800">成员列表 ({members.length})</h4>
                    {isCreator && (
                      <button
                        onClick={() => setShowAddMember(!showAddMember)}
                        className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                      >
                        + 添加成员
                      </button>
                    )}
                  </div>

                  {/* Add Member Panel */}
                  <AnimatePresence>
                    {showAddMember && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-2">选择要添加的成员</p>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {users
                              .filter((u: any) => !conversation.participants.includes(u.id) && u.id !== currentUser?.id)
                              .map((user: any) => (
                                <button
                                  key={user.id}
                                  onClick={() => handleAddMember(user.id)}
                                  className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                  <span className="text-sm text-slate-700">{user.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Member List */}
                  <div className="space-y-1">
                    {members.map((member: any) => {
                      const isAI = member.id?.startsWith('ai-');
                      const isGroupCreator = member.id === conversation.createdBy;
                      
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="relative">
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                            {isAI && (
                              <div className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[6px] font-bold rounded-full">
                                AI
                              </div>
                            )}
                            {member.isOnline && !isAI && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-slate-800">{member.name}</span>
                              {isGroupCreator && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-medium rounded">
                                  群主
                                </span>
                              )}
                              {isAI && (
                                <span className="px-1.5 py-0.5 bg-violet-100 text-violet-600 text-[9px] font-medium rounded">
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{member.bio?.slice(0, 30) || member.city || '暂无介绍'}</p>
                          </div>
                          {isCreator && !isGroupCreator && !isAI && (
                            <button 
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              移除
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Settings Tab (Creator Only) */}
              {activeTab === 'settings' && isCreator && (
                <div className="p-5">
                  <h4 className="text-sm font-medium text-slate-800 mb-4">群聊设置</h4>
                  
                  <div className="space-y-4">
                    {/* Permissions */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="text-xs font-medium text-slate-500 mb-3">权限设置</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">仅群主可发消息</span>
                          <button className="w-10 h-6 bg-slate-200 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">允许成员邀请</span>
                          <button className="w-10 h-6 bg-rose-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">AI 自动回复</span>
                          <button className="w-10 h-6 bg-slate-200 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h5 className="text-xs font-medium text-slate-500 mb-3">通知设置</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">消息免打扰</span>
                          <button className="w-10 h-6 bg-slate-200 rounded-full relative">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">@提醒通知</span>
                          <button className="w-10 h-6 bg-rose-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 rounded-xl p-4">
                      <h5 className="text-xs font-medium text-red-500 mb-3">危险操作</h5>
                      <button 
                        onClick={() => {
                          if (confirm('确定要解散群聊吗？此操作不可撤销。')) {
                            // Remove conversation from state
                            onClose();
                          }
                        }}
                        className="w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        解散群聊
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
