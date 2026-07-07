'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swords, ArrowLeft, Mail, Lock, Gamepad2 } from 'lucide-react';
import { api, setToken } from '@/lib/api';
import { useAuthStore, useLangStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const setUser = useAuthStore((s: any) => s.setUser);
  const setUserProfile = useAuthStore((s: any) => s.setUserProfile);
  const setLang = useLangStore((s: any) => s.setLang);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError('');
    try {
      const res: any = await api.auth.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      setUserProfile(res.user);
      if (res.user?.lang) setLang(res.user.lang);
      toast.success(t('auth.login.success'));
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || t('adminLogin.error'));
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
        {/* Brand panel */}
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
              The community platform for <span className="text-gradient">Mobile Legends</span> in Togo.
            </h2>
            <p className="mt-4 max-w-md text-sm text-zinc-400">
              Rankings, teams, tournaments, forum and the full hero meta. Join the best Togolese players.
            </p>
          </div>
          <p className="relative text-xs text-zinc-600">Unofficial community. © Moonton Technology.</p>
        </div>

        {/* Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <Swords className="h-8 w-8 text-blue-400" />
              <span className="text-lg font-bold text-white">MLBB Togo</span>
            </div>

            <h1 className="text-2xl font-bold text-white">{t('auth.login.title')}</h1>
            <p className="mt-1 text-sm text-zinc-400">{t('auth.login.subtitle')}</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Input
                label={t('auth.login.email')}
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <div>
                <Input
                  label={t('auth.login.password')}
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
                  />
                  {t('auth.login.remember')}
                </label>
                <button type="button" className="text-blue-400 hover:text-blue-300">
                  {t('auth.login.forgotPassword')}
                </button>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button type="submit" variant="primary" loading={busy} disabled={!email || !password} className="w-full">
                <Lock size={16} /> {busy ? t('adminLogin.loading') : t('auth.login.submit')}
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
              {t('auth.login.noAccount')}{' '}
              <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
                {t('auth.login.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
