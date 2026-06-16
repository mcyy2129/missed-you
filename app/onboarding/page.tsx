'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const INTERESTS = [
  '摄影', '旅行', '音乐', '绘画', '阅读', '健身',
  '烹饪', '电影', '咖啡', '手作', '瑜伽', '写作',
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { completeProfile } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      completeProfile(`${name}, ${age}, ${city}`, selectedInterests);
      router.push('/');
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const progressWidth = `${((step + 1) / TOTAL_STEPS) * 100}%`;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        {/* Progress dots */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full h-1 rounded-full bg-cream-200">
            <motion.div
              className="h-full rounded-full bg-bronze-300"
              initial={false}
              animate={{ width: progressWidth }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-bronze-300' : 'bg-cream-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden min-h-[200px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl text-brown-800 text-center">
                    你的名字？
                  </h2>
                  <Input
                    label="昵称"
                    placeholder="你希望大家怎么称呼你"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl text-brown-800 text-center">
                    基本信息
                  </h2>
                  <Input
                    label="城市"
                    placeholder="你所在的城市"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="年龄"
                    type="number"
                    placeholder="你的年龄"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-2xl text-brown-800 text-center">
                    兴趣标签
                  </h2>
                  <p className="text-sm text-brown-600 text-center">
                    选择你的兴趣，帮助我们为你匹配
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {INTERESTS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm font-sans transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-bronze-300 text-white'
                              : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={goNext}
            className="w-full"
            disabled={step === 0 && !name.trim()}
          >
            {step === TOTAL_STEPS - 1 ? '完成' : '下一步'}
          </Button>
          {step > 0 && (
            <Button variant="ghost" onClick={goBack} className="w-full">
              上一步
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
