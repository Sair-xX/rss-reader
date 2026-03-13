import { useState } from 'react';
import type { FeedSource } from '../types';

const API = 'https://rss-reader-server-production-344f.up.railway.app';

interface Props {
  sources: FeedSource[];
  onAdd: (source: FeedSource) => Promise<void> | void;
  onRemove: (id: string) => void;
}

export function FeedRegistration({ sources, onAdd, onRemove }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!url.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/sources/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        setError('RSSフィードが見つかりませんでした');
        return;
      }

      const data: { feedUrl?: string; title?: string } = await res.json();
      if (!data.feedUrl) {
        setError('RSSフィードが見つかりませんでした');
        return;
      }

      await onAdd({
        id: crypto.randomUUID(),
        url: data.feedUrl,
        label: data.title || data.feedUrl,
      });
      setUrl('');
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-label">// FEED_REGISTRATION</div>
      <div className="row">
        <input
          className="input-wide"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="サイトURL（例：https://zenn.dev）"
          disabled={loading}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? 'フィードを検索中...' : '追加'}
        </button>
      </div>
      {error && <p style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</p>}
      {sources.length > 0 && (
        <ul className="source-list">
          {sources.map((s) => (
            <li key={s.id} className="source-item">
              <span>
                <span className="source-label">{s.label}</span>
                <span className="source-url">{s.url}</span>
              </span>
              <button className="btn-danger" onClick={() => onRemove(s.id)}>削除</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
