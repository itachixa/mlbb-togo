'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Gamepad2, RefreshCw, ArrowUpRight, MapPin,
} from 'lucide-react';
import {
  Card, SectionCard, Badge, Button,
  PageHeader, EmptyState, LoadingSpinner,
} from '@/components/ui';
import { useAuthStore } from '@/store/useStore';
import { api, avatarSrc } from '@/lib/api';
import RankBadge, { hasRankBadge } from '@/components/game/RankBadge';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n';

export default function Dashboard() {
  const userProfile = useAuthStore((s: any) => s.userProfile);
  const setUserProfile = useAuthStore((s: any) => s.setUserProfile);
  const setUser = useAuthStore((s: any) => s.setUser);
  const [syncing, setSyncing] = useState(false);
  const t = useT();

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userProfile.hasGame) {
    return (
      <div className="space-y-6">
        <Card hover={false}>
          <EmptyState
            icon={<Gamepad2 size={30} className="text-primary" />}
            title={t('dashboard.noGame.title')}
            description={t('dashboard.noGame.desc')}
            action={
              <Link href="/profile">
                <Button variant="primary" size="lg">
                  <Gamepad2 size={18} /> {t('dashboard.noGame.link')}
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const sync = async () => {
    setSyncing(true);
    try {
      const updated: any = await api.auth.syncGame();
      setUser(updated);
      setUserProfile(updated);
      toast.success(t('dashboard.syncSuccess'));
    } catch (e: any) {
      toast.error(e?.message || t('dashboard.syncError'));
    } finally {
      setSyncing(false);
    }
  };

  const nick = userProfile.gameNickname || userProfile.displayName;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('header.dashboard')}
        breadcrumb={nick}
        action={
          <Button variant="outline" size="sm" onClick={sync} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? t('dashboard.syncing') : t('dashboard.sync')}
          </Button>
        }
      />

      {/* Game identity card: identity on the left, rank/level/country on the right */}
      <div className="glass-card !p-5 sm:!p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className="p-1 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
                  {userProfile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc(userProfile.avatar, 240)}
                      alt={nick}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex w-full h-full items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                      {nick?.[0]?.toUpperCase() || 'J'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0">
                <p className="truncate text-xl font-bold" style={{ color: 'var(--page-text)' }}>{nick}</p>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--sidebar-text)' }}>
                  {t('dashboard.gameId')} {userProfile.mlbbRoleId} · {t('dashboard.gameServer')} {userProfile.mlbbZoneId}
                </p>
              </div>
            </div>

          {/* Rank / peak / level / country */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
            {userProfile.gameRank && (
              <div className="flex items-center gap-2">
                {hasRankBadge(userProfile.gameRank) ? (
                  <RankBadge rank={userProfile.gameRank} size={36} />
                ) : null}
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--sidebar-text)' }}>{t('dashboard.currentRank')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{userProfile.gameRank}</p>
                  {userProfile.gameRankLevel != null && (
                    <p className="text-[11px]" style={{ color: 'var(--sidebar-text)' }}>{userProfile.gameRankLevel} pts</p>
                  )}
                </div>
              </div>
            )}

            {userProfile.gamePeakRank && (
              <div className="flex items-center gap-2">
                {hasRankBadge(userProfile.gamePeakRank) ? (
                  <RankBadge rank={userProfile.gamePeakRank} size={32} />
                ) : null}
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--sidebar-text)' }}>{t('dashboard.peakRank')}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{userProfile.gamePeakRank}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {userProfile.gameLevel != null && (
                <Badge variant="neon" size="sm">{t('dashboard.level')} {userProfile.gameLevel}</Badge>
              )}
              {userProfile.gameCountry && (
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                  <MapPin size={12} /> {userProfile.gameCountry}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            {t('dashboard.manageProfile')} <ArrowUpRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
