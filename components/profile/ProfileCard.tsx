'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';
import InterestTags from '@/components/profile/InterestTags';
import { User } from '@/lib/types';

interface ProfileCardProps {
  user: User;
  onClick?: () => void;
}

const ProfileCard = memo(function ProfileCard({ user, onClick }: ProfileCardProps) {
  const router = useRouter();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${user.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className="glass-card rounded-2xl p-5 cursor-pointer transition-all border border-white/10 hover:border-white/15"
    >
      <div className="flex items-center gap-4 mb-3">
        <div onClick={handleProfileClick} className="cursor-pointer">
          <Avatar src={user.avatar} alt={user.name} size="lg" />
        </div>
        <div onClick={handleProfileClick} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-white hover:text-lime-400 transition-colors">
            {user.name}
            <span className="text-sm font-normal text-white/40 ml-1.5">{user.age}</span>
          </h3>
          <p className="text-xs text-white/50">{user.city}</p>
        </div>
      </div>

      <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">
        {user.bio}
      </p>

      <InterestTags interests={user.interests} />
    </motion.div>
  );
});

export default ProfileCard;
