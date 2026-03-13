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
      { label: 'Physics Today', url: 'https://physicstoday.scitation.org/action/showFeed?type=etoc&feed=rss&jc=pto' },
      { label: 'CERN News', url: 'https://home.cern/api/news/opendata.rss' },
      { label: 'Quanta Magazine (Physics)', url: 'https://www.quantamagazine.org/tag/physics/feed/' },
    ],
  },
  {
    category: '経済',
    items: [
      { label: 'IMF Blog', url: 'https://www.imf.org/en/Blogs/rss' },
      { label: 'World Bank Blogs', url: 'https://blogs.worldbank.org/rss.xml' },
      { label: 'NBER Digest', url: 'https://www.nber.org/rss/digest.xml' },
      { label: 'OECD Insights', url: 'https://oecdinsights.org/feed/' },
      { label: 'VoxEU', url: 'https://cepr.org/voxeu/rss.xml' },
      { label: 'Econbrowser', url: 'https://econbrowser.com/feed' },
    ],
  },
  {
    category: 'コンピューター・IT',
    items: [
      { label: 'Hacker News', url: 'https://hnrss.org/frontpage' },
      { label: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/' },
      { label: 'InfoQ', url: 'https://feed.infoq.com/' },
      { label: 'GitHub Blog', url: 'https://github.blog/feed/' },
      { label: 'The Verge (Tech)', url: 'https://www.theverge.com/rss/tech/index.xml' },
      { label: 'AWS News Blog', url: 'https://aws.amazon.com/blogs/aws/feed/' },
    ],
  },
  {
    category: '生物学',
    items: [
      { label: 'Nature Biotechnology', url: 'https://www.nature.com/nbt.rss' },
      { label: 'PLOS Biology', url: 'https://journals.plos.org/plosbiology/feed/atom' },
      { label: 'Cell Press', url: 'https://www.cell.com/cell/current.rss' },
      { label: 'Nature Ecology & Evolution', url: 'https://www.nature.com/natecolevol.rss' },
      { label: 'Genome Biology', url: 'https://genomebiology.biomedcentral.com/articles/rss.xml' },
      { label: 'The Scientist', url: 'https://www.the-scientist.com/feed' },
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
  const [showPresets, setShowPresets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSources, setShowSources] = useState(false);

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
      <div className="feed-section feed-section-suggested">
        <div className="feed-section-header">
          <span className="feed-section-badge">提案</span>
          <span className="feed-section-title">おすすめRSS（未追加候補）</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowPresets((prev) => !prev);
            if (showPresets) setSelectedCategory(null);
          }}
        >
          {showPresets ? 'おすすめRSSを閉じる' : 'おすすめRSSを表示'}
        </button>
        {showPresets && (
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {RSS_PRESETS.map((group) => (
                <button
                  key={group.category}
                  type="button"
                  onClick={() => setSelectedCategory(group.category)}
                  style={{
                    textTransform: 'none',
                    letterSpacing: '.05em',
                    opacity: selectedCategory === group.category ? 1 : 0.85,
                  }}
                >
                  {group.category}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <div>
                <div style={{ fontSize: '.7rem', color: '#7c3aedaa', marginBottom: 6 }}>{selectedCategory}の候補</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {RSS_PRESETS.find((group) => group.category === selectedCategory)?.items.map((item) => (
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
            )}
          </div>
        )}
      </div>
      {error && <p style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</p>}
      {sources.length > 0 && (
        <div className="feed-section feed-section-registered">
          <div className="feed-section-header">
            <span className="feed-section-badge">管理</span>
            <span className="feed-section-title">追加済みRSS一覧（登録中）</span>
          </div>
          <button type="button" onClick={() => setShowSources((prev) => !prev)}>
            {showSources ? '追加済みRSS一覧を隠す' : `追加済みRSS一覧を表示 (${sources.length})`}
          </button>
          {showSources && (
            <ul className="source-list" style={{ marginTop: 8 }}>
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
        </div>
      )}
    </section>
  );
}