import { useState, useEffect, useCallback } from 'react';
import type { FeedEntry, FeedSource } from '../types';

const API = 'https://rss-reader-server-production-344f.up.railway.app';
export function useFeed() {
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSources = useCallback(async () => {
    const res = await fetch(`${API}/api/sources`);
    const data = await res.json();
    setSources(data.map((s: any) => ({ id: s.id, url: s.url, label: s.label })));
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [feedRes, tagsRes] = await Promise.all([
        fetch(`${API}/api/feed`),
        fetch(`${API}/api/tags`),
      ]);
      const feedData = await feedRes.json();
      const tagsData: string[] = await tagsRes.json();
      setAllTags(tagsData);

      // 各記事のタグを取得
      const entriesWithTags = await Promise.all(
        feedData.map(async (entry: FeedEntry) => {
          const res = await fetch(`${API}/api/tags/${encodeURIComponent(entry.id)}`);
          const tags = await res.json();
          return { ...entry, tags: tags.map((t: any) => t.tag) };
        })
      );
      setEntries(entriesWithTags);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
    fetchAll();
  }, [fetchSources, fetchAll]);

  useEffect(() => {
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const addSource = async (source: FeedSource) => {
    await fetch(`${API}/api/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    await fetchSources();
    await fetchAll();
  };

  const removeSource = async (id: string) => {
    await fetch(`${API}/api/sources/${id}`, { method: 'DELETE' });
    setSources(prev => prev.filter(s => s.id !== id));
    setEntries(prev => prev.filter(e => e.sourceId !== id));
  };

  const toggleBookmark = async (entry: FeedEntry) => {
    if (entry.bookmarked) {
      await fetch(`${API}/api/bookmarks/${entry.id}`, { method: 'DELETE' });
    } else {
      await fetch(`${API}/api/bookmarks`, {
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
    await fetch(`${API}/api/tags`, {
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
    await fetch(`${API}/api/tags`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId, tag }),
    });
    setEntries(prev =>
      prev.map(e => e.id === articleId ? { ...e, tags: e.tags.filter(t => t !== tag) } : e)
    );
  };

  return {
    sources, entries, allTags, loading,
    addSource, removeSource,
    toggleBookmark,
    addTag, removeTag,
    refresh: fetchAll,
  };
}
