'use client';

import { motion } from 'framer-motion';

interface QQLoginButtonProps {
  onClick?: () => void;
}

export default function QQLoginButton({ onClick }: QQLoginButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(18,183,245,0.3)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 rounded-card bg-[#12B7F5] text-white font-sans font-medium py-3 px-6 cursor-pointer select-none hover:bg-[#0EA5E0] transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M21.395 15.035a39.548 39.548 0 0 0-1.266-3.334c.19-1.26.27-2.565.27-3.9 0-7.378-3.582-8.8-3.582-8.8s1.482-2.937-1.045-5.506C13.896-2.167 11.243 0 11.243 0S7.066-.33 5.12 1.63C2.594 4.166 4.076 7.103 4.076 7.103S1.33 6.913 0 8.173C0 8.173 1.49 12.16 6.165 12.8c-.062.45-.163 1.32-.163 2.235 0 .48.042.948.11 1.4H6.1a12.096 12.096 0 0 0 3.535.545h.85c1.226-.027 2.436-.168 3.584-.447.065-.43.11-.872.11-1.323 0-.48-.048-.943-.12-1.4h.006c3.592-.36 6.2-2.53 6.2-5.166 0-.237-.007-.47-.02-.7z" />
      </svg>
      QQ 一键登录
    </motion.button>
  );
}
