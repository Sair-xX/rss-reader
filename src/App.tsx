import { useState } from 'react';
import { useFeed } from './hooks/useFeed';
import { FeedRegistration } from './components/FeedRegistration';
import { FilterBar } from './components/FilterBar';
import { FeedList } from './components/FeedList';

const PAGE_LIMIT = 20;

export default function App() {
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const {
    sources, entries, allTags, loading,
    total, totalPages, currentPage, searchQuery,
    addSource, removeSource,
    toggleBookmark,
    addTag, removeTag,
    search,
    goToPage,
    refresh,
  } = useFeed();

  const displayed = entries
    .filter(e => !showBookmarked || e.bookmarked)
    .filter(e => !selectedTag || e.tags.includes(selectedTag));

  const shownCount = Math.min(currentPage * PAGE_LIMIT, total);

  return (
    <div className="app">
      <header className="header">
        <h1>RSS://READER</h1>
        <div className="header-sub">NEURAL FEED AGGREGATOR v2.0</div>
      </header>
      <FeedRegistration sources={sources} onAdd={addSource} onRemove={removeSource} />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={search}
        showBookmarked={showBookmarked}
        onToggle={() => setShowBookmarked(p => !p)}
        onRefresh={refresh}
        loading={loading}
        count={displayed.length}
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={tag => setSelectedTag(tag || null)}
      />
      <FeedList
        entries={displayed}
        loading={loading}
        onToggleBookmark={toggleBookmark}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
      <section className="panel">
        {currentPage < totalPages && (
          <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={loading}>
            次の20件を読み込む
          </button>
        )}
        <p>{total}件中 {shownCount}件表示</p>
      </section>
    </div>
  );
}
