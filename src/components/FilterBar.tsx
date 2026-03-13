interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  showBookmarked: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  loading: boolean;
  count: number;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
  showJapanese: boolean;
  translateLoading: boolean;
  translatedCount: number;
  totalToTranslate: number;
  onToggleJapanese: () => void;
}

export function FilterBar({
  searchQuery, onSearchChange,
  showBookmarked, onToggle,
  onRefresh, loading, count,
  allTags, selectedTag, onSelectTag,
  showJapanese, translateLoading, translatedCount, totalToTranslate, onToggleJapanese,
}: Props) {
  const translateLabel = translateLoading
    ? `翻訳中... ${translatedCount}/${totalToTranslate}`
    : (showJapanese ? '🌐 原文' : '🌐 日本語');

  return (
    <section className="panel">
      <div className="row">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="検索ワードを入力..."
          className="input-wide"
        />
        <label className="checkbox-label">
          <input type="checkbox" checked={showBookmarked} onChange={onToggle} />
          Bookmarks
        </label>
        <button onClick={onRefresh} disabled={loading}>
          {loading ? 'SCANNING...' : '更新'}
        </button>
        <button type="button" onClick={onToggleJapanese} disabled={translateLoading}>
          {translateLabel}
        </button>
        <span className="count-badge">{count} articles</span>
      </div>
      {allTags.length > 0 && (
        <div className="tag-filter-row">
          <button
            className={`tag-btn ${selectedTag === null ? 'active' : ''}`}
            onClick={() => onSelectTag('')}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
