'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessagesSquare, Plus, Heart, MessageCircle, Eye, Pin, Search,
  TrendingUp, Clock,
} from 'lucide-react';
import { Card, SectionCard, Badge, Avatar, Button, PageHeader, EmptyState, Input, Select, Textarea } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { useForumStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { timeAgo, getRankName } from '@/lib/helpers';
import { useT } from '@/lib/i18n';
import toast from 'react-hot-toast';

export default function Forum() {
  const t = useT();
  const { posts, categories, setPosts, likePost } = useForumStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('recent');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commenting, setCommenting] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState('strategies');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const reload = () => api.posts.list().then((l: any) => setPosts(Array.isArray(l) ? l : []));

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = posts
    .filter((p: any) => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      if (activeSort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (activeSort === 'popular') return b.likes - a.likes;
      if (activeSort === 'comments') return b.comments.length - a.comments.length;
      return 0;
    });

  const handleLike = (id: string) => {
    likePost(id);
    api.posts.like(id).then(reload).catch(() => {});
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error(t('forum.titleRequired'));
      return;
    }
    setSaving(true);
    try {
      await api.posts.create({
        category: newCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      await reload();
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      toast.success(t('forum.published'));
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async (postId: string) => {
    const content = (commentText[postId] || '').trim();
    if (!content) return;
    setCommenting(postId);
    try {
      await api.posts.comment(postId, { content });
      setCommentText((s) => ({ ...s, [postId]: '' }));
      await reload();
    } catch (e: any) {
      toast.error(e?.message || t('common.error'));
    } finally {
      setCommenting(null);
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        icon={<MessagesSquare size={28} />}
        title={t('forum.title')}
        subtitle={t('forum.subtitle')}
        variant="danger"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            {t('forum.newPost')}
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">

        <div className="lg:w-64 flex-shrink-0">
          <div className="section-card">
            <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--page-text)' }}>{t('forum.categories')}</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                  activeCategory === 'all' ? '' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: activeCategory === 'all' ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: activeCategory === 'all' ? 'var(--accent-primary)' : 'var(--sidebar-text)',
                }}
              >
                📋 {t('forum.allCategories')}
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                    activeCategory === cat.id ? '' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: activeCategory === cat.id ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: activeCategory === cat.id ? 'var(--accent-primary)' : 'var(--sidebar-text)',
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">

          <div className="section-card !p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--sidebar-text)' }} />
                <input
                  type="text"
                  placeholder={t('forum.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none transition-all duration-300 focus:shadow-lg"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'recent', label: t('forum.sortRecent'), icon: Clock },
                  { id: 'popular', label: t('forum.sortPopular'), icon: TrendingUp },
                  { id: 'comments', label: t('forum.sortDiscussed'), icon: MessageCircle },
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => setActiveSort(sort.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                      activeSort === sort.id ? '' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: activeSort === sort.id ? 'var(--sidebar-active-bg)' : 'transparent',
                      color: activeSort === sort.id ? 'var(--accent-primary)' : 'var(--sidebar-text)',
                    }}
                  >
                    <sort.icon size={14} />
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post: any, index: number) => {
              const category = categories.find((c: any) => c.id === post.category);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="glass-card cursor-pointer" onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}>
                    <div className="flex gap-4">
                      <Avatar name={post.authorName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {post.isPinned && <Pin size={14} style={{ color: 'var(--badge-warning-text)' }} />}
                          <Badge variant="purple" size="sm">{category?.icon} {category?.name}</Badge>
                          <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="mb-1 text-base font-bold" style={{ color: 'var(--page-text)' }}>
                          {post.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--sidebar-text)' }}>
                          {post.content}
                        </p>

                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--sidebar-text)' }}>
                          <div className="flex items-center gap-1.5">
                            <Avatar name={post.authorName} size="sm" />
                            <span className="font-medium" style={{ color: 'var(--page-text)' }}>
                              {post.authorName}
                            </span>
                            <Badge variant="neon" size="sm">{getRankName(post.authorRank)}</Badge>
                          </div>
                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                              className="flex items-center gap-1 transition-colors hover:text-red-400"
                            >
                              <Heart size={14} className="text-red-400" />
                              {post.likes}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              {post.comments.length}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {post.views}
                            </span>
                          </div>
                        </div>

                        {selectedPost === post.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4"
                            style={{ borderTop: '1px solid var(--card-border)' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {post.comments.length > 0 && (
                              <p className="mb-3 text-xs" style={{ color: 'var(--sidebar-text)' }}>{t('forum.comments')} ({post.comments.length})</p>
                            )}
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="mb-3 flex gap-3">
                                <Avatar name={comment.authorName} size="sm" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium" style={{ color: 'var(--page-text)' }}>
                                      {comment.authorName}
                                    </span>
                                    <span className="text-xs" style={{ color: 'var(--sidebar-text)' }}>{timeAgo(comment.createdAt)}</span>
                                  </div>
                                  <p className="mt-0.5 text-sm" style={{ color: 'var(--sidebar-text)' }}>
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                placeholder={t('forum.addComment')}
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText((s) => ({ ...s, [post.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleComment(post.id);
                                  }
                                }}
                                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-all duration-300 focus:shadow-lg"
                                style={{
                                  background: 'var(--input-bg)',
                                  borderColor: 'var(--input-border)',
                                  color: 'var(--input-text)',
                                }}
                              />
                              <Button
                                size="sm"
                                loading={commenting === post.id}
                                disabled={!(commentText[post.id] || '').trim()}
                                onClick={() => handleComment(post.id)}
                              >
                                {t('forum.send')}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <EmptyState
              icon={<MessagesSquare size={28} />}
              title={t('forum.noPostsFound')}
              description={t('forum.beFirstToPost')}
            />
          )}
        </div>
      </div>

      {/* Post creation modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('forum.newPost')}
        icon={<MessagesSquare size={20} />}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label={t('forum.category')}
            value={newCategory}
            onChange={(e: any) => setNewCategory(e.target.value)}
          >
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </Select>
          <Input
            label={t('forum.postTitle')}
            type="text"
            value={newTitle}
            onChange={(e: any) => setNewTitle(e.target.value)}
            placeholder={t('forum.postTitlePlaceholder')}
          />
          <Textarea
            label={t('forum.content')}
            value={newContent}
            onChange={(e: any) => setNewContent(e.target.value)}
            placeholder={t('forum.contentPlaceholder')}
            rows={5}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">{t('forum.cancel')}</Button>
            <Button onClick={handleCreate} loading={saving} className="flex-1">{t('forum.publish')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
