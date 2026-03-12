import React, { useState } from 'react';
import type { FeedSource } from '../types';

interface Props {
  sources: FeedSource[];
  onAdd: (source: FeedSource) => void;
  onRemove: (id: string) => void;
}

export function FeedRegistration({ sources, onAdd, onRemove }: Props) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');

  const handleAdd = () => {
    if (!url.trim() || !label.trim()) return;
    onAdd({ id: crypto.randomUUID(), url: url.trim(), label: label.trim() });
    setUrl('');
    setLabel('');
  };

  return (
    <section className="panel">
      <div className="panel-label">// FEED_REGISTRATION</div>
      <div className="row">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="名前（例：Zenn）"
        />
        <input
          className="input-wide"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="RSS URL"
        />
        <button onClick={handleAdd}>追加</button>
      </div>
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