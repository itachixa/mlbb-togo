'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Shield, Palette,
  Trash2, Save, Swords, Crown, Moon, Sun,
} from 'lucide-react';
import { Card, Button, Input, Textarea, Badge, Tabs, PageHeader, SectionCard } from '@/components/ui';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useThemeStore, useAuthStore } from '@/store/useStore';
import { api, setToken } from '@/lib/api';
import { isPushSupported, isPushEnabled, enablePush, disablePush } from '@/lib/push';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n';

const DEFAULT_NOTIFS = { friends: true, messages: true, teams: true };
const DEFAULT_PRIVACY = { profilePublic: true, showStats: true, showOnline: true, allowInvites: true };

export default function Settings() {
  const { theme, toggleTheme, themeVariant, setThemeVariant, brightness, setBrightness } = useThemeStore();
  const userProfile = useAuthStore((s: any) => s.userProfile);
  const setUserProfile = useAuthStore((s: any) => s.setUserProfile);
  const setUser = useAuthStore((s: any) => s.setUser);
  const logout = useAuthStore((s: any) => s.logout);
  const router = useRouter();
  const t = useT();

  const [activeTab, setActiveTab] = useState('profile');
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    username: '', email: '', bio: '', country: '', city: '',
  });
  const [notifications, setNotifications] = useState<any>(DEFAULT_NOTIFS);
  const [privacy, setPrivacy] = useState<any>(DEFAULT_PRIVACY);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    setPushSupported(isPushSupported());
    isPushEnabled().then(setPushOn);
  }, []);

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        toast.success(t('settings.push.disabled'));
      } else {
        await enablePush();
        setPushOn(true);
        toast.success(t('settings.push.enabled'));
      }
    } catch (e: any) {
      const code = e?.message;
      toast.error(
        code === 'push-denied'
          ? t('settings.push.denied')
          : code === 'push-unconfigured'
            ? t('settings.push.unavailable')
            : t('common.error'),
      );
    } finally {
      setPushBusy(false);
    }
  };

  // Hydrate the form from the real profile.
  useEffect(() => {
    if (!userProfile) return;
    setProfile({
      username: userProfile.username || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
      country: userProfile.country || '',
      city: userProfile.city || '',
    });
    setNotifications({ ...DEFAULT_NOTIFS, ...(userProfile.notifPrefs || {}) });
    setPrivacy({ ...DEFAULT_PRIVACY, ...(userProfile.privacy || {}) });
  }, [userProfile?.id]);

  const myId = userProfile?.id;

  const persist = async (key: string, patch: any) => {
    if (!myId) return;
    setSaving(key);
    try {
      const updated: any = await api.users.update(myId, patch);
      setUser(updated);
      setUserProfile(updated);
      toast.success(t('settings.saved'));
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
    } finally {
      setSaving(null);
    }
  };

  const saveProfile = () =>
    persist('profile', {
      username: profile.username,
      bio: profile.bio,
      city: profile.city,
      country: profile.country,
    });
  const saveNotifications = () => persist('notifications', { notifPrefs: notifications });
  const savePrivacy = () => persist('privacy', { privacy });

  const deleteAccount = async () => {
    setSaving('delete');
    try {
      await api.users.deleteSelf();
      setShowDelete(false);
      logout();
      setToken(null);
      toast.success(t('settings.accountDeleted'));
      router.push('/');
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        icon={<SettingsIcon size={28} />}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        variant="cyan"
      />

      <div className="section-card !p-4">
        <Tabs
          tabs={[
            { id: 'profile', label: t('settings.tabProfile'), icon: User },
            { id: 'notifications', label: t('settings.tabNotifications'), icon: Bell },
            { id: 'privacy', label: t('settings.tabPrivacy'), icon: Shield },
            { id: 'appearance', label: t('settings.tabAppearance'), icon: Palette },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--page-text)' }}>
              {t('settings.profileInfo')}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('settings.username')}
                  value={profile.username}
                  onChange={(e: any) => setProfile({ ...profile, username: e.target.value })}
                />
                <Input
                  label={t('settings.email')}
                  type="email"
                  value={profile.email}
                  disabled
                  readOnly
                />
              </div>
              <Textarea
                label={t('settings.bio')}
                value={profile.bio}
                onChange={(e: any) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} loading={saving === 'profile'}>
              <Save size={16} />
              {t('settings.save')}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-card">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--page-text)' }}>
            {t('settings.notifications.title')}
          </h3>

          {pushSupported && (
            <div className="mb-4 flex items-center justify-between rounded-xl border p-3" style={{ borderColor: 'var(--accent-primary)', background: 'var(--sidebar-active-bg)' }}>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--page-text)' }}>{t('settings.push.title')}</p>
                <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('settings.push.desc')}</p>
              </div>
              <button
                onClick={togglePush}
                disabled={pushBusy}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-60 ${
                  pushOn ? '' : 'opacity-70'
                }`}
                style={{ background: pushOn ? 'var(--accent-primary)' : 'var(--card-border)' }}
              >
                <motion.div animate={{ x: pushOn ? 24 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {[
              { key: 'friends', label: t('settings.notifications.friends'), desc: t('settings.notifications.friendsDesc') },
              { key: 'messages', label: t('settings.notifications.messages'), desc: t('settings.notifications.messagesDesc') },
              { key: 'teams', label: t('settings.notifications.teams'), desc: t('settings.notifications.teamsDesc') },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--page-text)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications[item.key] ? '' : 'opacity-70'
                  }`}
                  style={{ background: notifications[item.key] ? 'var(--accent-primary)' : 'var(--card-border)' }}
                >
                  <motion.div
                    animate={{ x: notifications[item.key] ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={saveNotifications} loading={saving === 'notifications'}>
              <Save size={16} />
              {t('settings.save')}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="glass-card">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--page-text)' }}>
            {t('settings.privacy.title')}
          </h3>
          <div className="space-y-4">
            {[
              { key: 'profilePublic', label: t('settings.privacy.publicProfile'), desc: t('settings.privacy.publicProfileDesc') },
              { key: 'showStats', label: t('settings.privacy.showStats'), desc: t('settings.privacy.showStatsDesc') },
              { key: 'showOnline', label: t('settings.privacy.showOnline'), desc: t('settings.privacy.showOnlineDesc') },
              { key: 'allowInvites', label: t('settings.privacy.allowInvites'), desc: t('settings.privacy.allowInvitesDesc') },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--page-text)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    privacy[item.key] ? '' : 'opacity-70'
                  }`}
                  style={{ background: privacy[item.key] ? 'var(--accent-primary)' : 'var(--card-border)' }}
                >
                  <motion.div
                    animate={{ x: privacy[item.key] ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--card-border)' }}>
            <h4 className="font-bold mb-3 text-red-400">{t('settings.privacy.dangerZone')}</h4>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              <Trash2 size={16} />
              {t('settings.privacy.deleteAccount')}
            </Button>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={savePrivacy} loading={saving === 'privacy'}>
              <Save size={16} />
              {t('settings.save')}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="glass-card">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--page-text)' }}>
            {t('settings.appearance.title')}
          </h3>

          <div className="space-y-6">
            {/* Theme variant selector */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--page-text)' }}>Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'default', label: 'Default', icon: '🎮', desc: 'Original MLBB Togo' },
                  { id: 'esports-gold', label: 'Esports Gold', icon: '🏆', desc: 'Gold & Bronze' },
                  { id: 'night', label: 'Night', icon: '🌙', desc: 'Night brightness' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeVariant(th.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      themeVariant === th.id ? 'border-opacity-80' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: themeVariant === th.id ? 'var(--accent-primary)' : 'var(--card-border)',
                      background: themeVariant === th.id ? 'var(--sidebar-active-bg)' : 'var(--card-bg)',
                    }}
                  >
                    <span className="text-xl mb-1 block">{th.icon}</span>
                    <p className="text-xs font-bold" style={{ color: 'var(--page-text)' }}>{th.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--sidebar-text)' }}>{th.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Light / Dark toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--accent-primary)' }} /> : <Sun size={20} style={{ color: 'var(--badge-warning-text)' }} />}
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--page-text)' }}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>
                    {theme === 'dark' ? 'Thème sombre activé' : 'Thème clair activé'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{ background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--card-border)' }}
              >
                <motion.div
                  animate={{ x: theme === 'dark' ? 28 : 2 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                >
                  {theme === 'dark' ? <Moon size={12} className="text-blue-600" /> : <Sun size={12} className="text-yellow-600" />}
                </motion.div>
              </button>
            </div>

            {/* Night brightness slider */}
            {themeVariant === 'night' && (
              <div className="p-4 rounded-xl" style={{ background: 'var(--surface-bg)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>Night Brightness</p>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>{Math.round(brightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.4"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: 'var(--card-border)' }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--sidebar-text)' }}>Dimmer</span>
                  <span className="text-[10px]" style={{ color: 'var(--sidebar-text)' }}>Brighter</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm mb-3" style={{ color: 'var(--sidebar-text)' }}>{t('settings.appearance.preview')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card !p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{t('settings.appearance.previewCard')}</p>
                      <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('settings.appearance.previewStyle')}</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card !p-4" style={{ borderColor: 'var(--accent-primary)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="neon" size="sm">{t('settings.appearance.previewGlow')}</Badge>
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--page-text)' }}>{t('settings.appearance.previewEffect')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation de suppression du compte */}
      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={deleteAccount}
        loading={saving === 'delete'}
        variant="danger"
        title={t('settings.privacy.deleteAccount')}
        message={t('settings.deleteConfirm')}
        confirmLabel={t('settings.privacy.deleteAccount')}
      />
    </div>
  );
}
