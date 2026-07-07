'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/helpers';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

/* ------------------------------------------------------------------ */
/* GlassCard - premium glass/esport surface with glow + hover depth.     */
/* ------------------------------------------------------------------ */

export function GlassCard({
  children,
  className,
  as: Tag = 'div',
  glow = false,
  interactive = true,
  ...props
}: any) {
  return (
    <Tag
      className={cn(
        'panel-gaming glass group',
        glow && 'shadow-neon',
        interactive && 'hover:shadow-neon-lg',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeading - eyebrow + title + subtitle + optional action.       */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <motion.div
            className={cn('eyebrow', align === 'center' && 'justify-center')}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {eyebrow}
          </motion.div>
        )}
        <motion.h2
          className="mt-3 text-title-lg sm:text-title-xl lg:text-title-xl2 font-extrabold tracking-tight text-white"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            className="mt-3 text-sm sm:text-base text-gray-400 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatedCount - counts up to a value when in view.                   */
/* ------------------------------------------------------------------ */

export function AnimatedCount({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1.6,
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, mv]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* GradientButton - premium CTA with shine + neon glow + ripple.        */
/* ------------------------------------------------------------------ */

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  disabled,
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants: Record<string, string> = {
    primary:
      'text-white bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-neon-lg',
    gold: 'text-black bg-gradient-to-r from-yellow-300 to-neon-gold hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    ghost:
      'text-white border border-neon-blue/30 bg-neon-blue/10 hover:border-neon-blue/60 hover:bg-neon-blue/20 hover:shadow-neon',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 600);
    onClick?.(e);
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'shine relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold tracking-wide transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
          style={{ left: r.x, top: r.y, animation: 'ripple 0.6s ease-out forwards' }}
        />
      ))}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* NeonBadge - small status pill with role/rank color support.         */
/* ------------------------------------------------------------------ */

export function NeonBadge({
  children,
  color = 'neon-blue',
  className,
  dot = false,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}) {
  const palette: Record<string, string> = {
    'neon-blue': 'bg-neon-blue/15 text-neon-blue border-neon-blue/30',
    'neon-purple': 'bg-neon-purple/15 text-neon-purple border-neon-purple/30',
    'neon-gold': 'bg-neon-gold/15 text-neon-gold border-neon-gold/30',
    'neon-green': 'bg-neon-green/15 text-neon-green border-neon-green/30',
    'neon-pink': 'bg-neon-pink/15 text-neon-pink border-neon-pink/30',
    danger: 'bg-danger/15 text-danger border-danger/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        palette[color] ?? palette['neon-blue'],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* Ripple keyframes injected once (used by GradientButton). */
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@keyframes ripple{0%{transform:scale(0);opacity:.6}100%{transform:scale(40);opacity:0}}`;
  if (!document.getElementById('ripple-keyframes')) {
    style.id = 'ripple-keyframes';
    document.head.appendChild(style);
  }
}
