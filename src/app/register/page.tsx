'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, ArrowLeft, UserPlus, Mail, Lock, Gamepad2, User } from 'lucide-react';
import { api, setToken } from '@/lib/api';
import { useAuthStore, useLangStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';
import { Button, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';
import { MLBB_RANKS, MLBB_ROLES } from '@/lib/constants';

export default function RegisterPage() {
  const t = useT();
  const router = useRouter();
  const setUser = useAuthStore((s: any) => s.setUser);
  const setUserProfile = useAuthStore((s: any) => s.setUserProfile);
  const setLang = useLangStore((s: any) => s.setLang);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rank: '',
    role: '',
    mlbbId: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError(t('auth.changePassword.tooShort'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }
    setBusy(true);
    try {
      const res: any = await api.auth.register({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        rank: form.rank || undefined,
        role: form.role || undefined,
        mlbbId: form.mlbbId || undefined,
      });
      setToken(res.token);
      setUser(res.user);
      setUserProfile(res.user);
      if (res.user?.lang) setLang(res.user.lang);
      toast.success(t('auth.register.success'));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gaming-dark">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 hero-gradient opacity-30" />

      <Link
        href="/"
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white sm:left-8 sm:top-8"
      >
        <ArrowLeft size={16} /> {t('adminLogin.back')}
      </Link>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[#6d28d9]/10" />
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <Swords className="h-9 w-9 text-blue-400" />
              <div className="absolute inset-0 blur-md opacity-40">
                <Swords className="h-9 w-9 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-gradient">MLBB</span>
              <span className="ml-1 text-xl font-bold text-white">Togo</span>
            </div>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold leading-tight text-white">
              Join the <span className="text-gradient">Togolese</span> Mobile Legends community.
            </h2>
            <p className="mt-4 max-w-md text-sm text-zinc-400">
              Create your account, link your game, climb the rankings and compete in tournaments.
            </p>
          </div>
          <p className="relative text-xs text-zinc-600">Unofficial community. © Moonton Technology.</p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Swords className="h-8 w-8 text-blue-400" />
              <span className="text-lg font-bold text-white">MLBB Togo</span>
            </div>

            <h1 className="text-2xl font-bold text-white">{t('auth.register.title')}</h1>
            <p className="mt-1 text-sm text-zinc-400">{t('auth.register.subtitle')}</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Input
                label={t('auth.register.username')}
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                required
              />
              <Input
                label={t('auth.register.email')}
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('auth.register.password')}
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  required
                />
                <Input
                  label={t('auth.register.confirmPassword')}
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={t('auth.register.rank')}
                  options={[{ value: '', label: '—' }, ...MLBB_RANKS.map((r) => ({ value: r.id, label: r.name }))]}
                  value={form.rank}
                  onChange={set('rank')}
                />
                <Select
                  label={t('auth.register.role')}
                  options={[{ value: '', label: '—' }, ...MLBB_ROLES.map((r) => ({ value: r.id, label: r.name }))]}
                  value={form.role}
                  onChange={set('role')}
                />
              </div>
              <Input
                label={t('auth.register.mlbbId')}
                value={form.mlbbId}
                onChange={set('mlbbId')}
                placeholder="123456789"
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" variant="primary" loading={busy} disabled={!form.username || !form.email || !form.password} className="w-full">
                <UserPlus size={16} /> {t('auth.register.submit')}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-zinc-600">
              <span className="h-px flex-1 bg-white/10" /> {t('signin.or')} <span className="h-px flex-1 bg-white/10" />
            </div>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-zinc-200 transition-all hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Gamepad2 size={16} /> {t('signin.title')}
            </Link>

            <p className="mt-6 text-center text-sm text-zinc-400">
              {t('auth.register.alreadyAccount')}{' '}
              <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
                {t('auth.register.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
