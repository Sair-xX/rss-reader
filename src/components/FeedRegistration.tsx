import { useState } from 'react';
import type { FeedSource } from '../types';

const API = 'https://rss-reader-server-production-344f.up.railway.app';

const RSS_PRESETS = [
  {
    category: '物理学',
    items: [
      { label: 'Physics World', url: 'https://physicsworld.com/feed/' },
      { label: 'APS Physics Magazine', url: 'https://physics.aps.org/feed' },
      { label: 'Nature Physics', url: 'https://www.nature.com/nphys.rss' },
    ],
  },
  {
    category: '経済',
    items: [
      { label: 'IMF Blog', url: 'https://www.imf.org/en/Blogs/rss' },
      { label: 'World Bank Blogs', url: 'https://blogs.worldbank.org/rss.xml' },
      { label: 'NBER Digest', url: 'https://www.nber.org/rss/digest.xml' },
    ],
  },
  {
    category: 'コンピューター・IT',
    items: [
      { label: 'Hacker News', url: 'https://hnrss.org/frontpage' },
      { label: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
      { label: 'InfoQ', url: 'https://feed.infoq.com/' },
    ],
  },
  {
    category: '生物学',
    items: [
      { label: 'Nature Biotechnology', url: 'https://www.nature.com/nbt.rss' },
      { label: 'PLOS Biology', url: 'https://journals.plos.org/plosbiology/feed/atom' },
      { label: 'Cell Press', url: 'https://www.cell.com/cell/current.rss' },
    ],
  },
] as const;

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

  const handleAddPreset = async (preset: { label: string; url: string }) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd({ id: crypto.randomUUID(), url: preset.url, label: preset.label });
    } catch {
      setError('プリセットの登録に失敗しました');
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
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: '.72rem', color: '#a78bfa', marginBottom: 8 }}>分野から選ぶ（おすすめRSS）</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {RSS_PRESETS.map((group) => (
            <div key={group.category}>
              <div style={{ fontSize: '.7rem', color: '#7c3aedaa', marginBottom: 6 }}>{group.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.items.map((item) => (
                  <button
                    type="button"
                    key={item.url}
                    disabled={loading}
                    onClick={() => handleAddPreset(item)}
                    style={{ textTransform: 'none', letterSpacing: '.05em' }}
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
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
