全ての修正が完了しました。対応した問題をまとめます。

修正内容まとめ:

ファイル	問題	修正
FeedList.tsx	FilterBar の内容がそのままになっていて FeedList が存在しなかった	正しい FeedList コンポーネントを実装
useFeed.ts	fetch失敗時に loading が永久に true になる	try/catch/finally でエラーハンドリングを追加
useFeed.ts	IDがインデックスベースでフィード更新時にブックマークがずれる	guid → link → インデックスの順で安定したIDを生成
useFeed.ts	useEffect の依存配列に fetchAll が欠けている	useCallback で fetchAll をメモ化し依存配列を修正
App.tsx	JSON.parse が例外をスローしてアプリがクラッシュする	try/catch で保護してフォールバックに空配列を返す


TypeScript エラーも ESLint エラーも 0 です。全ての修正が完了しました。

今回修正した問題の全一覧:

ファイル	問題	修正
FeedList.tsx	FilterBar の内容が入っていて FeedList が存在しない	正しい FeedList を実装
App.tsx	import { FeedSource } — verbatimModuleSyntax 違反	import type に変更
App.tsx	localStorage.getItem の JSON.parse が例外をスローする可能性	try/catch で保護
FeedRegistration.tsx	import { FeedSource } — verbatimModuleSyntax 違反	import type に変更
FeedRegistration.tsx	Enter キーでフォームを送信できない	<form onSubmit> に変更
useFeed.ts	エラーハンドリングがなく fetch 失敗で loading が永遠に true	try/finally を追加
useFeed.ts	Promise.all — 1 つの失敗で全フィードが消える	Promise.allSettled に変更、失敗したフィードのみスキップ
useFeed.ts	HTTP 4xx/5xx をエラーとして検出しない	res.ok チェックを追加
useFeed.ts	XML パース失敗を検出しない	<parsererror> 要素チェックを追加
useFeed.ts	記事 ID がインデックスベースでブックマークがずれる	guid → link → インデックスの安定 ID に変更
useFeed.ts	useEffect の依存配列に fetchAll が欠けている	useCallback でメモ化して依存配列を修正
