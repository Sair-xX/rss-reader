import { useState, useEffect } from 'react';
import { FeedSource } from './types';
import { useFeed } from './hooks/useFeed';
import { FeedRegistration } from './components/FeedRegistration';
import { FilterBar } from './components/FilterBar';
import { FeedList } from './components/FeedList';

const STORAGE_KEY = 'rss-sources';

function loadSources(): FeedSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [sources, setSources] = useState<FeedSource[]>(loadSources);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const { entries, loading, toggleBookmark, refresh } = useFeed(sources);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  }, [sources]);

  const addSource = (source: FeedSource) =>
    setSources(prev => [...prev, source]);
  const removeSource = (id: string) =>
    setSources(prev => prev.filter(s => s.id !== id));

  const displayed = showBookmarked ? entries.filter(e => e.bookmarked) : entries;

  return (
    <div>
      <h1>RSSリーダー</h1>
      <FeedRegistration sources={sources} onAdd={addSource} onRemove={removeSource} />
      <FilterBar
        showBookmarked={showBookmarked}
        onToggle={() => setShowBookmarked(prev => !prev)}
        onRefresh={refresh}
        loading={loading}
      />
      <FeedList entries={displayed} onToggleBookmark={toggleBookmark} />
    </div>
  );
}