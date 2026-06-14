import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <Layout title="ホーム">
      <h1>ようこそ、Reviewerへ</h1>
      <p>ここは、あなたのレビューを管理するためのサイトです。</p>
      <p>下のボタンをクリックして、レビュー一覧を見てみましょう。</p>
      <p><a href="/reviews">レビュー一覧へ</a></p> //reviewersのAPIを呼び出すためのリンク
    </Layout>
  )
})

app.get // '/reviews' にアクセスしたときの処理を追加

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く
