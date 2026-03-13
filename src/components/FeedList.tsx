import { useState } from 'react';
import type { FeedEntry } from '../types';

interface Props {
  entries: FeedEntry[];
  loading: boolean;
  onToggleBookmark: (entry: FeedEntry) => void;
  onAddTag: (articleId: string, tag: string) => void;
  onRemoveTag: (articleId: string, tag: string) => void;
}

const TAG_TONE_COUNT = 8;

function getTagToneIndex(tag: string) {
  let hash = 0;
  const normalized = tag.trim().toLowerCase();

  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) % TAG_TONE_COUNT;
}

function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <div className="skeleton-title" />
      <div className="skeleton-meta" />
    </div>
  );
}

function TagInput({ entry, onAddTag, onRemoveTag }: {
  entry: FeedEntry;
  onAddTag: (articleId: string, tag: string) => void;
  onRemoveTag: (articleId: string, tag: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || entry.tags.includes(trimmed)) return;
    onAddTag(entry.id, trimmed);
    setInput('');
  };

  return (
    <div className="tag-cell">
      {entry.tags.map(tag => {
        const tone = getTagToneIndex(tag);

        return (
          <span key={tag} className={`tag tag-tone-${tone}`}>
            {tag}
            <button className="tag-remove" onClick={() => onRemoveTag(entry.id, tag)}>×</button>
          </span>
        );
      })}
      <input
        className="tag-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="+ タグ"
      />
    </div>
  );
}

export function FeedList({ entries, loading, onToggleBookmark, onAddTag, onRemoveTag }: Props) {
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [summaryError, setSummaryError] = useState<Record<string, string>>({});

  const handleSummarize = async (entry: FeedEntry) => {
    const content = entry.content?.trim() || entry.title;

    setSummaryLoading((prev) => ({ ...prev, [entry.id]: true }));
    setSummaryError((prev) => ({ ...prev, [entry.id]: '' }));

    try {
      const response = await fetch('https://rss-reader-server-production-344f.up.railway.app/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.title, content }),
      });

      if (!response.ok) {
        throw new Error('failed');
      }

      const data: { summary?: string } = await response.json();
      if (!data.summary) {
        throw new Error('empty');
      }

      setSummaries((prev) => ({ ...prev, [entry.id]: data.summary ?? '' }));
    } catch {
      setSummaryError((prev) => ({ ...prev, [entry.id]: '要約に失敗しました' }));
    } finally {
      setSummaryLoading((prev) => ({ ...prev, [entry.id]: false }));
    }
  };

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
            {['Title', 'Source', 'Date', 'Tags', '★'].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>
                <a href={entry.link} target="_blank" rel="noopener noreferrer">
                  {entry.title}
                </a>
                <div className="summary-actions">
                  <button
                    type="button"
                    onClick={() => handleSummarize(entry)}
                    disabled={!!summaryLoading[entry.id]}
                  >
                    {summaryLoading[entry.id] ? '要約中...' : 'AI要約'}
                  </button>
                </div>
                {summaryError[entry.id] ? (
                  <p className="summary-error">{summaryError[entry.id]}</p>
                ) : null}
                {summaries[entry.id] ? (
                  <p className="summary-text">{summaries[entry.id]}</p>
                ) : null}
              </td>
              <td>
                <span className="source-badge">{entry.source}</span>
              </td>
              <td className="date-cell">
                {new Date(entry.pubDate).toLocaleDateString('ja-JP')}
              </td>
              <td>
                <TagInput entry={entry} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
              </td>
              <td>
                <button
                  className={`bookmark-btn ${entry.bookmarked ? 'active' : ''}`}
                  onClick={() => onToggleBookmark(entry)}
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
