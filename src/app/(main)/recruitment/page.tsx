'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Megaphone, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Badge, Button, PageHeader, SectionCard, EmptyState, LoadingSpinner, Textarea } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import RoleIcon from '@/components/game/RoleIcon';
import RoleSelect from '@/components/game/RoleSelect';
import toast from 'react-hot-toast';

const LANES = ['roam', 'jungle', 'mid', 'exp', 'gold'];

export default function RecruitmentPage() {
  const t = useT();
  const [role, setRole] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [apply, setApply] = useState<any | null>(null);
  const [applyForm, setApplyForm] = useState({ role: '', message: '' });
  const [sending, setSending] = useState(false);

  const load = async (r: string) => {
    try {
      const [list, mine] = await Promise.all([api.recruitment.listOpen(r || undefined), api.recruitment.mine()]);
      setCampaigns(Array.isArray(list) ? list : []);
      setAppliedIds(
        new Set(
          (Array.isArray(mine) ? mine : [])
            .filter((a: any) => a.status === 'pending')
            .map((a: any) => a.recruitmentId),
        ),
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load(role);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const openApply = (c: any) => {
    setApply(c);
    setApplyForm({ role: c.slots?.[0]?.role || '', message: '' });
  };

  const submitApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apply) return;
    setSending(true);
    try {
      await api.recruitment.apply(apply.id, { role: applyForm.role || undefined, message: applyForm.message.trim() || undefined });
      toast.success(t('recruitment.applySent'));
      setAppliedIds((prev) => new Set(prev).add(apply.id));
      setApply(null);
    } catch (err: any) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSending(false);
    }
  };

  const slotRoles = useMemo(() => (apply?.slots || []).map((s: any) => s.role), [apply]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Megaphone size={28} />}
        title={t('recruitment.title')}
        subtitle={t('recruitment.subtitle')}
        variant="purple"
      />

      {/* Role filter */}
      <div className="section-card !p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRole('')}
            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:scale-105 ${
              role === '' ? 'border-opacity-80' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              borderColor: role === '' ? 'var(--accent-primary)' : 'var(--card-border)',
              background: role === '' ? 'var(--sidebar-active-bg)' : 'transparent',
              color: role === '' ? 'var(--accent-primary)' : 'var(--sidebar-text)',
            }}
          >
            {t('recruitment.filterAll')}
          </button>
          {LANES.map((l) => (
            <button
              key={l}
              onClick={() => setRole(l)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:scale-105 ${
                role === l ? 'border-opacity-80' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                borderColor: role === l ? 'var(--accent-primary)' : 'var(--card-border)',
                background: role === l ? 'var(--sidebar-active-bg)' : 'transparent',
                color: role === l ? 'var(--accent-primary)' : 'var(--sidebar-text)',
              }}
            >
              <RoleIcon role={l} size={14} /> {t('lane.' + l)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-24" />
      ) : campaigns.length === 0 ? (
        <EmptyState icon={<Megaphone size={28} />} title={t('recruitment.none')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c, i) => {
            const team = c.team || {};
            const applied = appliedIds.has(c.id);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="glass-card flex flex-col"
              >
                <Link href={`/teams/${c.teamId}`} className="mb-3 flex items-center gap-3">
                  {team.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={team.image} alt={team.name} referrerPolicy="no-referrer" className="h-11 w-11 rounded-full object-cover" style={{ border: '2px solid var(--card-border)' }} />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                      {team.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--page-text)' }}>{team.name}</p>
                    <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('recruitment.recruits')}</p>
                  </div>
                </Link>

                <div className="flex flex-wrap gap-2 mb-3">
                  {(c.slots || []).map((s: any) => (
                    <Badge key={s.role} variant="purple" size="md" className="gap-1">
                      <RoleIcon role={s.role} size={14} /> {t('lane.' + s.role)}
                      {s.quantity > 1 && <span className="ml-0.5 opacity-80">×{s.quantity}</span>}
                    </Badge>
                  ))}
                </div>

                {c.message && <p className="mb-3 whitespace-pre-line text-sm flex-1" style={{ color: 'var(--sidebar-text)' }}>{c.message}</p>}

                <div className="mt-auto">
                  {applied ? (
                    <Badge variant="green" size="md">{t('recruitment.applied')}</Badge>
                  ) : (
                    <Button size="sm" onClick={() => openApply(c)}>
                      <Send size={14} /> {t('recruitment.apply')}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Application modal */}
      <Modal
        open={!!apply}
        onClose={() => setApply(null)}
        closeLabel={t('common.close')}
        title={t('recruitment.applyTitle')}
        subtitle={apply?.team?.name || ''}
        icon={<Send size={18} />}
      >
        <form onSubmit={submitApply} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--page-text)' }}>{t('recruitment.applyRole')}</label>
            <RoleSelect
              value={applyForm.role}
              onChange={(v) => setApplyForm({ ...applyForm, role: v })}
              options={slotRoles.length ? slotRoles : LANES}
              noneLabel={t('admin.esport.noRole')}
              labelFor={(l) => t('lane.' + l)}
            />
          </div>
          <Textarea
            label={t('recruitment.applyMessage')}
            value={applyForm.message}
            onChange={(e: any) => setApplyForm({ ...applyForm, message: e.target.value })}
          />
          <div className="flex gap-2 pt-1">
            <Button size="sm" type="submit" loading={sending} disabled={sending}>
              <Send size={15} /> {t('recruitment.applySubmit')}
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setApply(null)}>
              {t('admin.esport.cancel')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
