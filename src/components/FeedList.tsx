interface FilterBarProps {
  showBookmarked: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function FilterBar({ showBookmarked, onToggle, onRefresh, loading }: FilterBarProps) {
  return (
    <div>
      <label>
        <input type="checkbox" checked={showBookmarked} onChange={onToggle} />
        ブックマークのみ表示
      </label>
      <button onClick={onRefresh} disabled={loading}>
        {loading ? '取得中...' : '更新'}
      </button>
    </div>
  );
}