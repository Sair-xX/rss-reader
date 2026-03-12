import type { FeedEntry } from '../types';

interface Props {
  entries: FeedEntry[];
  loading: boolean;
  onToggleBookmark: (id: string) => void;
}

function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton-title" />
      <div className="skeleton-meta" />
    </div>
  );
}

export function FeedList({ entries, loading, onToggleBookmark }: Props) {
  if (loading) {
    return (
      <section className="panel">
        <div className="scan-line" />
        {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="panel empty-state">
        // 記事が見つかりません
      </section>
    );
  }

  return (
    <section className="panel">
      <table className="feed-table">
        <thead>
          <tr>
            {['Title', 'Source', 'Date', '★'].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                <a href={entry.link} target="_blank" rel="noopener noreferrer">
                  {entry.title}
                </a>
              </td>
              <td>
                <span className="source-badge">{entry.source}</span>
              </td>
              <td className="date-cell">
                {new Date(entry.pubDate).toLocaleDateString('ja-JP')}
              </td>
              <td>
                <button
                  className={`bookmark-btn ${entry.bookmarked ? 'active' : ''}`}
                  onClick={() => onToggleBookmark(entry.id)}
                >
                  {entry.bookmarked ? '★' : '☆'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}