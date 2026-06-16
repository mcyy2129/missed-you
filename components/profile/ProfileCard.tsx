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
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(74, 63, 51, 0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className="bg-cream-50 rounded-card p-5 shadow-md cursor-pointer transition-shadow"
    >
      <div className="flex items-center gap-4 mb-3">
        <div onClick={handleProfileClick} className="cursor-pointer">
          <Avatar src={user.avatar} alt={user.name} size="lg" />
        </div>
        <div onClick={handleProfileClick} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-brown-800 hover:text-rose-500 transition-colors">
            {user.name}
            <span className="text-sm font-normal text-bronze-500 ml-1.5">{user.age}</span>
          </h3>
          <p className="text-xs text-brown-600">{user.city}</p>
        </div>
      </div>

      <p className="text-sm text-brown-600 leading-relaxed mb-3 line-clamp-2">
        {user.bio}
      </p>

      <InterestTags interests={user.interests} />
    </motion.div>
  );
});

export default ProfileCard;
