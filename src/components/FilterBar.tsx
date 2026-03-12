interface Props {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  showBookmarked: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  loading: boolean;
  count: number;
}

export function FilterBar({
  searchQuery, onSearchChange,
  showBookmarked, onToggle,
  onRefresh, loading, count,
}: Props) {
  return (
    <section className="panel row">
      <input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="検索ワードを入力..."
        className="input-wide"
      />
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showBookmarked}
          onChange={onToggle}
        />
        Bookmarks
      </label>
      <button onClick={onRefresh} disabled={loading}>
        {loading ? 'SCANNING...' : '更新'}
      </button>
      <span className="count-badge">{count} articles</span>
    </section>
  );
}