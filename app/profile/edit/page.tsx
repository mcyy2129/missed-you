'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const INTERESTS = [
  '摄影', '旅行', '音乐', '绘画', '阅读', '健身',
  '烹饪', '电影', '咖啡', '手作', '瑜伽', '写作',
  '猫', '狗', '美食', '游戏', '科技', '运动',
];

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=avatar10',
];

export default function EditProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile } = useApp();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAge(currentUser.age?.toString() || '');
      setCity(currentUser.city || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setSelectedInterests(currentUser.interests || []);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser === null && typeof window !== 'undefined') {
      router.replace('/auth');
    }
  }, [currentUser, router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        age: parseInt(age) || 0,
        city: city.trim(),
        bio: bio.trim(),
        avatar,
        interests: selectedInterests,
      });
      router.push('/profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="text-sm text-bronze-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-semibold text-brown-800">
              编辑资料
            </h1>
            <button
              onClick={() => router.back()}
              className="text-sm text-bronze-500 hover:text-bronze-600"
            >
              取消
            </button>
          </div>

          <div className="bg-cream-50 rounded-card p-5 shadow-md mb-6">
            <h3 className="text-sm font-medium text-brown-800 mb-3">头像</h3>
            <div className="flex items-center gap-4">
              <div 
                className="relative cursor-pointer"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                <Avatar src={avatar} alt={name} size="xl" />
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">更换</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-brown-700">点击头像更换</p>
                <p className="text-xs text-bronze-400 mt-1">选择或上传你喜欢的头像</p>
              </div>
            </div>

            {showAvatarPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 overflow-hidden"
              >
                <label className="flex items-center justify-center gap-2 w-full py-3 mb-3 bg-cream-100 border border-dashed border-bronze-300 rounded-lg cursor-pointer hover:bg-cream-200 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setAvatar(event.target?.result as string);
                          setShowAvatarPicker(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className="text-lg">📷</span>
                  <span className="text-sm text-brown-700">上传本地图片</span>
                </label>

                <p className="text-xs text-bronze-400 mb-2">或选择预设头像</p>
                <div className="grid grid-cols-5 gap-3">
                  {AVATARS.map((avatarUrl) => (
                    <button
                      key={avatarUrl}
                      onClick={() => {
                        setAvatar(avatarUrl);
                        setShowAvatarPicker(false);
                      }}
                      className={`p-1 rounded-full border-2 transition-colors ${
                        avatar === avatarUrl
                          ? 'border-bronze-300 bg-cream-100'
                          : 'border-transparent hover:border-cream-200'
                      }`}
                    >
                      <img src={avatarUrl} alt="avatar" className="w-full rounded-full" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-cream-50 rounded-card p-5 shadow-md mb-6">
            <h3 className="text-sm font-medium text-brown-800 mb-3">基本信息</h3>
            <div className="flex flex-col gap-4">
              <Input
                label="昵称"
                placeholder="你的昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="年龄"
                  type="number"
                  placeholder="年龄"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <Input
                  label="城市"
                  placeholder="所在城市"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-cream-50 rounded-card p-5 shadow-md mb-6">
            <h3 className="text-sm font-medium text-brown-800 mb-3">个人简介</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下你自己..."
              className="w-full h-24 p-3 bg-cream-100 border border-cream-200 rounded-lg text-sm text-brown-800 placeholder:text-bronze-400 focus:outline-none focus:ring-2 focus:ring-bronze-300/30 resize-none"
            />
            <p className="text-[10px] text-bronze-400 mt-1 text-right">
              {bio.length}/200
            </p>
          </div>

          <div className="bg-cream-50 rounded-card p-5 shadow-md mb-6">
            <h3 className="text-sm font-medium text-brown-800 mb-3">兴趣爱好</h3>
            <p className="text-xs text-bronze-500 mb-3">选择你的兴趣（最多6个）</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                const isDisabled = !isSelected && selectedInterests.length >= 6;
                return (
                  <button
                    key={interest}
                    onClick={() => !isDisabled && toggleInterest(interest)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-full text-sm font-sans transition-colors ${
                      isSelected
                        ? 'bg-bronze-300 text-white'
                        : isDisabled
                          ? 'bg-cream-100 text-brown-400 cursor-not-allowed'
                          : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-bronze-400 mt-2">
              已选择 {selectedInterests.length}/6 个
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full"
            disabled={saving || !name.trim()}
          >
            {saving ? '保存中...' : '保存修改'}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
