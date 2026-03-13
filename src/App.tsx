import { useCallback, useEffect, useState } from 'react';
import { useFeed } from './hooks/useFeed';
import { FeedRegistration } from './components/FeedRegistration';
import { FilterBar } from './components/FilterBar';
import { FeedList } from './components/FeedList';

const API = 'https://rss-reader-server-production-344f.up.railway.app';
const PAGE_LIMIT = 20;

type AuthUser = { id?: string; name?: string; email?: string; picture?: string };

type TranslationValue = {
  title: string;
  content?: string;
};

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

async function translateText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const res = await fetch(`${MYMEMORY_API}?q=${encodeURIComponent(trimmed)}&langpair=en|ja`);
  if (!res.ok) throw new Error('translate_failed');

  const data: { responseData?: { translatedText?: string } } = await res.json();
  return data.responseData?.translatedText?.trim() || text;
}

export default function App() {
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showJapanese, setShowJapanese] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translationProgress, setTranslationProgress] = useState({ translated: 0, total: 0 });
  const [translationCache, setTranslationCache] = useState<Record<string, TranslationValue>>({});

  const handleUnauthorized = useCallback(() => setUser(null), []);

  const {
    sources, entries, bookmarks, allTags, bookmarkTags, loading, error,
    total, totalPages, currentPage, searchQuery,
    addSource, removeSource,
    toggleBookmark,
    isBookmarkPending,
    addTag, removeTag,
    search,
    goToPage,
    refresh,
    refreshBookmarks,
  } = useFeed({ onUnauthorized: handleUnauthorized, enabled: !checkingAuth && !!user });

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

  const baseEntries = showBookmarked ? bookmarks : entries;
  const visibleTags = showBookmarked ? bookmarkTags : allTags;
  const displayed = baseEntries.filter(e => !selectedTag || e.tags.includes(selectedTag));
  const translatedDisplayed = showJapanese
    ? displayed.map((entry) => {
        const translated = translationCache[entry.id];
        return translated ? { ...entry, title: translated.title, content: translated.content ?? entry.content } : entry;
      })
    : displayed;

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const rangeEnd = Math.min(currentPage * PAGE_LIMIT, total);
  const showPaging = !showBookmarked && total > PAGE_LIMIT && totalPages > 1;


  useEffect(() => {
    if (selectedTag && !visibleTags.includes(selectedTag)) {
      setSelectedTag(null);
    }
  }, [selectedTag, visibleTags]);
  const handleChangePage = (page: number) => {
    goToPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleJapanese = useCallback(async () => {
    if (showJapanese) {
      setShowJapanese(false);
      return;
    }

    const targets = displayed.filter((entry) => !translationCache[entry.id]);
    if (targets.length === 0) {
      setShowJapanese(true);
      return;
    }

    setShowJapanese(true);
    setTranslateLoading(true);
    setTranslationProgress({ translated: 0, total: targets.length });

    try {
      let translatedCount = 0;

      for (const entry of targets) {
        try {
          const title = await translateText(entry.title);
          const content = entry.content ? await translateText(entry.content) : undefined;

          setTranslationCache((prev) => ({
            ...prev,
            [entry.id]: { title, content },
          }));
        } finally {
          translatedCount += 1;
          setTranslationProgress({ translated: translatedCount, total: targets.length });
        }
      }
    } catch {
      setShowJapanese(false);
    } finally {
      setTranslateLoading(false);
      setTranslationProgress({ translated: 0, total: 0 });
    }
  }, [displayed, showJapanese, translationCache]);

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
        onRefresh={showBookmarked ? refreshBookmarks : refresh}
        loading={loading}
        count={displayed.length}
        allTags={visibleTags}
        selectedTag={selectedTag}
        onSelectTag={tag => setSelectedTag(tag || null)}
        showJapanese={showJapanese}
        translateLoading={translateLoading}
        translatedCount={translationProgress.translated}
        totalToTranslate={translationProgress.total}
        onToggleJapanese={handleToggleJapanese}
      />
      <FeedList
        entries={translatedDisplayed}
        loading={loading}
        error={error}
        onToggleBookmark={toggleBookmark}
        isBookmarkPending={isBookmarkPending}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onUnauthorized={handleUnauthorized}
      />
      <section className="panel">
        {showPaging && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
              <button type="button" onClick={() => handleChangePage(currentPage - 1)} disabled={loading}>
                ← 前の20件
              </button>
            )}
            <span style={{ fontSize: '.75rem', color: '#7c3aed88' }}>
              {rangeStart}〜{rangeEnd} 件 / 全{total}件
            </span>
            {currentPage < totalPages && (
              <button type="button" onClick={() => handleChangePage(currentPage + 1)} disabled={loading}>
                次の20件 →
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
