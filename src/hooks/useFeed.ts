import { useState, useEffect, useCallback } from 'react';
import type { FeedEntry, FeedSource } from '../types';

const PROXY = 'https://api.allorigins.win/get?url=';

async function fetchRSS(source: FeedSource): Promise<FeedEntry[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(source.url)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, 'text/xml');
  if (xml.querySelector('parsererror')) throw new Error('XML parse error');
  const items = Array.from(xml.querySelectorAll('item'));

  return items.map((item) => {
    const guid = item.querySelector('guid')?.textContent;
    const link = item.querySelector('link')?.textContent;
    return {
      id: `${source.id}-${guid || link || Math.random()}`,
      title: item.querySelector('title')?.textContent ?? '(no title)',
      link: link ?? '#',
      source: source.label,
      sourceId: source.id,
      pubDate: item.querySelector('pubDate')?.textContent ?? '',
      bookmarked: false,
    };
  });
}

export function useFeed(sources: FeedSource[]) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (sources.length === 0) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(sources.map(fetchRSS));
      const flat = results
        .filter((r): r is PromiseFulfilledResult<FeedEntry[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      setEntries((prev) => {
        const bookmarked = new Set(prev.filter((e) => e.bookmarked).map((e) => e.id));
        return flat.map((e) => ({ ...e, bookmarked: bookmarked.has(e.id) }));
      });
    } finally {
      setLoading(false);
    }
  }, [sources]);

  // 起動時 & sources変更時に自動取得
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // フィード削除時に記事も即座に消す
  useEffect(() => {
    const ids = new Set(sources.map((s) => s.id));
    setEntries((prev) => prev.filter((e) => ids.has(e.sourceId)));
  }, [sources]);

  // 5分ごとに自動更新
  useEffect(() => {
    if (sources.length === 0) return;
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll, sources]);

  const toggleBookmark = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e))
    );
  };

  return { entries, loading, toggleBookmark, refresh: fetchAll };
}