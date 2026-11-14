# 単位の地図

岐阜大学の学生向けの、非公式の授業レビューサイト。授業を検索し、レビュー（評価点・出席・感想）を読み書きできる。

- サーバー：Hono（JSX でサーバー側レンダリング）＋ Cloudflare Workers
- DB・認証：Supabase（大学メール宛のワンタイムコードでログイン）

## 動かし方

```
npm install
npm run dev
```

http://localhost:8787 を開く。

### 環境変数（`.dev.vars`）

手元で動かすときは `.dev.vars` に書く。

```
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

`.dev.vars` は Git に含めない（`.gitignore` 済み）。
本番の環境変数は Cloudflare に登録する（`npx wrangler secret put SUPABASE_URL` など）。

## スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発用サーバー（`wrangler dev`。変更を自動で読み込む） |
| `npm run deploy` | Cloudflare Workers に公開（`wrangler deploy`） |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |

## ファイル構成

```
wrangler.toml        Cloudflare Workers の設定（名前・定期実行の時刻など）
src/
  index.tsx          ルートをまとめて Workers に渡す（定期アクセスの処理もここ）
  routes/            画面ごとのルート（home / subjects / reviews / reports / auth / pages）
  components/        Layout・エラー画面・パンくず・タグ選択などの部品と CSS
  constants.ts       タグ・学部学科・選択肢・通報理由などの一覧（フォームと入力チェックで共用）
  auth.ts            ログイン中のユーザーを取得
  db/                Supabase クライアント（index.ts＝読み取り用、server.ts＝Cookie連携のログイン用）
```
