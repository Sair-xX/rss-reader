import { useState, useEffect, useCallback } from 'react';
import type { FeedEntry, FeedSource } from '../types';

const API = 'https://rss-reader-server-production-38dc.up.railway.app';

export function useFeed() {
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ソース一覧取得
  const fetchSources = useCallback(async () => {
    const res = await fetch(`${API}/api/sources`);
    const data = await res.json();
    setSources(data.map((s: any) => ({ id: s.id, url: s.url, label: s.label })));
  }, []);

  // フィード取得
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/feed`);
      const data = await res.json();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // 起動時に取得
  useEffect(() => {
    fetchSources();
    fetchAll();
  }, [fetchSources, fetchAll]);

  // 5分ごとに自動更新
  useEffect(() => {
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ソース追加
  const addSource = async (source: FeedSource) => {
    await fetch(`${API}/api/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    await fetchSources();
    await fetchAll();
  };

  // ソース削除
  const removeSource = async (id: string) => {
    await fetch(`${API}/api/sources/${id}`, { method: 'DELETE' });
    setSources(prev => prev.filter(s => s.id !== id));
    setEntries(prev => prev.filter(e => e.sourceId !== id));
  };

  // ブックマーク切り替え
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

  return { sources, entries, loading, addSource, removeSource, toggleBookmark, refresh: fetchAll };
}