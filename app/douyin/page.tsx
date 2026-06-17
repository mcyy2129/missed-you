'use client';

import { useEffect, useRef, useState } from 'react';

export default function DouyinPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => setLoaded(true);
    iframe.addEventListener('load', onLoad);

    iframe.src = '/douyin/index.html';

    return () => iframe.removeEventListener('load', onLoad);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#000' }}>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #f43f5e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>加载中...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        style={{ width: '100vw', height: '100vh', border: 'none', position: 'relative', zIndex: 99999 }}
        allow="autoplay; fullscreen; picture-in-picture"
        title="抖音"
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
