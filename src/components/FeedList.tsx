import type { FeedEntry } from '../types';

interface FeedListProps {
  entries: FeedEntry[];
  onToggleBookmark: (id: string) => void;
}

export function FeedList({ entries, onToggleBookmark }: FeedListProps) {
  if (entries.length === 0) {
    return <p>記事がありません。</p>;
  }

  return (
    <ul>
      {entries.map(entry => (
        <li key={entry.id}>
          <a href={entry.link} target="_blank" rel="noopener noreferrer">
            {entry.title}
          </a>
          <span> — {entry.source}</span>
          {entry.pubDate && <span> ({new Date(entry.pubDate).toLocaleString('ja-JP')})</span>}
          <button onClick={() => onToggleBookmark(entry.id)}>
            {entry.bookmarked ? '★' : '☆'}
          </button>
        </li>
      ))}
    </ul>
  );
}
