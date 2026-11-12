# 単位の地図

岐阜大学の学生向けの、非公式の授業レビューサイト。授業を検索し、レビュー（評価点・出席・感想）を読み書きできる。

- サーバー：Hono（JSX でサーバー側レンダリング）＋ Node.js
- DB・認証：Supabase（大学メール宛のワンタイムコードでログイン）

## 動かし方

```
npm install
npm run dev
```

http://localhost:3000 を開く。

### 環境変数（`.env`）

```
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

`.env` は Git に含めない（`.gitignore` 済み）。

### DB関数の登録（初回のみ）

## スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発用サーバー（変更を自動で読み込む） |
| `npm run build` | `dist/` にビルド |
| `npm start` | ビルド済みのサーバーを起動（環境変数は実行環境側で設定する） |

## ファイル構成

```
src/
  index.tsx          ルートをまとめてサーバーを起動
  routes/            画面ごとのルート（home / subjects / reviews / reports / auth / pages）
  components/        Layout・エラー画面・パンくず・タグ選択などの部品と CSS
  constants.ts       タグ・学部学科・選択肢・通報理由などの一覧（フォームと入力チェックで共用）
  auth.ts            ログイン中のユーザーを取得
  db/                Supabase クライアント（index.ts＝読み取り用、server.ts＝Cookie連携のログイン用）
supabase/            DB に登録する SQL
```
