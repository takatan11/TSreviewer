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
  let courseQuery=supabase
  .from('subject')
  .select('class_name,faculty,depart')
  .order('created_at', { ascending: false });

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
      <section class="home-hero">
        <h1 class="home-title">授業を探す</h1>
        <form class="search-card" method="get" action="/">
          <div class="search-row">
            <div class="search-group">
              <input type="search" id="search" name="q" value={keyword} class="search-control search-input" placeholder="授業名で検索" autocomplete="off" />
              <ul id="suggest-list" class="suggest-list"></ul>
            </div>
            <button type="submit" class="btn">検索</button>
          </div>
          <div class="filter-row">
            <select id="faculty-select" class="search-control" name="faculty">
              <option value="" disabled selected hidden>学部を選択</option>
              <option value="工学部">工学部</option>
              <option value="教育学部">教育学部</option>
              <option value="応用生物学部">応用生物学部</option>
              <option value="農学部">農学部</option>
              <option value="医学部">医学部</option>
            </select>
            <select id='department-select' class="search-control" name="department">
              <option value="" disabled selected hidden>学科を選択</option>
              <option value="電気電子・情報工学科">電気電子・情報工学科</option>
              <option value="応用生物学科">応用生物学科</option>
              <option value="機械工学科">機械工学科</option>
              <option value="医学科">医学科</option>
            </select>
            <button type='button' id='show-all'>すべての授業</button>
          </div>
        </form>
      </section>

      <div id='class-list' class='course-list'></div>
      {(keyword || faculty || department) && (
        courses && courses.length > 0 ? (
          <div class="course-list">
            {courses.map((course) => (
              <a href={`/subject/${encodeURIComponent(course.class_name)}`} class="course-card">
                <div class="thumb">
                  <div class="thumb-title">{course.class_name}</div>
                  <div class="thumb-meta">{[course.faculty, course.depart].filter(Boolean).join(' · ')}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p class="empty-note">該当する授業が見つかりませんでした。</p>
        )
      )}
      {html`
        <script>
const input = document.getElementById('search');
const list = document.getElementById('suggest-list');
const getall=document.getElementById('show-all');
const listBox=document.getElementById('class-list');
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

getall.addEventListener('click',async (e)=>{
  const res=await fetch('/allclass');
  const courses=await res.json();
  listBox.innerHTML=courses.map(course=>{
    const meta=[course.faculty,course.depart].filter(Boolean).join(' · ');
    return '<a class="course-card" href="/subject/'+encodeURIComponent(course.class_name)+'">'
      +'<div class="thumb"><div class="thumb-title">'+course.class_name+'</div>'
      +'<div class="thumb-meta">'+meta+'</div></div>'
      +'</a>';
  }).join('')
})
        </script>

      `}
    </Layout>
  )//レビュー一覧で/reviewsに、新しいレビューを登録でapp.getの/registrationに飛ぶ
});//最初に出すページ。URLなどが付いたボタンも設置されている。水色の部分はページ上に
   //配置されているボタンが押されたときに何が起きるのかaddEventLiisterで定義している


app.get('/allclass',async(c)=>{
  const {data:allClass,error:classError}=await supabase
  .from('subject')
  .select('class_name,faculty,depart');

  if(classError){
    console.error('サジェスト取得失敗:', classError);
    return c.text('取得に失敗しました: ' + classError.message, 500);
  };

  return c.json(allClass??[]);
})//すべての授業を表示させるとき画面下部にカードが出る


app.get('/api/suggest',async(c)=>{//検索のときにサジェストが出るようにするため、サーバーから情報をとってきている
  const keyword=c.req.query('q');
  if(!keyword){
    return c.json([]);
  }
  const {data:suggestions,error:suggestError}=await supabase
  .from('subject')
  .select('class_name')
  .ilike('class_name',`${keyword}%`)
  .limit(10);
  if(suggestError){
    console.error('サジェスト取得失敗:', suggestError);
    return c.text('取得に失敗しました: ' + suggestError.message, 500);
  };
  return c.json(suggestions??[]);
})


