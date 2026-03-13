import { useState, useEffect, useCallback } from 'react';
import type { FeedEntry, FeedSource } from '../types';

const API = 'https://rss-reader-server-production-344f.up.railway.app';
const PAGE_LIMIT = 20;

type FeedResponse = {
  items: FeedEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

interface UseFeedOptions {
  onUnauthorized?: () => void;
}

const extractAllTags = (items: FeedEntry[]) =>
  [...new Set(items.flatMap((item) => item.tags ?? []))].sort();

export function useFeed(options: UseFeedOptions = {}) {
  const { onUnauthorized } = options;
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const apiFetch = useCallback(async (url: string, init?: RequestInit) => {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
    });
    if (res.status === 401) {
      onUnauthorized?.();
      throw new Error('unauthorized');
    }
    return res;
  }, [onUnauthorized]);

  const fetchSources = useCallback(async () => {
    const res = await apiFetch(`${API}/api/sources`);
    const data = await res.json();
    setSources(data.map((s: any) => ({ id: s.id, url: s.url, label: s.label })));
  }, [apiFetch]);

  const fetchFeed = useCallback(async (page: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_LIMIT));
      if (q.trim()) params.set('q', q.trim());

      const feedRes = await apiFetch(`${API}/api/feed?${params.toString()}`);
      const feedJson = await feedRes.json();

      const isPaged = feedJson && typeof feedJson === 'object' && Array.isArray(feedJson.items);
      const feedItems: FeedEntry[] = isPaged ? feedJson.items : (Array.isArray(feedJson) ? feedJson : []);

      if (isPaged) {
        const payload = feedJson as FeedResponse;
        setTotal(payload.total ?? feedItems.length);
        setTotalPages(payload.totalPages ?? 1);
        setCurrentPage(payload.page ?? page);
      } else {
        setTotal(feedItems.length);
        setTotalPages(1);
        setCurrentPage(page);
      }

      setEntries(feedItems);
      setAllTags(extractAllTags(feedItems));
    } catch (error) {
      if ((error as Error).message !== 'unauthorized') throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchSources();
    fetchFeed(1, '');
  }, [fetchSources, fetchFeed]);

  useEffect(() => {
    const interval = setInterval(() => fetchFeed(currentPage, searchQuery), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchFeed, currentPage, searchQuery]);

  const addSource = async (source: FeedSource) => {
    await apiFetch(`${API}/api/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    await fetchSources();
    await fetchFeed(currentPage, searchQuery);
  };

  const removeSource = async (id: string) => {
    await apiFetch(`${API}/api/sources/${id}`, { method: 'DELETE' });
    setSources(prev => prev.filter(s => s.id !== id));
    setEntries(prev => prev.filter(e => e.sourceId !== id));
  };

  const toggleBookmark = async (entry: FeedEntry) => {
    if (entry.bookmarked) {
      await apiFetch(`${API}/api/bookmarks/${entry.id}`, { method: 'DELETE' });
    } else {
      await apiFetch(`${API}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    }
    setEntries(prev =>
      prev.map(e => e.id === entry.id ? { ...e, bookmarked: !e.bookmarked } : e)
    );
  };

  const addTag = async (articleId: string, tag: string) => {
    await apiFetch(`${API}/api/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, tag }),
    });
    setEntries(prev =>
      prev.map(e => e.id === articleId ? { ...e, tags: [...e.tags, tag] } : e)
    );
    setAllTags(prev => prev.includes(tag) ? prev : [...prev, tag].sort());
  };

  const removeTag = async (articleId: string, tag: string) => {
    await apiFetch(`${API}/api/tags`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, tag }),
    });
    setEntries(prev =>
      prev.map(e => e.id === articleId ? { ...e, tags: e.tags.filter(t => t !== tag) } : e)
    );
  };

  const search = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    fetchFeed(1, q);
  }, [fetchFeed]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    fetchFeed(page, searchQuery);
  }, [fetchFeed, searchQuery]);

  const refresh = useCallback(() => {
    fetchFeed(currentPage, searchQuery);
  }, [fetchFeed, currentPage, searchQuery]);

  return {
    sources, entries, allTags, loading,
    total, totalPages, currentPage, searchQuery,
    addSource, removeSource,
    toggleBookmark,
    addTag, removeTag,
    search,
    goToPage,
    refresh,
  };
}
