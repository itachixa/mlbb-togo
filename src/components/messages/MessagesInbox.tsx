'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageSquare, Shield, Search, Check, CheckCheck, Clock } from 'lucide-react';
import { api, avatarSrc } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { getSocket, usePresence } from '@/lib/realtime';
import { useAuthStore } from '@/store/useStore';
import toast from 'react-hot-toast';

const initialOf = (o: any): string =>
  (o?.displayName || o?.username || '?').trim().charAt(0).toUpperCase() || '?';

const nameOf = (o: any): string => o?.displayName || o?.username || '';

const isStaff = (role?: string): boolean =>
  role === 'admin' || role === 'moderator';

export default function MessagesInbox() {
  const t = useT();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<any | null>(null);
  // Draft conversation opened from a deep link (?to=) with no existing thread.
  const [draftPeer, setDraftPeer] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const handledToRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const myId = useAuthStore((s: any) => s.user?.id);
  const online = usePresence((s) => s.online);
  const connected = usePresence((s) => s.connected);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const loadThreads = useCallback(async () => {
    try {
      const list: any = await api.messages.threads();
      setThreads(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
    }
  }, [t]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadThreads();
      setLoading(false);
    })();
  }, [loadThreads]);

  // Tell the server the peer's messages are read (fire-and-forget); this makes
  // the other party's sent messages show blue read receipts.
  const markRead = useCallback((id: string) => {
    if (id) api.messages.markRead(id).catch(() => {});
  }, []);

  const openThread = useCallback(
    async (id: string) => {
      setActiveId(id);
      setThread(null);
      try {
        const data: any = await api.messages.thread(id);
        setThread(data);
        scrollToBottom();
        markRead(id);
      } catch (e: any) {
        toast.error(e?.message || t('common.error'));
      }
    },
    [scrollToBottom, markRead, t],
  );

  // Deep link: /messages?to=<userId>&name=<name>. Open the existing thread with
  // that user, or start a draft conversation when none exists yet.
  useEffect(() => {
    const to = searchParams.get('to');
    if (!to || loading || handledToRef.current) return;
    handledToRef.current = true;
    const existing = threads.find((th) => th.other?.id === to);
    if (existing) {
      openThread(existing.id);
    } else {
      setDraftPeer({ id: to, name: searchParams.get('name') || '' });
      setActiveId(null);
      setThread(null);
    }
    router.replace('/messages');
  }, [searchParams, loading, threads, openThread, router]);

  const send = useCallback(async () => {
    const body = text.trim();
    if (!body) return;

    // Optimistic message shown instantly with a "pending" (clock) state.
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimistic = {
      id: tempId,
      body,
      senderId: myId,
      mine: true,
      readAt: null,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setText('');

    // First message of a draft conversation: create the thread.
    if (!activeId && draftPeer) {
      setThread({
        id: null,
        other: { id: draftPeer.id, displayName: draftPeer.name },
        messages: [optimistic],
      });
      scrollToBottom();
      try {
        const created: any = await api.messages.startThread({ userId: draftPeer.id, body });
        setThread(created);
        setActiveId(created?.id ?? null);
        setDraftPeer(null);
        loadThreads();
      } catch (e: any) {
        setThread((prev: any) =>
          prev
            ? { ...prev, messages: (prev.messages || []).map((m: any) => (m.id === tempId ? { ...m, status: 'failed' } : m)) }
            : prev,
        );
        toast.error(e?.message || t('common.error'));
      }
      return;
    }

    if (!activeId) return;
    const currentId = activeId;
    setThread((prev: any) => (prev ? { ...prev, messages: [...(prev.messages || []), optimistic] } : prev));
    scrollToBottom();
    try {
      const updated: any = await api.messages.reply(currentId, body);
      // Swap the optimistic list for the authoritative one (correct ids + ticks).
      setThread((prev: any) => (prev && prev.id === updated.id ? updated : prev));
      loadThreads();
    } catch (e: any) {
      setThread((prev: any) =>
        prev
          ? { ...prev, messages: (prev.messages || []).map((m: any) => (m.id === tempId ? { ...m, status: 'failed' } : m)) }
          : prev,
      );
      toast.error(e?.message || t('common.error'));
    }
  }, [text, activeId, draftPeer, myId, scrollToBottom, loadThreads, t]);

  // Live message reception (WebSocket).
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onMsg = (payload: any) => {
      const threadId = payload?.threadId;
      const message = payload?.message;
      if (!threadId || !message) return;
      // Ignore my own echo — outgoing messages are shown optimistically.
      if (message.senderId === myId) return;

      if (threadId === activeIdRef.current) {
        setThread((prev: any) => {
          if (!prev) return prev;
          if ((prev.messages || []).some((m: any) => m.id === message.id)) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), { ...message, mine: false }],
          };
        });
        scrollToBottom();
        // I'm looking at this thread → mark read so the sender sees blue ticks.
        markRead(threadId);
      }

      setThreads((prev: any[]) => {
        const idx = prev.findIndex((th) => th.id === threadId);
        const preview = {
          body: message.body,
          senderId: message.senderId,
          createdAt: message.createdAt,
        };
        if (idx === -1) {
          loadThreads();
          return prev;
        }
        const copy = [...prev];
        const [th] = copy.splice(idx, 1);
        return [{ ...th, lastMessage: preview, lastMessageAt: message.createdAt }, ...copy];
      });
    };

    // Read receipts: the peer read the thread → turn my sent ticks blue.
    const onRead = (payload: any) => {
      const { threadId, readAt } = payload || {};
      if (!threadId || threadId !== activeIdRef.current) return;
      setThread((prev: any) =>
        prev
          ? {
              ...prev,
              messages: (prev.messages || []).map((m: any) =>
                m.mine && !m.readAt ? { ...m, readAt: readAt || new Date().toISOString() } : m,
              ),
            }
          : prev,
      );
    };

    s.on('message:new', onMsg);
    s.on('message:read', onRead);
    return () => {
      s.off('message:new', onMsg);
      s.off('message:read', onRead);
    };
  }, [connected, myId, scrollToBottom, loadThreads, markRead]);

  const other = thread?.other;
  // Peer shown in the conversation header: the thread's peer, or the draft target.
  const headerPeer = other ?? (draftPeer ? { id: draftPeer.id, displayName: draftPeer.name } : null);
  // Right panel is open for an active thread or a draft conversation.
  const panelOpen = !!activeId || !!draftPeer;

  // Client-side filter of the thread list (search box).
  const q = search.trim().toLowerCase();
  const visibleThreads = q
    ? threads.filter((th) => {
        const o = th.other;
        return (
          nameOf(o).toLowerCase().includes(q) ||
          (th.subject || '').toLowerCase().includes(q) ||
          (th.lastMessage?.body || '').toLowerCase().includes(q)
        );
      })
    : threads;

  const fmtTime = (v: any) => {
    const d = new Date(v);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // WhatsApp-style delivery ticks for my own messages.
  const renderTicks = (m: any) => {
    if (m.status === 'pending') return <Clock size={13} className="opacity-70" />;
    if (m.status === 'failed')
      return <span className="text-[11px] font-bold" style={{ color: 'var(--badge-danger-text)' }}>!</span>;
    if (m.readAt) return <CheckCheck size={15} style={{ color: 'var(--accent-primary)' }} />;
    return <CheckCheck size={15} className="opacity-60" />;
  };

  return (
    <div className="h-[calc(100vh-186px)] overflow-hidden sm:h-[calc(100vh-174px)]">
      <div className="h-full rounded-xl border shadow-sm xl:flex" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* Left column: conversation list */}
        <div
          className={`${
            panelOpen ? 'hidden' : 'flex'
          } h-full flex-col xl:flex xl:w-1/4`}
        >
          <div className="sticky border-b px-6 py-7.5" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-medium 2xl:text-xl" style={{ color: 'var(--page-text)' }}>
              {t('messages.conversations')}
              <span className="rounded-xl border px-2 py-0.5 text-base font-medium 2xl:ml-4" style={{ background: 'var(--surface-bg)', borderColor: 'var(--card-border)', color: 'var(--page-text)' }}>
                {threads.length}
              </span>
            </h3>
          </div>

          <div className="flex max-h-full flex-col overflow-auto p-5">
            {/* Search */}
            <form className="sticky mb-7" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border py-2.5 pl-5 pr-10 text-sm outline-none focus:border-opacity-80"
                  style={{ background: 'var(--surface-bg)', borderColor: 'var(--card-border)', color: 'var(--page-text)' }}
                  placeholder={t('messages.search')}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--sidebar-text)' }}>
                  <Search size={18} />
                </span>
              </div>
            </form>

            {/* Thread list */}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--card-border)' }} />
              </div>
            ) : visibleThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm" style={{ color: 'var(--sidebar-text)' }}>
                <MessageSquare size={28} className="opacity-50" />
                {t('messages.none')}
              </div>
            ) : (
              <div className="flex flex-col">
                {visibleThreads.map((th) => {
                  const o = th.other;
                  const active = th.id === activeId;
                  return (
                    <div
                      key={th.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openThread(th.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openThread(th.id);
                        }
                      }}
                      className={`flex cursor-pointer items-center rounded-xl px-4 py-2 transition-colors duration-200 ${
                        active ? '' : ''
                      }`}
                      style={{ background: active ? 'var(--surface-bg)' : 'transparent' }}
                    >
                      <div className="relative mr-3.5 h-11 w-11 shrink-0 rounded-full">
                        {o?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarSrc(o.avatar, 64)}
                            alt={nameOf(o)}
                            referrerPolicy="no-referrer"
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}>
                            {initialOf(o)}
                          </div>
                        )}
                        {o?.id && online.has(o.id) && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2" style={{ background: 'var(--badge-success-text)', borderColor: 'var(--surface-bg)' }} />
                        )}
                      </div>
                      <div className="w-full min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="truncate text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                            {nameOf(o) || th.subject || ''}
                          </h5>
                          {isStaff(o?.roleUser) && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg px-1 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--badge-warning-text)' }}>
                              <Shield size={9} /> {o.roleUser}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>
                          {th.lastMessage?.body || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: active conversation */}
        <div
          className={`${
            panelOpen ? 'flex' : 'hidden'
          } h-full flex-col border-l xl:flex xl:w-3/4`}
          style={{ borderColor: 'var(--card-border)' }}
        >
          {!panelOpen ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
              <MessageSquare size={32} className="opacity-50" />
              {t('messages.empty')}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky flex items-center justify-between border-b px-6 py-4.5" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(null);
                      setThread(null);
                      setDraftPeer(null);
                    }}
                    className="mr-3 rounded-xl p-1.5 transition-colors duration-200 xl:hidden"
                    style={{ color: 'var(--sidebar-text)' }}
                    aria-label={t('messages.title')}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="relative mr-4.5 h-13 w-13 shrink-0 rounded-full">
                    {headerPeer?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSrc(headerPeer.avatar, 64)}
                        alt={nameOf(headerPeer)}
                        referrerPolicy="no-referrer"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full text-base font-bold" style={{ background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}>
                        {initialOf(headerPeer)}
                      </div>
                    )}
                    {headerPeer?.id && online.has(headerPeer.id) && (
                      <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2" style={{ background: 'var(--badge-success-text)', borderColor: 'var(--card-bg)' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="truncate font-medium" style={{ color: 'var(--page-text)' }}>
                      {nameOf(headerPeer) || thread?.subject || ''}
                    </h5>
                    <p className="text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>
                      {t('messages.replyTo')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message thread */}
              <div
                ref={scrollRef}
                className="no-scrollbar max-h-full flex-1 space-y-3.5 overflow-auto px-6 py-7.5"
              >
                {!thread ? (
                  draftPeer ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm" style={{ color: 'var(--sidebar-text)' }}>
                      <MessageSquare size={28} className="opacity-50" />
                      {t('messages.startWith', { name: draftPeer.name })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--card-border)' }} />
                    </div>
                  )
                ) : (
                  (thread.messages || []).map((m: any) =>
                    m.mine ? (
                      // Sent message
                      <div key={m.id} className="ml-auto max-w-[31.25rem]">
                        <div
                          className={`mb-2.5 rounded-2xl rounded-br-none px-5 py-3 ${
                            m.status === 'pending' ? 'opacity-80' : ''
                          }`}
                          style={{ background: 'var(--accent-primary)' }}
                        >
                          <p className="whitespace-pre-wrap break-words font-medium" style={{ color: 'var(--badge-success-text)' }}>
                            {m.body}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs font-medium" style={{ color: 'var(--sidebar-text)' }}>
                          {fmtTime(m.createdAt)}
                          {renderTicks(m)}
                        </div>
                      </div>
                    ) : (
                      // Received message
                      <div key={m.id} className="max-w-[31.25rem]">
                        <p className="mb-2.5 text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                          {nameOf(other) || thread?.subject || ''}
                        </p>
                        <div className="mb-2.5 rounded-2xl rounded-tl-none px-5 py-3" style={{ background: 'var(--surface-bg)' }}>
                          <p className="whitespace-pre-wrap break-words font-medium" style={{ color: 'var(--page-text)' }}>
                            {m.body}
                          </p>
                        </div>
                        <p className="text-xs font-medium" style={{ color: 'var(--sidebar-text)' }}>
                          {fmtTime(m.createdAt)}
                        </p>
                      </div>
                    ),
                  )
                )}
              </div>

              {/* Composer */}
              <div className="sticky bottom-0 border-t px-6 py-5" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
                <form
                  className="flex items-center justify-between space-x-4.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t('messages.placeholder')}
                      className="h-13 w-full rounded-xl border py-2.5 pl-5 pr-19 font-medium outline-none focus:border-opacity-80"
                      style={{ background: 'var(--surface-bg)', borderColor: 'var(--card-border)', color: 'var(--page-text)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    aria-label={t('messages.send')}
                    className="flex h-13 w-13 items-center justify-center rounded-xl transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: 'var(--accent-primary)', color: 'var(--badge-success-text)' }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
