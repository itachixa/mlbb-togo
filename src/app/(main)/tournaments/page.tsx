'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Calendar, Users, Play, ExternalLink, Medal, Swords, Target,
} from 'lucide-react';
import { Card, Badge, Button, Tabs, PageHeader, SectionCard, EmptyState, ProgressBar, LoadingSpinner } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { api, avatarSrc } from '@/lib/api';
import { useAuthStore } from '@/store/useStore';
import { formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

const STATUS_BADGE: Record<string, { label: string; variant: any }> = {
  ongoing: { label: '🔴 En cours', variant: 'green' },
  upcoming: { label: '📅 À venir', variant: 'neon' },
  completed: { label: '✅ Terminé', variant: 'default' },
};

export default function Tournaments() {
  const myId = useAuthStore((s: any) => s.user?.id);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [registerFor, setRegisterFor] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const loadTournaments = () =>
    api.tournaments.list().then((l: any) => setTournaments(Array.isArray(l) ? l : []));

  useEffect(() => {
    Promise.all([
      loadTournaments(),
      api.esport.teams('esport').then((l: any) => (Array.isArray(l) ? l : [])),
    ])
      .then(([, teams]) => {
        setMyTeams(
          (teams as any[]).filter((tm) =>
            (tm.members || []).some(
              (m: any) => (m.user?.id === myId || m.userId === myId) && m.isCaptain,
            ),
          ),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const filtered = tournaments.filter((t: any) =>
    activeTab === 'all' ? true : t.status === activeTab,
  );
  const tournament = selectedId ? tournaments.find((t: any) => t.id === selectedId) : null;

  const registeredIds = (t: any) => new Set((t?.registeredTeams || []).map((r: any) => r.id));
  const myRegistered = (t: any) => myTeams.find((mt) => registeredIds(t).has(mt.id));

  const register = async (tournamentId: string, teamId: string) => {
    setBusy(true);
    try {
      await api.tournaments.register(tournamentId, teamId);
      await loadTournaments();
      setRegisterFor(null);
      toast.success('Équipe inscrite au tournoi.');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const unregister = async (tournamentId: string, teamId: string) => {
    setBusy(true);
    try {
      await api.tournaments.unregister(tournamentId, teamId);
      await loadTournaments();
      toast.success('Inscription annulée.');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Trophy size={28} />}
        title="Tournois"
        subtitle="Participez aux tournois et montrez votre talent"
        variant="gold"
      />

      <div className="section-card !p-4">
        <Tabs
          tabs={[
            { id: 'all', label: `Tous (${tournaments.length})` },
            { id: 'upcoming', label: 'À venir' },
            { id: 'ongoing', label: 'En cours' },
            { id: 'completed', label: 'Terminés' },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filtered.map((tour: any, index: number) => {
              const regTeams = tour.registeredTeams || [];
              const sb = STATUS_BADGE[tour.status] || { label: tour.status, variant: 'default' };
              return (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.06, 0.4) }}
                >
                  <div
                    className={`glass-card cursor-pointer transition-all duration-300 ${
                      selectedId === tour.id ? '!border-opacity-80' : ''
                    }`}
                    onClick={() => setSelectedId(tour.id)}
                    style={selectedId === tour.id ? { borderColor: 'var(--accent-primary)', boxShadow: 'var(--shadow-glow)' } : {}}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant={sb.variant} size="sm">{sb.label}</Badge>
                          {tour.format && <Badge variant="purple" size="sm">{tour.format}</Badge>}
                        </div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--page-text)' }}>{tour.name}</h3>
                      </div>
                      {tour.prizePool && (
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold" style={{ color: 'var(--badge-warning-text)' }}>{tour.prizePool}</p>
                          <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>Prize Pool</p>
                        </div>
                      )}
                    </div>

                    {tour.description && (
                      <p className="mb-4 text-sm" style={{ color: 'var(--sidebar-text)' }}>{tour.description}</p>
                    )}

                    <div className="mb-4 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                      {(tour.startDate || tour.endDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {tour.startDate} {tour.endDate ? `- ${tour.endDate}` : ''}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {regTeams.length}/{tour.maxTeams} équipes
                      </span>
                      {tour.organizer && (
                        <span className="flex items-center gap-1">
                          <Swords size={14} />
                          {tour.organizer}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <ProgressBar value={regTeams.length} max={tour.maxTeams} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {regTeams.slice(0, 5).map((team: any) => (
                          <div
                            key={team.id}
                            className="h-8 w-8 overflow-hidden rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ border: '2px solid var(--card-bg)', background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}
                            title={team.name}
                          >
                            {team.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarSrc(team.logo, 48)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span>{team.name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                        ))}
                        {regTeams.length > 5 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs" style={{ border: '2px solid var(--card-bg)', background: 'var(--surface-bg)', color: 'var(--sidebar-text)' }}>
                            +{regTeams.length - 5}
                          </div>
                        )}
                      </div>
                      {tour.streamUrl && (
                        <a href={tour.streamUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <Play size={14} /> Stream
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <EmptyState
                icon={<Trophy size={28} />}
                title="Aucun tournoi"
                description="Aucun tournoi pour ce filtre. Reviens bientôt !"
              />
            )}
          </div>

          <div>
            {tournament ? (
              <div className="glass-card">
                <h3 className="mb-4 text-lg font-bold" style={{ color: 'var(--page-text)' }}>{tournament.name}</h3>

                <div className="space-y-4">
                  {tournament.format && (
                    <div>
                      <p className="mb-2 text-xs" style={{ color: 'var(--sidebar-text)' }}>Format</p>
                      <Badge variant="neon">{tournament.format}</Badge>
                    </div>
                  )}
                  {tournament.organizer && (
                    <div>
                      <p className="mb-2 text-xs" style={{ color: 'var(--sidebar-text)' }}>Organisateur</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>{tournament.organizer}</p>
                    </div>
                  )}
                  {(tournament.startDate || tournament.endDate) && (
                    <div>
                      <p className="mb-2 text-xs" style={{ color: 'var(--sidebar-text)' }}>Dates</p>
                      <p className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
                        {formatDate(tournament.startDate)} → {formatDate(tournament.endDate)}
                      </p>
                    </div>
                  )}
                  {tournament.prizePool && (
                    <div>
                      <p className="mb-2 text-xs" style={{ color: 'var(--sidebar-text)' }}>Prize Pool</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--badge-warning-text)' }}>{tournament.prizePool}</p>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                      Équipes inscrites ({(tournament.registeredTeams || []).length})
                    </p>
                    <div className="space-y-2">
                      {(tournament.registeredTeams || []).map((team: any) => (
                        <div key={team.id} className="flex items-center gap-2 rounded-xl p-2" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
                          <div className="h-6 w-6 overflow-hidden rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}>
                            {team.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatarSrc(team.logo, 48)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span>{team.name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--page-text)' }}>{team.name}</span>
                        </div>
                      ))}
                      {(tournament.registeredTeams || []).length === 0 && (
                        <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>Aucune équipe inscrite.</p>
                      )}
                    </div>
                  </div>

                  {tournament.status !== 'completed' && (
                    myRegistered(tournament) ? (
                      <Button
                        variant="danger"
                        className="w-full"
                        loading={busy}
                        onClick={() => unregister(tournament.id, myRegistered(tournament).id)}
                      >
                        Se désinscrire
                      </Button>
                    ) : myTeams.length > 0 ? (
                      <Button className="w-full" onClick={() => setRegisterFor(tournament)}>
                        <Target size={16} /> Inscrire mon équipe
                      </Button>
                    ) : (
                      <p className="rounded-xl p-3 text-center text-xs" style={{ background: 'var(--surface-bg)', color: 'var(--sidebar-text)' }}>
                        Tu dois être capitaine d&apos;une équipe e-sport pour t&apos;inscrire.
                      </p>
                    )
                  )}

                  {tournament.streamUrl && (
                    <a href={tournament.streamUrl} target="_blank" rel="noreferrer" className="block">
                      <Button variant="secondary" className="w-full">
                        <ExternalLink size={16} /> Regarder le stream
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card">
                <div className="py-8 text-center">
                  <Medal className="mx-auto mb-3 h-10 w-10" style={{ color: 'var(--sidebar-text)' }} />
                  <p className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
                    Sélectionnez un tournoi pour voir les détails
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team registration picker */}
      <Modal
        open={!!registerFor}
        onClose={() => setRegisterFor(null)}
        title="Inscrire une équipe"
        icon={<Target size={20} />}
        size="sm"
      >
        <div className="space-y-2">
          <p className="mb-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>Choisis l&apos;équipe à inscrire :</p>
          {myTeams.map((tm) => (
            <button
              key={tm.id}
              type="button"
              disabled={busy}
              onClick={() => register(registerFor.id, tm.id)}
              className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 hover:border-opacity-80 disabled:opacity-60"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <div className="h-8 w-8 overflow-hidden rounded-md flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}>
                {tm.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc(tm.image, 48)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{tm.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>{tm.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
