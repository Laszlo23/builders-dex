import React, { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Stronger float for hero / featured */
  intensity?: 'soft' | 'medium' | 'strong';
};

/**
 * Cinematic 3D depth card — perspective tilt, specular glare, edge lift.
 */
export default function DepthCard({
  children,
  className = '',
  intensity = 'medium',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const rotateX = useSpring(0, { stiffness: 180, damping: 28 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 28 });
  const lift = useSpring(0, { stiffness: 180, damping: 28 });
  const scale = useSpring(1, { stiffness: 180, damping: 28 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const maxTilt = intensity === 'strong' ? 10 : intensity === 'soft' ? 2.5 : 6;
  const liftPx = intensity === 'strong' ? 12 : intensity === 'soft' ? 2 : 6;
  const scaleAmt = intensity === 'strong' ? 1.015 : intensity === 'soft' ? 1.005 : 1.01;

  const glareBackground = useMotionTemplate`radial-gradient(520px circle at ${glareX}% ${glareY}%, rgba(200, 232, 104,0.18), rgba(255,255,255,0.08) 35%, transparent 58%)`;

  const onMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    lift.set(0);
    scale.set(1);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <div className="depth-scene h-full" style={{ perspective: 1400 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => {
          setHovered(true);
          lift.set(-liftPx);
          scale.set(scaleAmt);
        }}
        onMouseLeave={onLeave}
        style={{
          rotateX,
          rotateY,
          y: lift,
          scale,
          transformPerspective: 1400,
          transformStyle: 'preserve-3d',
        }}
        className={`depth-card relative h-full will-change-transform ${className}`}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] transition-opacity duration-300"
          style={{
            background: glareBackground,
            opacity: hovered ? 1 : 0.25,
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </div>
  );
}
