import React, { useEffect, useState } from 'react';

/**
 * Lightweight CSS confetti — tasteful burst, no bloat
 */

type ConfettiEffectProps = {
  trigger: boolean;
  onComplete?: () => void;
};

export default function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!active) return null;

  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#C8E868', '#FFD700', '#3B82F6', '#10B981', '#9333EA'][i % 5],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 0.5,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece absolute"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            width: '8px',
            height: '8px',
            backgroundColor: piece.color,
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s forwards`,
            borderRadius: '2px',
            opacity: 0.9,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
