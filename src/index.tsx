import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'
import { ReviewList } from './components/Reviewlist.js'
import {supabase} from './db/index.js'
const app = new Hono()
  export const Data:{review:string;teacher:string;score:string}[]=[]

app.get('/', (c) => {
  return c.html(
    <Layout title="ホーム">
      <h1>ようこそ、Reviewerへ</h1>
      <p>ここは、あなたのレビューを管理するためのサイトです。</p>
      <p>下のボタンをクリックして、レビュー一覧を見てみましょう。</p>
      <p><a href="/reviews">レビュー一覧へ</a></p>
      <p><a href="/registration">新しいレビューを登録</a></p>
    </Layout>
  )//レビュー一覧で/reviewsに、新しいレビューを登録でapp.getの/registrationに飛ぶ
});

app.get('/registration',(c)=>{
  return c.html(
    <Layout title="レビュー登録">
      <h1>レビュー登録</h1>
      <form class="form-card" method="post" action="/registration">
        <div class="form-group">
          <label for="review">レビュー内容</label>
          <textarea id="review" name="review" class="form-control" placeholder="授業の感想を入力してください"></textarea>
        </div>
        <div class="form-group">
          <label for="instructor">講師名</label>
          <input type="text" id="instructor" name="instructor" class="form-control" placeholder="例：山田太郎" />
        </div>
        <div class="form-group">
          <label for="score">評価点数</label>
          <select id="score" name="score" class="form-control">
            <option value="5">★★★★★ 5</option>
            <option value="4">★★★★ 4</option>
            <option value="3">★★★ 3</option>
            <option value="2">★★ 2</option>
            <option value="1">★ 1</option>
          </select>
        </div>
        <button type="submit" class="btn">登録する</button>
      </form>
    </Layout>
  )
});
app.get('/reviews', (c) => {
  return c.html(
    <Layout title="レビュー一覧">
      <ReviewList />
    </Layout>
  )
})//いずれDBからデータをとってきて表示。動作のテスト用。本番環境までにはリニューアルするか削除すること。

app.post('/registration', async (c) => {
  const body=await c.req.parseBody();//飛んできた入力内容をばらばらにする。それぞれの要素はHTMLのnameで指定された名前と一対一に対応
  await supabase.from('review').insert({comment:body.review as string,score:body.score});
}) //新しい投稿の登録の処理

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く
