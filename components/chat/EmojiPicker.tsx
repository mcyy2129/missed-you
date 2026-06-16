'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomEmoji {
  id: string;
  url: string;
  name: string;
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onStickerSelect?: (sticker: string) => void;
  onClose?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: '常用',
    icon: '⭐',
    emojis: ['😊', '❤️', '🥰', '😂', '😍', '💕', '🥺', '✨', '🌸', '🎉', '👋', '🔥', '💫', '🌙', '☕', '😘', '🤗', '😏', '🙄', '😴'],
  },
  {
    name: '表情',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  },
  {
    name: '手势',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾', '🖕'],
  },
  {
    name: '动物',
    icon: '🐱',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞'],
  },
  {
    name: '食物',
    icon: '🍕',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯'],
  },
  {
    name: '物品',
    icon: '🎁',
    emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🛢️', '💰', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️'],
  },
  {
    name: '符号',
    icon: '💕',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺'],
  },
];

const STICKERS = [
  '🐱', '🐶', '🐻', '🐼', '🦊', '🐰', '🐸', '🐵',
  '🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '🍀', '🍁',
  '⭐', '🌟', '💫', '✨', '🔥', '💧', '🌈', '☁️',
  '🎉', '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🎵',
  '❤️', '💕', '💖', '💗', '💘', '💝', '🥰', '😘',
];

export default function EmojiPicker({ onSelect, onStickerSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [customEmojis, setCustomEmojis] = useState<CustomEmoji[]>([]);
  const [showStickers, setShowStickers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadCustomEmoji = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      alert('表情包大小不能超过 512KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newEmoji: CustomEmoji = {
        id: `custom-${Date.now()}`,
        url: event.target?.result as string,
        name: file.name.split('.')[0],
      };
      setCustomEmojis(prev => [...prev, newEmoji]);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden bg-white border-t border-white/10/50"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadCustomEmoji}
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/8">
        <button
          onClick={() => setShowStickers(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !showStickers ? 'bg-rose-100 text-rose-600' : 'text-white/50 hover:bg-white/5'
          }`}
        >
          😊 表情
        </button>
        <button
          onClick={() => setShowStickers(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            showStickers ? 'bg-rose-100 text-rose-600' : 'text-white/50 hover:bg-white/5'
          }`}
        >
          🎨 贴纸
        </button>
        <div className="flex-1" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-white/50 hover:bg-white/5 transition-colors"
        >
          ➕ 上传
        </button>
      </div>

      {showStickers ? (
        /* Stickers Grid */
        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            {STICKERS.map((sticker, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onStickerSelect?.(sticker)}
                className="text-3xl p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                {sticker}
              </motion.button>
            ))}
          </div>

          {/* Custom Emojis */}
          {customEmojis.length > 0 && (
            <>
              <div className="mt-3 pt-3 border-t border-white/8">
                <p className="text-xs text-white/50 mb-2">我的表情包</p>
                <div className="grid grid-cols-6 gap-2">
                  {customEmojis.map((emoji) => (
                    <motion.button
                      key={emoji.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSelect(emoji.url)}
                      className="w-12 h-12 rounded-xl overflow-hidden hover:bg-white/5 transition-colors"
                    >
                      <img src={emoji.url} alt={emoji.name} className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Emoji Categories */
        <>
          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-hide">
            {EMOJI_CATEGORIES.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(index)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  activeCategory === index
                    ? 'bg-rose-100 text-rose-600'
                    : 'text-white/50 hover:bg-white/5'
                }`}
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Emojis Grid */}
          <div className="p-3 max-h-[200px] overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
                <motion.button
                  key={`${activeCategory}-${index}`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSelect(emoji)}
                  className="text-2xl p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