app.get('/subject/:name',async(c)=>{
  const name = c.req.param('name') //URLの:nameの部分を取り出してname変数に入れている
  const { data: subject, error } = await supabase
    .from('subject')
    .select('*')
    .eq('class_name', name)
    .single();
  if (error || !subject) return c.text('授業が見つかりません', 404)

  // 開講コマ（複数）を取得
  const { data: slots } = await supabase
    .from('subject_slot')
    .select('day, period')
    .eq('subject_id', subject.id);

  // レビュー（新しい順）を取得。subject_id 未整備でも落ちないよう別クエリに分離
  const { data: reviews } = await supabase
    .from('review')
    .select('comment, score, created_at')
    .eq('subject_id', subject.id)
    .order('created_at', { ascending: false });

  const slotList = slots ?? [];
  const reviewList = reviews ?? [];

  return c.html(
    <Layout title={subject.class_name}>
      <p class="back-link"><a href="/">← ホームに戻る</a></p>

      <div class="subject-detail">
        <h1>{subject.class_name}</h1>
        <div class="detail-meta">
          {subject.faculty  && <span class="badge">{subject.faculty}</span>}
          {subject.depart   && <span class="badge">{subject.depart}</span>}
          {subject.semester && <span class="badge">{subject.semester}</span>}
          {subject.point    && <span class="badge">{subject.point}単位</span>}
        </div>
      </div>

      <section class="detail-section">
        <h2>授業概要</h2>
        <p class="detail-text">{subject.class_about || '概要は登録されていません。'}</p>
      </section>

      <section class="detail-section">
        <h2>開講コマ</h2>
        {slotList.length > 0 ? (
          <ul class="slot-list">
            {slotList.map((slot) => (
              <li class="slot-item">{slot.day} {slot.period}限</li>
            ))}
          </ul>
        ) : (
          <p class="detail-text">開講コマは登録されていません。</p>
        )}
      </section>

      <section class="detail-section">
        <h2>レビュー（{reviewList.length}件）</h2>
        {reviewList.length > 0 ? (
          <div class="review-list">
            {reviewList.map((review) => (
              <div class="review-item">
                <div class="review-score">
                  {'★'.repeat(Number(review.score) || 0)}
                  <span class="review-score-num">{review.score}</span>
                </div>
                <p class="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p class="detail-text">まだレビューがありません。<a href="/registration">最初のレビューを書く</a></p>
        )}
      </section>
    </Layout>
  )
})//検索したカードをクリックしたときの授業詳細ページ。概要・開講コマ・レビュー一覧を表示


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
          <label for="about">授業概要</label>
          <input type='text' id="class_about" name='class_about' placeholder='概要を入力してください'></input>
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
              <option value="1">1限</option>
              <option value="2">2限</option>
              <option value="3">3限</option>
              <option value="4">4限</option>
              <option value="5">5限</option>
              <option value="6">6限</option>   
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
              <option>1</option>
              <option>2</option>
            </select>
        </div>

        <button type='submit' class="button">登録</button>
      </form>
    </Layout>
  )
})//新しい授業の登録用のHTMLページを返す。formでapp.post('new-class')に入力を送り、登録作業を行う


app.post('/new-class', async (c) => {
  const body = await c.req.parseBody();

  const { data: subject, error: subjectError }=await supabase
    .from('subject')
    .insert({
      class_name: body.class_name as string,
      semester: body.semester   as string,
      faculty:    body.faculty    as string,
      depart:     body.depart     as string,
      class_about:body.class_about as string,
      point:body.point as string
    })
    .select()
    .single();

  if (subjectError || !subject) {
    console.error('授業の登録に失敗', subjectError);
    return c.text('授業の登録に失敗しました: ' + subjectError?.message, 500);
  }

  // ② 子テーブル subject_slot に、①の id を subject_id として保存
  const { error: slotError } = await supabase
    .from('subject_slot')
    .insert({
      subject_id: subject.id,          
      day:        body.days as string,
      period:     Number(body.period), 
    });

  if (slotError) {
    console.error('コマの登録に失敗', slotError);
    return c.text('コマの登録に失敗しました: ' + slotError.message, 500);
  }

  return c.redirect('/appriciate');
});//授業(subject)と時限(subject_slot)の2テーブルに分けて保存


app.get('/appriciate',(c)=>{
  return c.html(
    <Layout title="ありがとうございました">
      <div class="notice">
        <h1>協力ありがとうございました！</h1>
        <p><a href='/' class="btn">ホームに戻る</a></p>
      </div>
    </Layout>
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
