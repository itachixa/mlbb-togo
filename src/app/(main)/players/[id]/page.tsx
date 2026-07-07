'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, UserPlus, UserCheck, UserMinus, Check, X, MessageSquare } from 'lucide-react';
import { Card, Badge, Button, Avatar, EmptyState, LoadingSpinner } from '@/components/ui';
import { GlassCard } from '@/components/ui/premium';
import { api, avatarSrc, mlbbImg } from '@/lib/api';
import RankBadge, { hasRankBadge } from '@/components/game/RankBadge';
import RoleIcon from '@/components/game/RoleIcon';
import { useAuthStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const t = useT();
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const myId = useAuthStore((s: any) => s.user?.id);
  const [fstatus, setFstatus] = useState<string>('none');
  const [fbusy, setFbusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.users
      .get(id)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !myId || id === myId) return;
    api.friends.status(id).then((r: any) => setFstatus(r?.status || 'none')).catch(() => {});
  }, [id, myId]);

  const friendAct = async (fn: () => Promise<any>, next: string, done?: string) => {
    setFbusy(true);
    try {
      await fn();
      setFstatus(next);
      if (done) toast.success(done);
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
    } finally {
      setFbusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link href="/players" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-primary)' }}>
          <ArrowLeft size={16} /> {t('users.back')}
        </Link>
        <EmptyState icon={<UserPlus size={26} />} title={t('users.notFound')} />
      </div>
    );
  }

  const heroes: any[] = user.gameFrequentHeroes || [];
  const roles: any[] = user.gameRoles || [];
  const name = user.displayName || user.username;

  return (
    <div className="space-y-6">
      <Link href="/players" className="inline-flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-primary)' }}>
        <ArrowLeft size={16} /> {t('users.back')}
      </Link>

      {/* Profile header */}
      <GlassCard delay={0}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative shrink-0">
            <div
              className="p-1 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }}
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc(user.avatar, 240)}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                    {name?.[0]?.toUpperCase() || 'J'}
                  </div>
                )}
              </div>
            </div>
            {user.hasGame && hasRankBadge(user.gameRank) && (
              <span className="absolute -bottom-2 -right-2">
                <RankBadge rank={user.gameRank} size={32} />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--page-text)' }}>{name}</h1>
              {user.roleUser && user.roleUser !== 'user' && (
                <Badge variant="purple" size="sm">{user.roleUser}</Badge>
              )}
            </div>

            {myId && id !== myId && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                {fstatus === 'none' && (
                  <Button size="sm" disabled={fbusy} onClick={() => friendAct(() => api.friends.request(id), 'pending_out', t('friends.sent'))}>
                    <UserPlus size={15} /> {t('friends.add')}
                  </Button>
                )}
                {fstatus === 'pending_out' && (
                  <Button size="sm" variant="secondary" disabled={fbusy} onClick={() => friendAct(() => api.friends.remove(id), 'none')}>
                    {t('friends.cancel')}
                  </Button>
                )}
                {fstatus === 'pending_in' && (
                  <>
                    <Button size="sm" disabled={fbusy} onClick={() => friendAct(() => api.friends.accept(id), 'friends', t('friends.added'))}>
                      <Check size={15} /> {t('friends.accept')}
                    </Button>
                    <Button size="sm" variant="danger" disabled={fbusy} onClick={() => friendAct(() => api.friends.remove(id), 'none')}>
                      <X size={15} /> {t('friends.refuse')}
                    </Button>
                  </>
                )}
                {fstatus === 'friends' && (
                  <>
                    <Badge variant="green" size="md" className="gap-1">
                      <UserCheck size={14} /> {t('friends.friends')}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/messages?to=${id}&name=${encodeURIComponent(user.displayName || user.username)}`,
                        )
                      }
                    >
                      <MessageSquare size={14} /> {t('friends.chat')}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={fbusy} onClick={() => friendAct(() => api.friends.remove(id), 'none', t('friends.removed'))}>
                      <UserMinus size={14} /> {t('friends.remove')}
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              {user.gameRank && (
                <div className="flex items-center gap-2">
                  {hasRankBadge(user.gameRank) ? (
                    <RankBadge rank={user.gameRank} size={34} />
                  ) : null}
                  <div className="leading-tight text-left">
                    <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{user.gameRank}</p>
                    {user.gameRankLevel != null && (
                      <p className="text-[11px]" style={{ color: 'var(--sidebar-text)' }}>{user.gameRankLevel} pts</p>
                    )}
                  </div>
                </div>
              )}
              {user.gamePeakRank && (
                <div className="flex items-center gap-2">
                  {hasRankBadge(user.gamePeakRank) ? (
                    <RankBadge rank={user.gamePeakRank} size={28} />
                  ) : null}
                  <div className="leading-tight text-left">
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--sidebar-text)' }}>{t('dashboard.peakRank')}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{user.gamePeakRank}</p>
                  </div>
                </div>
              )}
              {user.gameLevel != null && <Badge variant="neon" size="sm">{t('dashboard.level')} {user.gameLevel}</Badge>}
              {user.country && (
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                  <MapPin size={12} /> {user.country}
                </span>
              )}
            </div>

            {roles.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
                <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('users.roles')} :</span>
                {roles.map((r: any) => (
                  <Badge key={r.role} variant="purple" size="sm" className="gap-1">
                    <RoleIcon role={r.role} size={14} />
                    {t(`role.${r.role}`)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {!user.hasGame ? (
        <GlassCard delay={0.1}>
          <div className="text-center py-10" style={{ color: 'var(--sidebar-text)' }}>
            {t('users.noGame')}
          </div>
        </GlassCard>
      ) : (
        heroes.length > 0 && (
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold" style={{ color: 'var(--page-text)' }}>{t('users.favoriteHeroes')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heroes.map((h, i) => (
                <div
                  key={h.heroId ?? i}
                  className="flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-200 hover:-translate-y-1"
                  style={{ background: 'var(--surface-bg)', borderColor: 'var(--card-border)' }}
                >
                  {h.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mlbbImg(h.image, 80)}
                      alt={h.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover"
                      style={{ background: 'var(--surface-bg)' }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'var(--surface-bg)', color: 'var(--sidebar-text)' }}>
                      {h.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--page-text)' }}>{h.name}</p>
                    <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{h.matches} {t('dashboard.favorites.matches')}</p>
                    <p className={`text-xs font-medium ${h.winRate >= 50 ? '' : ''}`} style={{ color: h.winRate >= 50 ? 'var(--badge-success-text)' : 'var(--badge-danger-text)' }}>
                      {h.winRate}{t('dashboard.favorites.winRate')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )
      )}
    </div>
  );
}
