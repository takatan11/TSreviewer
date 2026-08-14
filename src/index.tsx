import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'
import {supabase} from './db/index.js'
import{html} from 'hono/html'
const app = new Hono()
app.get('/', async(c) => {
  const keyword = c.req.query('q') ?? ''  ;
  const faculty=c.req.query('faculty') ?? '';
  const department=c.req.query('department') ?? '';
  let courseQuery=supabase.from('subject').select('class_name,faculty,depart').order('created_at', { ascending: false });
  if(keyword){
    courseQuery=courseQuery.ilike('class_name',`%${keyword}%`);//検索用
  }
  if(faculty){
    courseQuery = courseQuery.eq('faculty', faculty);//学部検索
  }
  if(department){
    courseQuery=courseQuery.eq('depart',department);//学科検索
  }
  const{data:courses,error:readError}=await courseQuery;
    if(readError){
    console.error("読み取り失敗!!");
    return c.text("読み取り失敗！！"+readError.message);//エラー処理
  }
   console.log(courses)//確認のログ出力
  return c.html(
    <Layout title="ホーム">
      <h1>ようこそ</h1>
      <form class="search-card" method="get" action="/">
       <div class="search-group">
        <label for="search">検索欄</label>
        <input type="search" id="search" name="q" value={keyword} class="search-control" placeholder="授業名" />
        <ul id="suggest-list" class="suggest-list"></ul>
       </div>
        <div class="search-group">
          <label for="faculty-select">学部</label>
          <select id="faculty-select" class="search-control" name="faculty">
            <option value="" disabled selected hidden>学部名</option>
            <option value="工学部">工学部</option>
            <option value="教育学部">教育学部</option>
            <option value="応用生物学部">応用生物学部</option>
            <option value="農学部">農学部</option>
            <option value="医学部">医学部</option>
          </select>
        
          <label for="department-select">学科</label>
          <select id='department-select' class="search-control" name="department">
            <option value="" disabled selected hidden>学科名</option>
            <option value="電気電子・情報工学科">電気電子・情報工学科</option>
            <option value="応用生物学科">応用生物学科</option>
            <option value="機械工学科">機械工学科</option>
            <option value="医学科">医学科</option>
          </select>
        </div>
        <button type="submit" class="btn">検索する</button>
      </form>
      {(keyword || faculty || department) && (
        <div class="course-list">
          {courses?.map((course) => (
            <a href={`/subject/${encodeURIComponent(course.class_name)}`} class="course-card">
              {course.class_name}
            </a>
          ))}
        </div>
      )}
      <p>下のボタンをクリックしてレビュー一覧をチェック</p>
      <p><a href="/reviews">すべての授業を見に行く</a></p>
      <p><a href="/registration">コメントの追加</a></p>
      <p><a href="/new-class">新しい授業の登録</a></p>
      {html`
        <script>
const input = document.getElementById('search');
const list = document.getElementById('suggest-list');
let timer;

input.addEventListener('input', () => {
     clearTimeout(timer);
     timer = setTimeout(async () => {
          const keyword = input.value;
          if (keyword === '') {
               list.innerHTML = '';
               return;
          }
          const res = await fetch('/api/suggest?q=' + encodeURIComponent(keyword));
          const suggestions = await res.json();
          list.innerHTML = suggestions.map(suggestion => '<li>' + suggestion.class_name + '</li>').join('');
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
});//最初に出すページ。URLなどが付いたボタンも設置されている


app.get('/reviews',async(c)=>{
  return c.html(
    <h1>ここに全授業のカードを表示</h1>
  )
})

app.get('/api/suggest',async(c)=>{//検索のときにサジェストが出るようにするため、サーバーから情報をとってきている
  const keyword=c.req.query('q');
  if(!keyword){
    return c.json([]);
  }
  const {data:suggestions,error:suggestError}=await supabase.from('subject').select('class_name').ilike('class_name',`${keyword}%`).limit(10);
  if(suggestError){
    console.error('サジェスト取得失敗:', suggestError);
    return c.text('取得に失敗しました: ' + suggestError.message, 500);
  };
  return c.json(suggestions??[]);
})


app.get('/subject/:name',async(c)=>{
  const name = c.req.param('name')
  const { data: subject, error } = await supabase
    .from('subject').select('*').eq('class_name', name).single()
  if (error || !subject) return c.text('授業が見つかりません', 404)
  return c.html(<Layout title={subject.class_name}> ... </Layout>)
})//検索した後表示されるカードをクリックしたときに表示されるページの定義。まだ制作中


app.get('/new-class',(c)=>{
  return c.html(
    <Layout title='新しい授業の登録'>
      <h1>新しく授業を登録する</h1>
      <form class="new-class" method="post" action="/new-class">
        <div class="new-class">
          <label for="class">授業名</label>
            <input type="text" id="class-name" name="class_name" class="form-control" placeholder='授業名を入力してください'></input>
        </div>
        <div>
          <label for="semester">開講時期</label>
            <select id='semester' name='semester'>
              <option>前期</option>
              <option>後期</option>
              <option>通年</option>
            </select>
        </div>
        <div>
          <label for="period">時限</label>
            <select id="period" name='period'>
              <option>1限</option>
              <option>2限</option>
              <option>3限</option>
              <option>4限</option>
              <option>5限</option>
              <option>6限</option>   
            </select>    
        </div>
        <div>
          <label for="faculty">学部</label>
            <select id='faculty' name='faculty'>
                <option>工学部</option>
                <option>教育学部</option>
                <option>応用生物学部</option>
                <option>獣医学部</option>
                <option>医学部</option>
            </select>
        </div>
        <div>
          <label for="depart">学科</label>
           <select id='depart' name='depart'>
              <option>電気電子・情報工学科</option>
              <option>教育学科</option>
              <option>ほかの学科後で入れる</option>
           </select>
        </div>
        <div>
          <label for="days">曜日</label>
            <select id='days' name='days'>
              <option>月曜日</option>
              <option>火曜日</option>
              <option>水曜日</option>
              <option>木曜日</option>
              <option>金曜日</option>
              <option>特別日程</option>
            </select>
        </div>

        <div>
          <label for="point">単位数</label>
            <select id='point' name='point'>
              <option>0.5</option>
              <option>1</option>
              <option>2</option>
              <option>カスタム</option>
            </select>
        </div>

        <div>
          <label for='judge'>評価点</label>
           <select id='judge' name='judge'>
            <option value="5">★★★★★ 5</option>
            <option value="4">★★★★ 4</option>
            <option value="3">★★★ 3</option>
            <option value="2">★★ 2</option>
            <option value="1">★ 1</option>
           </select>
        </div>

        <button type='submit' class="button">登録</button>
      </form>
    </Layout>
  )
})//新しい授業の登録用のHTMLページを返す。formでapp.post('new-class')に入力を送り、登録作業を行う
app.post('/new-class', async(c)=>{
  const body= await c.req.parseBody();
  const {data:insertReview,error:insertError} =await supabase
  .from('subject')
  .insert({
    class_name:body.class as string,class_year:body.semester,
    period:body.period,faculty:body.faculty,depart:body.depart,
    days:body.days,point:body.point
  }) //カラム名をとってきて、それに対応した入力内容を保存
  .select();

  if(insertError){
    console.log('登録に失敗しました',insertError);
    return c.text('登録に失敗しました'+insertError.message,500);
  }
  console.log('登録に成功しました',insertReview);
  return c.redirect('/appriciate');
});//一旦完成か

app.get('/appriciate',(c)=>{
  return c.html(
    <p><a href='/'>ホーム画面へ戻る</a></p>
  )
})//登録のお礼が出る画面



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
  )//コメントを入力するページ
});


app.post('/registration', async (c) => {
  const body = await c.req.parseBody();
  const { data: insertedReview, error: insertError } = await supabase
    .from('review')
    .insert({ comment: body.review as string, score: body.score })
    .select();              // 挿入した行を返してもらう

  if (insertError) {
    console.error('insert失敗:', insertError);
    return c.text('保存に失敗しました: ' + insertError.message, 500);
  }
  console.log('insert成功:', insertedReview);
  return c.redirect('/');
}); //新しい投稿の登録の処理。入力された内容をデータベースに登録   入力してもらった


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く
