'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Users } from 'lucide-react';
import { api, avatarSrc } from '@/lib/api';
import { PageHeader, SectionCard, Badge, EmptyState, LoadingSpinner } from '@/components/ui';
import { GlassCard } from '@/components/ui/premium';
import RankBadge, { hasRankBadge } from '@/components/game/RankBadge';
import { useT } from '@/lib/i18n';

export default function PlayersPage() {
  const t = useT();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.users
      .list()
      .then((u: any) => setUsers(Array.isArray(u) ? u : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        variant="default"
        icon={<Users size={28} className="text-white" />}
        title={t('users.title')}
        subtitle={loading ? '…' : `${users.length} ${t('users.count')}`}
      />

      {/* Recherche */}
      <div className="section-card !p-4">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--sidebar-text)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('users.search')}
            className="pl-9 pr-3 py-2 w-full text-sm rounded-lg border outline-none transition-all duration-300 focus:shadow-lg"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={26} />} title={t('users.none')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <Link
                href={`/players/${u.id}`}
                className="glass-card block overflow-hidden hover:-translate-y-1"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div
                        className="p-1 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        }}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarSrc(u.avatar, 160)}
                              alt={u.displayName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                              {(u.displayName || u.username)?.[0]?.toUpperCase() || 'J'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--page-text)' }}>{u.displayName || u.username}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        {u.hasGame ? (
                          hasRankBadge(u.gameRank) ? (
                            <RankBadge rank={u.gameRank} size={22} />
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>
                              {u.gameRank || `${t('dashboard.level')} ${u.gameLevel ?? '?'}`}
                            </span>
                          )
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('users.noGame')}</span>
                        )}
                        {u.country && (
                          <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                            <MapPin size={11} /> {u.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {u.hasGame && (
                      <>
                        {u.gameLevel != null && <Badge variant="neon" size="sm">{t('dashboard.level')} {u.gameLevel}</Badge>}
                        {u.gamePeakRank && <Badge variant="gold" size="sm">{u.gamePeakRank}</Badge>}
                      </>
                    )}
                    {u.roleUser && u.roleUser !== 'user' && (
                      <Badge variant="purple" size="sm" className="uppercase ml-auto">{u.roleUser}</Badge>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
