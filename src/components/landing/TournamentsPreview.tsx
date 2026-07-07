'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, CalendarDays, MapPin, Circle } from 'lucide-react';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/helpers';
import { GlassCard, GradientButton } from '@/components/game/ui';

interface Tournament {
  id: string;
  name: string;
  prizePool?: number | string;
  status?: string;
  region?: string;
  startDate?: string;
  teamsCount?: number;
}

function statusVariant(status?: string): any {
  const s = (status || '').toLowerCase();
  if (s.includes('live') || s.includes('ongoing')) return 'red';
  if (s.includes('open') || s.includes('register')) return 'green';
  if (s.includes('upcoming') || s.includes('soon')) return 'neon';
  return 'gold';
}

function StatusIndicator({ status }: { status?: string }) {
  const s = (status || '').toLowerCase();
  if (s.includes('live') || s.includes('ongoing')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        {status}
      </span>
    );
  }
  if (s.includes('open') || s.includes('register')) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <Circle size={8} fill="currentColor" className="text-emerald-400" />
        {status}
      </span>
    );
  }
  return <Badge variant={statusVariant(status)} size="sm">{status}</Badge>;
}

export default function TournamentsPreview() {
  const t = useT();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tournaments
      .list()
      .then((list: any) => setTournaments(Array.isArray(list) ? list.slice(0, 3) : []))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel-gaming h-48 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gaming-surface/60 to-gaming-card/60 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark/30 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  if (!tournaments.length) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {tournaments.map((tn, i) => (
          <motion.div
            key={tn.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
          >
            <Link href={`/tournaments`} className="block h-full">
              <GlassCard className="h-full p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Trophy size={16} />
                    </div>
                    <StatusIndicator status={tn.status} />
                  </div>
                  {tn.prizePool != null && (
                    <span className="text-sm font-bold text-white bg-white/5 border border-white/10 rounded-full px-3 py-1">
                      {tn.prizePool}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-bold text-white leading-snug relative z-10 group-hover:text-blue-400 transition-colors duration-300">
                  {tn.name}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 relative z-10">
                  {tn.startDate && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1 border border-white/5">
                      <CalendarDays size={12} className="text-blue-400" /> {formatDate(tn.startDate)}
                    </span>
                  )}
                  {tn.region && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1 border border-white/5">
                      <MapPin size={12} className="text-violet-400" /> {tn.region}
                    </span>
                  )}
                  {tn.teamsCount != null && (
                    <span className="inline-flex items-center gap-1.5 bg-white/5 rounded-full px-2.5 py-1 border border-white/5">
                      {tn.teamsCount} {t('header.teams')}
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-zinc-500 group-hover:text-blue-400 transition-colors relative z-10">
                  <span className="font-medium">Voir le tournoi</span>
                  <svg className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <Link href="/tournaments">
          <GradientButton variant="ghost" size="md">
            {t('nav.tournaments')} <span className="ml-1">→</span>
          </GradientButton>
        </Link>
      </motion.div>
    </div>
  );
}
