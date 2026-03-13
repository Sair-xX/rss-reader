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

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const rangeEnd = Math.min(currentPage * PAGE_LIMIT, total);
  const showPaging = total > PAGE_LIMIT && totalPages > 1;

  const handleChangePage = (page: number) => {
    goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {showPaging && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
              <button type="button" onClick={() => handleChangePage(currentPage - 1)} disabled={loading}>
                ← 前の20件
              </button>
            )}
            <span style={{ fontSize: '.75rem', color: '#7c3aed88' }}>
              {rangeStart}〜{rangeEnd} 件 / 全{total}件
            </span>
            {currentPage < totalPages && (
              <button type="button" onClick={() => handleChangePage(currentPage + 1)} disabled={loading}>
                次の20件 →
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
