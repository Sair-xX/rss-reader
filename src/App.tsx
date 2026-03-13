import { useState } from 'react';
import { useFeed } from './hooks/useFeed';
import { FeedRegistration } from './components/FeedRegistration';
import { FilterBar } from './components/FilterBar';
import { FeedList } from './components/FeedList';

export default function App() {
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const {
    sources, entries, allTags, loading,
    addSource, removeSource,
    toggleBookmark,
    addTag, removeTag,
    refresh,
  } = useFeed();

  const displayed = entries
    .filter(e => !showBookmarked || e.bookmarked)
    .filter(e => !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(e => !selectedTag || e.tags.includes(selectedTag));

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
        onToggle={() => setShowBookmarked(p => !p)}
        onRefresh={refresh}
        loading={loading}
        count={displayed.length}
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={tag => setSelectedTag(prev => prev === tag ? null : tag)}
      />
      <FeedList
        entries={displayed}
        loading={loading}
        onToggleBookmark={toggleBookmark}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
    </div>
  );
}
