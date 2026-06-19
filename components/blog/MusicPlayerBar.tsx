// @ts-nocheck
"use client";

import { useState } from 'react';
import MiniPlayer from './MiniPlayer';
import PopupPlayer from './PopupPlayer';

export default function MusicPlayerBar() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <MiniPlayer onOpenPlayer={() => setIsPopupOpen(true)} />
      <PopupPlayer isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </>
  );
}
