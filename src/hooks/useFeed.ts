import { useState, useEffect, useCallback } from 'react';
import type { FeedEntry, FeedSource } from '../types';

const PROXY = 'https://api.allorigins.win/get?url=';

async function fetchRSS(source: FeedSource): Promise<FeedEntry[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(source.url)}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${source.url}`);
  }
  const data = await res.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, 'text/xml');

  // DOMParser はパース失敗時に <parsererror> 要素を返す
  if (xml.querySelector('parsererror')) {
    throw new Error(`XMLパースエラー: ${source.url}`);
  }

  const items = Array.from(xml.querySelectorAll('item'));

  return items.map((item, index) => {
    // guid または link を安定したIDとして使用する（インデックスは最終手段）
    const guid = item.querySelector('guid')?.textContent;
    const link = item.querySelector('link')?.textContent ?? '#';
    const stableId = guid ?? link ?? `${source.id}-${index}`;

    return {
      id: `${source.id}::${stableId}`,
      title: item.querySelector('title')?.textContent ?? '(no title)',
      link,
      source: source.label,
      pubDate: item.querySelector('pubDate')?.textContent ?? '',
      bookmarked: false,
    };
  });
}

export function useFeed(sources: FeedSource[]) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (sources.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.allSettled(sources.map(fetchRSS));
      const flat = results
        .flatMap(result => {
          if (result.status === 'fulfilled') return result.value;
          console.error('フィードの取得に失敗しました:', result.reason);
          return [];
        })
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      setEntries(prev => {
        const bookmarked = new Set(prev.filter(e => e.bookmarked).map(e => e.id));
        return flat.map(e => ({ ...e, bookmarked: bookmarked.has(e.id) }));
      });
    } finally {
      setLoading(false);
    }
  }, [sources]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (sources.length === 0) return;
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sources, fetchAll]);

  const toggleBookmark = (id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e))
    );
  };

  return { entries, loading, toggleBookmark, refresh: fetchAll };
}
