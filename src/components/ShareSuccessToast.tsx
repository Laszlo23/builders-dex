import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

type ShareSuccessToastProps = {
  show: boolean;
  onDismiss: () => void;
  /** XP granted this push (0 if capped) */
  xp?: number;
  remaining?: number;
  capped?: boolean;
};

export default function ShareSuccessToast({
  show,
  onDismiss,
  xp = 0,
  remaining,
  capped = false,
}: ShareSuccessToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[150] -translate-x-1/2 transform transition-all duration-300 sm:bottom-8 ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-ink/95 px-5 py-3.5 shadow-[0_0_40px_-8px_rgba(200,232,104,0.45)] backdrop-blur-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_50%,rgba(200,232,104,0.18),transparent_55%)]"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/40">
            {capped && xp <= 0 ? (
              <Zap className="h-5 w-5 text-steel" />
            ) : (
              <Sparkles className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            {xp > 0 ? (
              <>
                <p className="font-display text-sm font-bold text-accent">+{xp} XP · Signal sent</p>
                <p className="font-mono text-[10px] text-steel">
                  {remaining === 0
                    ? 'Daily share energy depleted — reset at UTC midnight'
                    : `${remaining} share boost${remaining === 1 ? '' : 's'} left today`}
                </p>
              </>
            ) : capped ? (
              <>
                <p className="font-display text-sm font-bold text-white">Shared · cap reached</p>
                <p className="font-mono text-[10px] text-steel">
                  Come back tomorrow for more signal XP
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-sm font-bold text-accent">Signal broadcast</p>
                <p className="font-mono text-[10px] text-steel">Discovery copied to clipboard</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
