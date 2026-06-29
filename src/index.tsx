import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'
import { ReviewList } from './components/Reviewlist.js'
import {supabase} from './db/index.js'
const app = new Hono()
app.get('/', (c) => {
  const q = c.req.query('q') ?? ''   // URLの ?q=... を読む（未入力なら空文字）
  return c.html(
    <Layout title="ホーム">
      <h1>ようこそ、Reviewerへ</h1>
      <p>検索欄</p>
      <form class="search-card" method="get" action="/">
       <div class="search-group">
        <label for="search">検索欄</label>
        <input type="search" id="search" name="q" value={q} class="search-control" placeholder="授業名" />
       </div>
       <button type="submit" class="btn">検索する</button>
      </form>
      <p>下のボタンをクリックして、レビュー一覧を見てみましょう。</p>
      <p><a href="/reviews">レビュー一覧へ</a></p>
      <p><a href="/registration">新しいレビューを登録</a></p>
    </Layout>
  )//レビュー一覧で/reviewsに、新しいレビューを登録でapp.getの/registrationに飛ぶ
  let query=supabase.from('subject').select('class_name').order('created_at', { ascending: false });
  if(q){
    query=query.ilike('class_name',`%${q}%`);
  }
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

app.post('/registration', async (c) => {
  const body = await c.req.parseBody();
  const { data, error } = await supabase
    .from('review')
    .insert({ comment: body.review as string, score: body.score })
    .select();              // 挿入した行を返してもらう（成功確認用）

  if (error) {
    console.error('insert失敗:', error);   // ← ターミナルに原因が出る
    return c.text('保存に失敗しました: ' + error.message, 500);
  }
  console.log('insert成功:', data);
  return c.redirect('/reviews');
}); //新しい投稿の登録の処理

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く
