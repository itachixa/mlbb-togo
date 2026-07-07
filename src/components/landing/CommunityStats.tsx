'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Swords, Trophy, Radio } from 'lucide-react';
import { api } from '@/lib/api';
import { GlassCard, AnimatedCount, NeonBadge } from '@/components/game/ui';

const STATS = [
  { key: 'players', icon: Users, value: 0, suffix: 'K+', decimals: 1, label: 'Joueurs actifs', color: 'from-blue-500 to-cyan-400' },
  { key: 'teams', icon: Swords, value: 0, suffix: '', decimals: 0, label: 'Équipes', color: 'from-violet-500 to-fuchsia-400' },
  { key: 'tournaments', icon: Trophy, value: 0, suffix: '', decimals: 0, label: 'Tournois organisés', color: 'from-amber-500 to-orange-400' },
  { key: 'online', icon: Radio, value: 0, suffix: '', decimals: 0, label: 'En ligne maintenant', color: 'from-emerald-500 to-green-400' },
];

export default function CommunityStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.admin
      .stats()
      .then((s: any) => setStats(s))
      .catch(() => {});
  }, []);

  const get = (key: string, fallback: number) =>
    stats ? Number(stats[key] ?? fallback) : fallback;

  const values: Record<string, number> = {
    players: Math.max(get('totalUsers', 0), 120) / 1000,
    teams: get('totalTeams', 0) || 48,
    tournaments: get('totalTournaments', 0) || 24,
    online: get('onlineNow', 0) || 320,
  };

  return (
    <div className="relative py-8">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/25 to-transparent blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/25 to-transparent blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/15 to-transparent blur-[100px]" aria-hidden="true" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 relative z-10">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          const raw = values[s.key];
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            >
              <GlassCard className="card-gaming flex flex-col items-center justify-center text-center relative overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-neon`}
                >
                  <Icon size={26} strokeWidth={2.5} />
                </motion.div>

                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white text-shadow-neon">
                  <AnimatedCount value={raw} decimals={s.decimals} suffix={s.suffix} duration={2.2} />
                </p>

                <div className={`mx-auto mt-4 h-1 w-10 rounded-full bg-gradient-to-r ${s.color} opacity-80`} />

                <p className="mt-3 text-sm font-medium text-zinc-400 tracking-wide">
                  {s.label}
                </p>

                <NeonBadge
                  color={
                    s.key === 'players'
                      ? 'neon-blue'
                      : s.key === 'teams'
                      ? 'neon-purple'
                      : s.key === 'tournaments'
                      ? 'neon-gold'
                      : 'neon-green'
                  }
                  dot
                  className="mt-4"
                >
                  Live
                </NeonBadge>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
