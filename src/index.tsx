import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'
import {supabase} from './db/index.js'
import{html} from 'hono/html'
const app = new Hono()
app.get('/', async(c) => {
  const q = c.req.query('q') ?? ''  
  let query=supabase.from('subject').select('class_name').order('created_at', { ascending: false });
  if(q){
    query=query.ilike('class_name',`%${q}%`);
  }
  
  const{data:courses,error}=await query; 
    if(error){
    console.error("読み取り失敗!!14行目");
    return c.text("読み取り失敗！！"+error.message);
  }
  return c.html(
    <Layout title="ホーム">
      <h1>ようこそ、Reviewerへ</h1>
      <form class="search-card" method="get" action="/">
       <div class="search-group">
        <label for="search">検索欄</label>
        <input type="search" id="search" name="q" value={q} class="search-control" placeholder="授業名" />
        <ul id="suggest-list" class="suggest-list"></ul>
       </div>
       <button type="submit" class="btn">検索する</button>
      </form>
      
      <form class="choice" mthod="get" action="/">
      <div>
        <label></label>
        <input></input>
        <ul></ul>
      </div>
      <button></button>
      </form>
      <p>下のボタンをクリックして！！！！！レビュー一覧を見て！！</p>
      <p><a href="/reviews">すべての授業を見に行く</a></p>
      <p><a href="/registration"></a></p>
      {html`
        <script>
const input = document.getElementById('search');
const list = document.getElementById('suggest-list');
let timer;                                    

input.addEventListener('input', () => {       
     clearTimeout(timer);
     timer = setTimeout(async () => {
          const q = input.value;
          if (q === '') {
               list.innerHTML = '';
               return;
          }
          const res = await fetch('/api/suggest?q=' + encodeURIComponent(q));
          const data = await res.json();
          list.innerHTML = data.map(item => '<li>' + item.class_name + '</li>').join('');
     }, 250);
     
});
list.addEventListener('click',(e)=>{
     input.value=e.target.textContent;
     list.innerHTML='';
})
        </script>
      `}
    </Layout>
  )//レビュー一覧で/reviewsに、新しいレビューを登録でapp.getの/registrationに飛ぶ
});
app.get('/api/suggest',async(c)=>{//検索のときにサジェストが出るようにするため、サーバーから情報をとってきている
  const query=c.req.query('q');
  if(!query){
    return c.json([]);
  }
  const {data:search,error}=await supabase.from('subject').select('class_name').ilike('class_name',`${query}%`).limit(10);
  if(error){
    console.error('サジェスト取得失敗:', error);
    return c.text('取得に失敗しました: ' + error.message, 500);
  };
  return c.json(search??[]);
})

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
  return c.redirect('/');
}); //新しい投稿の登録の処理

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く
