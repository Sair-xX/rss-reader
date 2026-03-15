import { CATEGORY_SOURCE_MAP } from '../constants';

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
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function FilterBar({
  searchQuery, onSearchChange,
  showBookmarked, onToggle,
  onRefresh, loading, count,
  allTags, selectedTag, onSelectTag,
  showJapanese, translateLoading, translatedCount, totalToTranslate, onToggleJapanese,
  selectedCategory, onSelectCategory,
}: Props) {
  const translateLabel = translateLoading
    ? `翻訳中... ${translatedCount}/${totalToTranslate}`
    : (showJapanese ? '🌐 原文' : '🌐 日本語');

  const categories = Object.keys(CATEGORY_SOURCE_MAP);

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
        <button onClick={onRefresh} disabled={loading}>{loading ? 'SCANNING...' : '更新'}</button>
        <button type="button" onClick={onToggleJapanese} disabled={translateLoading}>{translateLabel}</button>
        <span className="count-badge">{count} articles</span>
      </div>

      {/* カテゴリフィルター */}
      <div className="tag-filter-row" style={{ marginTop: 8 }}>
        <button
          className={`tag-btn ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          ALL
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`tag-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* タグフィルター */}
      {allTags.length > 0 && (
        <div className="tag-filter-row">
          <button className={`tag-btn ${selectedTag === null ? 'active' : ''}`} onClick={() => onSelectTag('')}>ALL</button>
          {allTags.map(tag => (
            <button key={tag} className={`tag-btn ${selectedTag === tag ? 'active' : ''}`} onClick={() => onSelectTag(tag)}>{tag}</button>
          ))}
        </div>
      )}
    </section>
  );
}
