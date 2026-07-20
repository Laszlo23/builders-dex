import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import OptimizedImage from './OptimizedImage';

type Props = {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  heightClass?: string;
};

/**
 * Full-bleed parallax band — image drifts slower than scroll for depth.
 */
export default function ParallaxBand({
  image,
  eyebrow,
  title,
  subtitle,
  children,
  heightClass = 'min-h-[56vh]',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.55, 1, 1, 0.55]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${heightClass}`}>
      <motion.div className="absolute inset-[-18%] will-change-transform" style={{ y }}>
        <OptimizedImage src={image} alt="" className="h-full w-full object-cover" sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,8,10,0.55)_100%)]" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-center px-4 py-16 text-center"
      >
        {eyebrow && (
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        )}
        <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </motion.div>
    </section>
  );
}
