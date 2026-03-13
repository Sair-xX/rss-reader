import { useEffect, useState } from 'react';
import { useFeed } from './hooks/useFeed';
import { FeedRegistration } from './components/FeedRegistration';
import { FilterBar } from './components/FilterBar';
import { FeedList } from './components/FeedList';

const API = 'https://rss-reader-server-production-344f.up.railway.app';
const PAGE_LIMIT = 20;

type AuthUser = { id?: string; name?: string; email?: string; picture?: string };

export default function App() {
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleUnauthorized = () => setUser(null);

  const {
    sources, entries, allTags, loading,
    total, totalPages, currentPage, searchQuery,
    addSource, removeSource,
    toggleBookmark,
    addTag, removeTag,
    search,
    goToPage,
    refresh,
  } = useFeed({ onUnauthorized: handleUnauthorized });

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const me = await res.json();
        setUser(me?.user ?? me);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${API}/api/auth/google/start`;
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  const displayed = entries
    .filter(e => !showBookmarked || e.bookmarked)
    .filter(e => !selectedTag || e.tags.includes(selectedTag));

  const shownCount = Math.min(currentPage * PAGE_LIMIT, total);

  if (checkingAuth) {
    return (
      <div className="app">
        <section className="panel empty-state">認証状態を確認中...</section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <header className="header">
          <h1>RSS://READER</h1>
          <div className="header-sub">NEURAL FEED AGGREGATOR v2.0</div>
        </header>
        <section className="panel empty-state" style={{ letterSpacing: '.1em' }}>
          <p style={{ marginBottom: 16 }}>記事一覧を表示するにはログインが必要です</p>
          <button type="button" onClick={loginWithGoogle}>Googleでログイン</button>
        </section>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>RSS://READER</h1>
        <div className="header-sub">NEURAL FEED AGGREGATOR v2.0</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '.75rem', color: '#a78bfa' }}>{user.name || user.email || 'ログイン中'}</span>
          <button type="button" onClick={logout}>ログアウト</button>
        </div>
      </header>
      <FeedRegistration sources={sources} onAdd={addSource} onRemove={removeSource} />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={search}
        showBookmarked={showBookmarked}
        onToggle={() => setShowBookmarked(p => !p)}
        onRefresh={refresh}
        loading={loading}
        count={displayed.length}
        allTags={allTags}
        selectedTag={selectedTag}
        onSelectTag={tag => setSelectedTag(tag || null)}
      />
      <FeedList
        entries={displayed}
        loading={loading}
        onToggleBookmark={toggleBookmark}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onUnauthorized={handleUnauthorized}
      />
      <section className="panel">
        {currentPage < totalPages && (
          <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={loading}>
            次の20件を読み込む
          </button>
        )}
        <p>{total}件中 {shownCount}件表示</p>
      </section>
    </div>
  );
}
