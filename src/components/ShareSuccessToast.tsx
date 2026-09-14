import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type ShareSuccessToastProps = {
  show: boolean;
  onDismiss: () => void;
};

export default function ShareSuccessToast({ show, onDismiss }: ShareSuccessToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[150] -translate-x-1/2 transform transition-all duration-300 sm:bottom-8 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-5 py-3 backdrop-blur-xl">
        <CheckCircle2 className="h-5 w-5 text-accent" />
        <div>
          <p className="font-mono text-xs font-bold text-accent">Shared</p>
          <p className="font-mono text-[10px] text-steel">Discovery copied</p>
        </div>
      </div>
    </div>
  );
}
