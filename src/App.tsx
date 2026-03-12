import { useState, useEffect } from 'react';
import type { FeedSource } from './types';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { entries, loading, toggleBookmark, refresh } = useFeed(sources);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  }, [sources]);

  const addSource = (source: FeedSource) =>
    setSources((prev) => [...prev, source]);
  const removeSource = (id: string) =>
    setSources((prev) => prev.filter((s) => s.id !== id));

  const displayed = entries
    .filter((e) => !showBookmarked || e.bookmarked)
    .filter((e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="app">
      <header className="header">
        <h1>RSS://READER</h1>
        <div className="header-sub">NEURAL FEED AGGREGATOR v2.0</div>
      </header>
      <FeedRegistration sources={sources} onAdd={addSource} onRemove={removeSource} />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showBookmarked={showBookmarked}
        onToggle={() => setShowBookmarked((p) => !p)}
        onRefresh={refresh}
        loading={loading}
        count={displayed.length}
      />
      <FeedList entries={displayed} loading={loading} onToggleBookmark={toggleBookmark} />
    </div>
  );
}