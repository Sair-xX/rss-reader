全ての修正が完了しました。対応した問題をまとめます。

修正内容まとめ:

ファイル	問題	修正
FeedList.tsx	FilterBar の内容がそのままになっていて FeedList が存在しなかった	正しい FeedList コンポーネントを実装
useFeed.ts	fetch失敗時に loading が永久に true になる	try/catch/finally でエラーハンドリングを追加
useFeed.ts	IDがインデックスベースでフィード更新時にブックマークがずれる	guid → link → インデックスの順で安定したIDを生成
useFeed.ts	useEffect の依存配列に fetchAll が欠けている	useCallback で fetchAll をメモ化し依存配列を修正
App.tsx	JSON.parse が例外をスローしてアプリがクラッシュする	try/catch で保護してフォールバックに空配列を返す
