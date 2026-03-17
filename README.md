# Comet RSS

自分と限られた友人だけが使うパーソナルRSSリーダー。
興味ある分野のニュースを一箇所にまとめて表示し、海外記事の日本語翻訳・AI要約機能を備えた軽量フルスタックアプリ。

---

## 主な機能

- RSSフィードの登録・削除
- カテゴリ・タグによるフィルタリング
- ブックマーク管理（独立DB）
- AI要約（OpenAI）
- 英語記事の日本語翻訳
- Google認証によるログイン

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React / TypeScript / Vite |
| バックエンド | Node.js / Express |
| DB | PostgreSQL（Neon） |
| フロントデプロイ | Netlify |
| バックデプロイ | Railway |
| 認証 | Google OAuth 2.0 |
| AI要約 | OpenAI API（gpt-4o-mini） |
| 翻訳 | MyMemory API |
| バージョン管理 | GitHub |

---

## アーキテクチャ

```
ブラウザ（React / TypeScript / Vite）
  ↓ HTTPS
Netlify（静的ファイル配信）
  ↓ fetch + Cookie
Railway（Express / Node.js）
  ├── PostgreSQL（Neon）    ← データ永続化
  ├── OpenAI API            ← AI要約
  ├── MyMemory API          ← 翻訳
  └── Google OAuth          ← 認証
```

---

## 技術選定の理由

### Google OAuth
ユーザーが自分と友人の2人のみで、両者ともGoogleアカウントを保有しているため。自前でパスワード管理・セキュリティ実装をするコストを省き、Googleに委託することで開発をシンプルに保てる。

### JWT（セッションDB不使用）
少人数の信頼できるユーザーのみが使用する構成のため、即時ログアウト強制が不要。DBへの確認コストを省いてシンプルに保てるJWTを採用。

### MyMemory API
無料かつAPIキー不要で使えるため。翻訳機能はコアな機能ではないので、コストをかけずシンプルに実装したかった。

---

## セットアップ

### 使う人向け

1. https://rss-reader-app.netlify.app にアクセス
2. 「Googleでログイン」をクリック
3. 許可されたGoogleアカウントでログイン

> ⚠️ 利用にはALLOWED_EMAILSへの登録が必要です。

### 開発者向け（ローカル起動）

```bash
# 1. クローン
git clone https://github.com/Sair-xX/rss-reader

# 2. フォルダに入る
cd rss-reader

# 3. 依存パッケージをインストール
npm install

# 4. 環境変数を設定
cp .env.example .env
# .envを編集して各値を入力

# 5. 起動
npm run dev
```

**.env に必要な値**

```
DATABASE_URL=        # NeonのDB接続URL
SESSION_SECRET=      # JWTの署名に使う秘密鍵
COOKIE_NAME=         # Cookieの名前
FRONTEND_ORIGIN=     # NetlifyのURL（CORS許可用）
OPENAI_API_KEY=      # AI要約用
ALLOWED_EMAILS=      # ログイン許可するメールアドレス
```

---

## 今後の展望

- MCP連携：ブックマークした記事の要約をNotionに自動投稿する

---

## FAQ

**Q. なぜセッションをDBに保存せずJWTを使っているのですか？**

少人数の信頼できるユーザーのみが使用することを目的としているので、トークンに記載されている期限まで必ず使えるとしても問題ないと判断した。DBへの確認コストを省いてシンプルに保てるJWTを採用。

---

**Q. なぜ認証にGoogle OAuthを使っているのですか？**

少人数構成で、全員がGoogleアカウントを持っているため認証方法をGoogleに限定しても問題なかった。今後は他の認証方法も追加したい。

---

**Q. 記事データをDBに保存せず毎回RSSサーバーから取得しているのはなぜですか？**

記事をDBに保存すると日々増え続けて容量が重くなるため、ブックマーク以外は永続保存しない構成にしている。

---

**Q. CookieとlocalStorageはどう使い分けていますか？**

悪用されたら困るもの（JWTトークンなど）はCookie（HttpOnly）に、悪用されても困らないもの（UI設定など）はlocalStorageに保存する方針。

---

**Q. なぜMyMemory APIを翻訳に使っているのですか？**

無料かつAPIキー不要で使えるため。翻訳機能はコアな機能ではないので、コストをかけずシンプルに実装したかった。
