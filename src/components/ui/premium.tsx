'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/helpers';

/* ---------------------------------------------------------------- */
/* GlassCard — premium elevated surface with neon hover border     */
/* ---------------------------------------------------------------- */
export function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
  ...props
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('glass-card', hover && 'hover:-translate-y-1', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* SectionTitle — eyebrow + title + optional action                 */
/* ---------------------------------------------------------------- */
export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  icon,
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow && <p className="eyebrow-premium mb-2">{eyebrow}</p>}
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-[#6d28d9]/25 text-blue-300 ring-1 ring-white/10">
              {icon}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
        </div>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Stat — KPI metric with glow                                       */
/* ---------------------------------------------------------------- */
export function Stat({
  label,
  value,
  icon,
  trend,
  accent = '#00d4ff',
  delay = 0,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: number;
  accent?: string;
  delay?: number;
}) {
  return (
    <GlassCard delay={delay} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: accent }}
      />
      {icon && (
        <div
          className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white ring-1 ring-white/10"
          style={{ background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }}
        >
          {icon}
        </div>
      )}
      <div className="relative">
        <p className="text-3xl font-black tracking-tight text-white">{value}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">{label}</span>
          {trend != null && (
            <span className={cn('text-xs font-semibold', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

/* ---------------------------------------------------------------- */
/* Pill — small status / meta chip                                   */
/* ---------------------------------------------------------------- */
export function Pill({
  children,
  color = '#38bdf8',
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn('chip', className)}
      style={{ borderColor: `${color}55`, color, background: `${color}14` }}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Skeleton — premium shimmer placeholders                          */
/* ---------------------------------------------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton-premium', className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-premium p-5', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-24 w-full rounded-xl" />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* EmptyPremium — illustrated empty state                            */
/* ---------------------------------------------------------------- */
export function EmptyPremium({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-[50vh] w-full flex-col items-center justify-center py-16 text-center"
    >
      {icon && (
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-[#6d28d9]/15 text-blue-300 ring-1 ring-white/10"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-zinc-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
