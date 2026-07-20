import React, { useEffect, useRef, useState } from 'react';
import Atmosphere from './Atmosphere';
import OptimizedImage from './OptimizedImage';

/**
 * Full-bleed cinematic background.
 * Mixkit space loop + local poster fallback + atmosphere layer.
 * Video only loads when the hero is near the viewport.
 */
const VIDEO_SRC = 'https://assets.mixkit.co/videos/1610/1610-720.mp4';
const VIDEO_SRC_FALLBACK = 'https://assets.mixkit.co/videos/1702/1702-720.mp4';
const POSTER = '/hero-poster.jpg';

type Props = {
  /** Stronger dim for readable UI panels (swap) */
  intensity?: 'hero' | 'panel';
  className?: string;
};

export default function VideoBackground({ intensity = 'hero', className = '' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = 0.8;
    const play = el.play();
    if (play) {
      play.catch(() => {
        /* autoplay blocked — poster still shows */
      });
    }
  }, [shouldLoad]);

  const veil =
    intensity === 'hero'
      ? 'bg-[linear-gradient(180deg,rgba(7,8,10,0.55)_0%,rgba(7,8,10,0.62)_35%,rgba(7,8,10,0.88)_78%,#07080A_100%)]'
      : 'bg-[linear-gradient(180deg,rgba(7,8,10,0.72)_0%,rgba(7,8,10,0.82)_40%,rgba(7,8,10,0.95)_100%)]';

  return (
    <div
      ref={rootRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {shouldLoad && !failed ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full scale-110 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
          onError={() => setFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          <source src={VIDEO_SRC_FALLBACK} type="video/mp4" />
        </video>
      ) : (
        <OptimizedImage
          src={POSTER}
          alt=""
          priority={intensity === 'hero'}
          className="absolute inset-0 h-full w-full scale-110 object-cover"
          sizes="100vw"
        />
      )}

      <div className={`absolute inset-0 ${veil}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,8,10,0.35)_55%,#07080A_100%)]" />
      <Atmosphere variant={intensity === 'hero' ? 'hero' : 'app'} />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
    </div>
  );
}
