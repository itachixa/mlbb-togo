'use client';

import Link from 'next/link';
import { cn } from '@/lib/helpers';
import { useT } from '@/lib/i18n';
import { type BannerVariant } from '@/config/theme';

/* ------------------------------------------------------------------ */
/* Loader                                                              */
/* ------------------------------------------------------------------ */

export function SpinLoader({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-4 w-4', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function LoadingSpinner({ size = 'md', className }: any) {
  const sizes: Record<string, string> = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-2 animate-spin',
          sizes[size]
        )}
        style={{
          borderColor: 'var(--card-border)',
          borderTopColor: 'var(--accent-primary)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading = false,
  type = 'button',
  ...props
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'border',
    outline: 'border',
    ghost: '',
    danger: 'text-white',
    success: 'text-white',
  };

  return (
    <button
      type={type}
      className={cn(base, variantClasses[variant], sizes[size], className)}
      disabled={disabled || loading}
      style={{
        background: variant === 'primary' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : variant === 'danger' ? '#ef4444' : variant === 'success' ? '#22c55e' : variant === 'secondary' ? 'rgba(0, 212, 255, 0.1)' : variant === 'outline' ? 'transparent' : 'transparent',
        borderColor: variant === 'secondary' ? 'rgba(0, 212, 255, 0.3)' : variant === 'outline' ? 'var(--card-border)' : 'transparent',
        color: variant === 'primary' || variant === 'danger' || variant === 'success' ? '#ffffff' : 'var(--accent-primary)',
        boxShadow: variant === 'primary' ? 'var(--shadow-glow)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.filter = 'brightness(1.15)';
          el.style.transform = 'scale(1.02)';
        } else if (variant === 'secondary') {
          el.style.background = 'rgba(0, 212, 255, 0.2)';
          el.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.3)';
        } else if (variant === 'outline') {
          el.style.background = 'var(--sidebar-hover-bg)';
          el.style.borderColor = 'var(--accent-primary)';
        } else if (variant === 'ghost') {
          el.style.background = 'var(--sidebar-hover-bg)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.filter = '';
        el.style.transform = '';
        el.style.background = variant === 'primary' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : variant === 'danger' ? '#ef4444' : variant === 'success' ? '#22c55e' : variant === 'secondary' ? 'rgba(0, 212, 255, 0.1)' : 'transparent';
        el.style.borderColor = variant === 'secondary' ? 'rgba(0, 212, 255, 0.3)' : variant === 'outline' ? 'var(--card-border)' : 'transparent';
        el.style.boxShadow = variant === 'primary' ? 'var(--shadow-glow)' : 'none';
      }}
      {...props}
    >
      {loading && <SpinLoader />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Card / SectionCard                                                  */
/* ------------------------------------------------------------------ */

export function Card({ children, className, hover = false, glow = false, ...props }: any) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-lg',
        glow && 'shadow-lg',
        className
      )}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: hover ? 'var(--shadow-elevated)' : 'var(--shadow-card)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Neutral section card (filters, content blocks). */
