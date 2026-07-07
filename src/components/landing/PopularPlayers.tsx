'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { api, avatarSrc } from '@/lib/api';
import RankBadge, { hasRankBadge } from '@/components/game/RankBadge';
import { GlassCard } from '@/components/game/ui';

interface Player {
  id: string;
  displayName?: string;
  username?: string;
  avatar?: string;
  gameRank?: string;
  gameLevel?: number;
  winRate?: number;
}

export default function PopularPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users
      .leaderboard()
      .then((list: any) => setPlayers(Array.isArray(list) ? list.slice(0, 5) : []))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="panel-gaming h-52 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gaming-surface/80 to-gaming-card/80 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/40 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  if (!players.length) return null;

  const rankAccent = ['from-amber-500 to-orange-400', 'from-blue-500 to-cyan-400', 'from-violet-500 to-fuchsia-400'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
      {players.map((p, i) => {
        const name = p.displayName || p.username || 'Joueur';
        const accent = rankAccent[Math.min(i, 2)];
        const isTopThree = i < 3;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
          >
            <Link href={`/players/${p.id}`} className="block h-full">
              <GlassCard
                className={`flex flex-col items-center p-5 sm:p-6 text-center relative overflow-hidden ${isTopThree ? 'shadow-neon' : ''}`}
                glow={isTopThree}
              >
                {isTopThree && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                <div className="relative">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 + 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className={`absolute -top-2.5 -left-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-[11px] font-bold text-white shadow-neon`}
                  >
                    {i === 0 ? <Crown size={13} strokeWidth={2.5} /> : i + 1}
                  </motion.span>
                  {p.avatar ? (
                    <img
                      src={avatarSrc(p.avatar, 120)}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-full object-cover border-2 border-white/15 transition-all group-hover:border-blue-500/60 group-hover:shadow-neon"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xl font-bold text-white shadow-neon">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <p className="mt-3.5 text-sm font-semibold text-white truncate w-full relative z-10">{name}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-400">
                  {hasRankBadge(p.gameRank) ? <RankBadge rank={p.gameRank} size={18} /> : null}
                  <span>{p.gameRank || `Lv ${p.gameLevel ?? '?'}`}</span>
                </div>
                {p.winRate != null && (
                  <span className="mt-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 relative z-10">
                    {p.winRate}% WR
                  </span>
                )}
              </GlassCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
