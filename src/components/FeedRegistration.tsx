import { useState } from 'react';
import type { FeedSource } from '../types';

interface FeedRegistrationProps {
  sources: FeedSource[];
  onAdd: (source: FeedSource) => void;
  onRemove: (id: string) => void;
}

export function FeedRegistration({ sources, onAdd, onRemove }: FeedRegistrationProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!url || !label) return;
    onAdd({ id: crypto.randomUUID(), url, label });
    setUrl('');
    setLabel('');
  };

  return (
    <div>
      <h2>フィード登録</h2>
      <form onSubmit={e => { e.preventDefault(); handleAdd(); }}>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="名前（例：Zenn）" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="RSS URL" />
        <button type="submit">追加</button>
      </form>
      <ul>
        {sources.map(s => (
          <li key={s.id}>
            {s.label} — {s.url}
            <button onClick={() => onRemove(s.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
