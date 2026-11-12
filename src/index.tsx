import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import home from './routes/home.js'
import subjects from './routes/subjects.js'
import reviews from './routes/reviews.js'
import reports from './routes/reports.js'
import auth from './routes/auth.js'
import pages from './routes/pages.js'
const app = new Hono()

app.use("*",csrf());//CSRF対策。状態を変えるPOSTはOrigin/Refererを検証する

app.route("/",home);//授業を探す（ホーム・すべての授業・サジェスト）
app.route("/",subjects);//授業の詳細と、授業の登録
app.route("/",reviews);//レビューを書く・編集・保存・削除
app.route("/",reports);//通報
app.route("/",auth);//ログイン・ログアウト
app.route("/",pages);//お問い合わせ・プライバシーポリシー・ヘルプ・お礼のページ

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く