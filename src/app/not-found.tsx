import Link from 'next/link';
import { Swords, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gaming-dark px-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-[#6d28d9]/10 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gaming-card ring-1 ring-white/10 text-blue-400">
            <Swords size={40} />
          </div>
        </div>

        <p className="text-7xl font-black text-gradient leading-none">404</p>
        <h1 className="mt-4 text-xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-400">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30"
          >
            <Home size={16} /> Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:border-white/20 hover:text-white"
          >
            <Compass size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
