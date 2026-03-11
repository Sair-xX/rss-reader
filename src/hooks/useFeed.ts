import { useState, useEffect } from 'react';
import { FeedEntry, FeedSource } from '../types';

const PROXY = 'https://api.allorigins.win/get?url=';

async function fetchRSS(source: FeedSource): Promise<FeedEntry[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(source.url)}`);
  const data = await res.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, 'text/xml');
  const items = Array.from(xml.querySelectorAll('item'));

  return items.map((item, index) => ({
    id: `${source.id}-${index}`,
    title: item.querySelector('title')?.textContent ?? '(no title)',
    link: item.querySelector('link')?.textContent ?? '#',
    source: source.label,
    pubDate: item.querySelector('pubDate')?.textContent ?? '',
    bookmarked: false,
  }));
}

export function useFeed(sources: FeedSource[]) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    if (sources.length === 0) return;
    setLoading(true);
    const results = await Promise.all(sources.map(fetchRSS));
    const flat = results.flat().sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    setEntries(prev => {
      const bookmarked = new Set(prev.filter(e => e.bookmarked).map(e => e.id));
      return flat.map(e => ({ ...e, bookmarked: bookmarked.has(e.id) }));
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [sources]);

  useEffect(() => {
    if (sources.length === 0) return;
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sources]);

  const toggleBookmark = (id: string) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e))
    );
  };

  return { entries, loading, toggleBookmark, refresh: fetchAll };
}