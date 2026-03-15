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
      { label: 'Zenn', url: 'https://zenn.dev/feed' },
      { label: 'Qiita', url: 'https://qiita.com/popular-items/feed' },
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
  {
    category: '日本語IT・テック',
    items: [
      { label: 'ITmedia', url: 'https://rss.itmedia.co.jp/rss/2.0/itmediamain.xml' },
      { label: 'ASCII.jp', url: 'https://ascii.jp/rss.xml' },
      { label: 'Gihyo（技術評論社）', url: 'https://gihyo.jp/feed/rss2' },
      { label: 'ねとらぼ', url: 'https://nlab.itmedia.co.jp/nl/rss/2.0/index.rdf' },
      { label: 'WIRED Japan', url: 'https://wired.jp/rssfeeder/' },
    ],
  },
  {
    category: 'ゲーム',
    items: [
      { label: '4Gamer', url: 'https://www.4gamer.net/rss/index.xml' },
      { label: 'ファミ通', url: 'https://www.famitsu.com/feed' },
      { label: 'Game*Spark', url: 'https://www.gamespark.jp/index.rdf' },
      { label: 'IGN Japan', url: 'https://jp.ign.com/feed.xml' },
      { label: 'AUTOMATON', url: 'https://automaton-media.com/feed/' },
      { label: 'Kotaku Japan', url: 'https://www.kotaku.jp/feed/index.xml' },
    ],
  },
  {
    category: 'アニメ',
    items: [
      { label: 'アニメイトタイムズ', url: 'https://www.animatetimes.com/rss/' },
      { label: 'Anime!Anime!', url: 'https://animeanime.jp/rss20.xml' },
      { label: 'アキバ総研', url: 'https://akiba-souken.com/rss/' },
      { label: 'アニメハック', url: 'https://anime.eiga.com/rss/' },
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
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/sources/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
        credentials: 'include',
      });
      if (!res.ok) { setError('RSSフィードが見つかりませんでした'); return; }
      const data: { feedUrl?: string; title?: string } = await res.json();
      if (!data.feedUrl) { setError('RSSフィードが見つかりませんでした'); return; }
      await onAdd({ id: crypto.randomUUID(), url: data.feedUrl, label: data.title || data.feedUrl });
      setUrl('');
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreset = async (preset: { label: string; url: string }) => {
    if (loading) return;
    setLoading(true); setError(null);
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
          onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="サイトURL（例：https://zenn.dev）"
          disabled={loading}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? 'フィードを検索中...' : '追加'}
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.75rem', opacity: 0.6 }}>提案</span>
          <span style={{ fontSize: '.85rem' }}>おすすめRSS（未追加候補）</span>
          <button type="button" onClick={() => { setShowPresets(p => !p); setSelectedCategory(null); }}>
            {showPresets ? 'おすすめRSSを閉じる' : 'おすすめRSSを表示'}
          </button>
        </div>

        {showPresets && (
          <div style={{ marginTop: 8 }}>
            {/* カテゴリボタン：flexWrapで折り返し対応 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {RSS_PRESETS.map(cat => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
                  style={{ fontWeight: selectedCategory === cat.category ? 'bold' : 'normal' }}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* 選択したカテゴリのフィード一覧：flexWrapで折り返し対応 */}
            {selectedCategory && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {RSS_PRESETS.find(c => c.category === selectedCategory)?.items.map(item => (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => handleAddPreset(item)}
                    disabled={loading}
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => setShowSources(p => !p)}>
          {showSources ? '登録済みを閉じる' : `登録済み（${sources.length}）`}
        </button>
        {showSources && (
          <ul style={{ marginTop: 8, listStyle: 'none', padding: 0 }}>
            {sources.map(s => (
              <li key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
                <button type="button" onClick={() => onRemove(s.id)} style={{ flexShrink: 0 }}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p style={{ color: '#ff6b6b', marginTop: 8 }}>{error}</p>}
    </section>
  );
}
