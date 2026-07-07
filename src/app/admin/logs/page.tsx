'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, Ban, Trash2, Trophy, FileText, Shield, Crown, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader, SectionCard, Select, EmptyState } from '@/components/ui';

const actionIcons: Record<string, { icon: any; colorStyle: React.CSSProperties; bgStyle: React.CSSProperties }> = {
  user_ban: { icon: Ban, colorStyle: { color: 'var(--badge-warning-text)' }, bgStyle: { background: 'var(--badge-warning-bg)' } },
  user_unban: { icon: Ban, colorStyle: { color: 'var(--badge-success-text)' }, bgStyle: { background: 'var(--badge-success-bg)' } },
  user_delete: { icon: Trash2, colorStyle: { color: 'var(--badge-danger-text)' }, bgStyle: { background: 'var(--badge-danger-bg)' } },
  user_promote: { icon: Crown, colorStyle: { color: 'var(--badge-warning-text)' }, bgStyle: { background: 'var(--badge-warning-bg)' } },
  tournament_create: { icon: Trophy, colorStyle: { color: 'var(--accent-primary)' }, bgStyle: { background: 'var(--badge-primary-bg)' } },
  tournament_delete: { icon: Trash2, colorStyle: { color: 'var(--badge-danger-text)' }, bgStyle: { background: 'var(--badge-danger-bg)' } },
  post_delete: { icon: FileText, colorStyle: { color: 'var(--badge-danger-text)' }, bgStyle: { background: 'var(--badge-danger-bg)' } },
  team_delete: { icon: Shield, colorStyle: { color: 'var(--badge-danger-text)' }, bgStyle: { background: 'var(--badge-danger-bg)' } },
  team_edit: { icon: Edit, colorStyle: { color: 'var(--accent-primary)' }, bgStyle: { background: 'var(--badge-primary-bg)' } },
};

const actionLabels: Record<string, string> = {
  user_ban: 'Suspension utilisateur', user_unban: 'Réactivation utilisateur', user_delete: 'Suppression utilisateur',
  user_promote: 'Promotion utilisateur', tournament_create: 'Création tournoi', tournament_delete: 'Suppression tournoi',
  post_delete: 'Suppression post', team_delete: 'Suppression équipe', team_edit: 'Modification équipe',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    api.admin.logs().then(setLogs);
  }, []);

  const filtered = logs.filter((l: any) => {
    const matchSearch =
      (l.target || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.admin || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = [...new Set(logs.map((l: any) => l.action))];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ScrollText size={28} />}
        title="Logs Admin"
        subtitle={`${filtered.length} entrées`}
        variant="default"
      />

      {/* Filtres */}
      <SectionCard className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--input-placeholder)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher dans les logs..." className="input-gaming pl-10 pr-4 py-2.5" />
          </div>
          <Select value={actionFilter} onChange={(e: any) => setActionFilter(e.target.value)} className="sm:w-64">
            <option value="all">Toutes les actions</option>
            {uniqueActions.map((a: any) => <option key={a} value={a}>{actionLabels[a] || a}</option>)}
          </Select>
        </div>
      </SectionCard>

      {/* Liste des logs */}
      <div className="space-y-3">
        {filtered.map((log: any, i: number) => {
          const config = actionIcons[log.action] || { icon: FileText, colorStyle: { color: 'var(--sidebar-text)' }, bgStyle: { background: 'var(--surface-bg)' } };
          const Icon = config.icon;
          return (
            <motion.div key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card shadow-[var(--shadow-card)] p-4 flex items-center gap-4 transition-colors hover:border-[var(--accent-primary)]">
              <div className="p-3 rounded-lg" style={config.bgStyle}><Icon size={18} style={config.colorStyle} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: 'var(--page-text)' }}>{actionLabels[log.action] || log.action}</p>
                <p className="text-sm truncate" style={{ color: 'var(--page-text)', opacity: 0.7 }}>Par <span style={{ color: 'var(--accent-primary)' }}>{log.admin}</span> → {log.target}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--sidebar-text)' }}>{log.details}</p>
              </div>
              <p className="text-xs whitespace-nowrap" style={{ color: 'var(--sidebar-text)' }}>{(log.timestamp || '').split('T')[0]}</p>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState icon={<ScrollText size={28} />} title="Aucune entrée" description="Aucun log ne correspond à votre recherche." />
        )}
      </div>
    </div>
  );
}