export function SectionCard({ children, className, ...props }: any) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6.5 transition-all duration-300',
        className
      )}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export function Badge({ children, variant = 'default', size = 'md', className }: any) {
  const variants: Record<string, string> = {
    default: 'badge',
    neon: 'badge-neon',
    blue: 'badge-neon',
    green: 'badge-gold',
    red: 'badge-gold',
    gold: 'badge-gold',
    purple: 'badge-purple',
    pink: 'badge-gold',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-sm',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200',
        variants[variant] || 'badge',
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                        */
/* ------------------------------------------------------------------ */

// TailAdmin form field base (form-elements.html).
const fieldBase =
  'w-full rounded-lg border bg-transparent py-3 px-5 outline-none transition focus:border-opacity-80 active:border-opacity-80 disabled:cursor-default';
const labelClass = 'mb-2.5 block text-sm font-medium';

export function Input({ label, error, className, ...props }: any) {
  return (
    <div className="w-full">
      {label && <label className="mb-2.5 block text-sm font-medium" style={{ color: 'var(--page-text)' }}>{label}</label>}
      <input
        className={cn(fieldBase, error ? 'border-red-500' : '', className)}
        style={{
          background: 'var(--input-bg)',
          borderColor: error ? '#ef4444' : 'var(--input-border)',
          color: 'var(--input-text)',
        }}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }: any) {
  return (
    <div className="w-full">
      {label && <label className="mb-2.5 block text-sm font-medium" style={{ color: 'var(--page-text)' }}>{label}</label>}
      <textarea
        className={cn(
          fieldBase,
          'min-h-[90px] resize-y',
          error ? 'border-red-500' : '',
          className
        )}
        style={{
          background: 'var(--input-bg)',
          borderColor: error ? '#ef4444' : 'var(--input-border)',
          color: 'var(--input-text)',
        }}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, options, error, className, children, ...props }: any) {
  return (
    <div className="w-full">
      {label && <label className="mb-2.5 block text-sm font-medium" style={{ color: 'var(--page-text)' }}>{label}</label>}
      <select
        className={cn(fieldBase, error ? 'border-red-500' : '', className)}
        style={{
          background: 'var(--input-bg)',
          borderColor: error ? '#ef4444' : 'var(--input-border)',
          color: 'var(--input-text)',
        }}
        {...props}
      >
        {options
          ? options.map((opt: any) => (
              <option key={opt.value} value={opt.value} style={{ background: 'var(--card-bg)', color: 'var(--page-text)' }}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar / ProgressBar                                                */
/* ------------------------------------------------------------------ */

export function Avatar({ name, src, size = 'md', online, className }: any) {
  const sizes: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };
  const initials = name
    ? name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'shrink-0 rounded-full flex items-center justify-center font-bold text-white overflow-hidden',
          sizes[size]
        )}
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2',
            online ? 'bg-green-500' : 'bg-gray-400'
          )}
          style={{ borderColor: 'var(--card-bg)' }}
        />
      )}
    </div>
  );
}

export function ProgressBar({ value, max = 100, className }: any) {
  return (
    <div className={cn('h-2 rounded-full overflow-hidden', className)} style={{ background: 'var(--surface-bg)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, (value / max) * 100)}%`,
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          boxShadow: '0 0 8px var(--accent-glow)',
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard - TailAdmin white metric card (translucent prop ignored)   */
/* ------------------------------------------------------------------ */

export function StatCard({ label, value, icon, trend, translucent: _translucent = false, className }: any) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6.5 transition-all duration-300',
        className
      )}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {icon && (
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full" style={{ background: 'var(--surface-bg)', color: 'var(--accent-primary)' }}>
          {icon}
        </div>
      )}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold" style={{ color: 'var(--page-text)' }}>{value}</h4>
          <span className="mt-1 block text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>{label}</span>
        </div>
        {trend !== undefined && trend !== null && (
          <span
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend > 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PageHeader - sober TailAdmin page heading (gradient banner removed)  */
/* ------------------------------------------------------------------ */

export function PageHeader({
  icon: _icon,
  title,
  subtitle,
  action,
  children,
  breadcrumb,
  variant: _variant = 'default',
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  variant?: BannerVariant;
  className?: string;
}) {
  const t = useT();
  return (
    <div className={cn('page-header', className)}>
      <div>
        <h2 className="page-header-title">{title}</h2>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {action}
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" style={{ color: 'var(--sidebar-text)' }} href="/dashboard">
                {t('header.dashboard')} /
              </Link>
            </li>
            <li className="font-medium" style={{ color: 'var(--accent-primary)' }}>{breadcrumb ?? title}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, description, action, className }: any) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] w-full flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--surface-bg)', color: 'var(--sidebar-text)' }}>
          {icon}
        </div>
      )}
      <h3 className="mb-1.5 text-lg font-semibold" style={{ color: 'var(--page-text)' }}>{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm" style={{ color: 'var(--sidebar-text)' }}>{description}</p>
      )}
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function Tabs({ tabs, active, onChange, className }: any) {
  return (
    <div
      className={cn(
        'tabs-gaming',
        className
      )}
    >
      {tabs.map((tab: any) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'tab-item',
              isActive ? 'active' : ''
            )}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
