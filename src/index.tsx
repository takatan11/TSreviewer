import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Layout } from './components/Layout.js'
import {supabase} from './db/index.js'
import{html} from 'hono/html'
import { csrf } from 'hono/csrf'
import{createClientForRequest} from './db/server.js'
const app = new Hono()

const ALLOWED_TAGS = [
  "面白い", "つまらない", "楽単", "普通", "難しい",
  "先生優しい", "先生厳しい", "出席なし", "出席あり",
  "課題多い", "課題なし", "テストなし", "テストのみ",
  "レポートのみ", "必修",
] as const  //タグの管理をまとめている。

// 通報理由の定型リスト。通報フォームの<option>と、POST /report の許可リスト照合の両方でこの配列を使う
const ALLOWED_REPORT_REASONS = [
  "誹謗中傷", "個人情報", "虚偽の情報", "スパム", "その他",
] as const

// ★★★ 要差し替え：専用Gmailを取得したら、このアドレスを実アドレスに変える（ここ1か所だけ）★★★
const CONTACT_EMAIL = "your-contact-address@gmail.com"

// CSRF対策: 状態を変えるPOSTはOrigin/Refererを検証する
app.use('*', csrf())

async function getCurrentUser(c: any) {
  const { data } = await createClientForRequest(c).auth.getUser()
  return data.user
}

app.get('/', async(c) => {
  const user = await getCurrentUser(c)
  const keyword = c.req.query('q') ?? ''  ;
  const faculty=c.req.query('faculty') ?? '';
  const department=c.req.query('department') ?? '';
  const selectedTags=c.req.queries('tags')??[];
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
  if(selectedTags.length){
    courseQuery=courseQuery.contains('tags',selectedTags);
  }
  const{data:courses,error:readError}=await courseQuery;
    if(readError){
    console.error("読み取り失敗!!", readError);
    return c.text("読み取りに失敗しました。時間をおいて再度お試しください。", 500);//エラー処理
  }
  return c.html(
    <Layout title="ホーム" user={user}>
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
              <option value="全学共通">全学共通</option>
            </select>
            <select id='department-select' class="search-control" name="department">
              <option value="" disabled selected hidden>学科を選択</option>
              <option value="電気電子・情報工学科">電気電子・情報工学科</option>
              <option value="応用生物学科">応用生物学科</option>
              <option value="機械工学科">機械工学科</option>
              <option value="医学科">医学科</option>
              <option value="全学共通">全学共通</option>
            </select>
            <button type='button' id='show-all'>すべての授業</button>
          </div>
          <div class="tag-field">
            <span class="tag-field-label">タグで絞り込み（選んだタグを全部持つ授業）</span>
            <div class="tag-group">
              {ALLOWED_TAGS.map((tag) => (
                <label class="tag-chip"><input type="checkbox" name="tags" value={tag} checked={selectedTags.includes(tag)} /><span>{tag}</span></label>
              ))}
            </div>
          </div>
        </form>
      </section>

      <div id='class-list' class='course-list'></div>
      {(keyword || faculty || department||selectedTags.length>0) && (
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
          list.replaceChildren();
          for (const suggestion of suggestions) {
               const li = document.createElement('li');
               li.textContent = suggestion.class_name;
               list.appendChild(li);
          }
     }, 250);

});
list.addEventListener('click',(e)=>{
     input.value=e.target.textContent;
     list.innerHTML='';
})

getall.addEventListener('click',async (e)=>{
  const res=await fetch('/allclass');
  const courses=await res.json();
  listBox.replaceChildren();
  for (const course of courses) {
    const meta=[course.faculty,course.depart].filter(Boolean).join(' · ');
    const a=document.createElement('a');
    a.className='course-card';
    a.href='/subject/'+encodeURIComponent(course.class_name);
    const thumb=document.createElement('div');
    thumb.className='thumb';
    const title=document.createElement('div');
    title.className='thumb-title';
    title.textContent=course.class_name;
    const metaEl=document.createElement('div');
    metaEl.className='thumb-meta';
    metaEl.textContent=meta;
    thumb.appendChild(title);
    thumb.appendChild(metaEl);
    a.appendChild(thumb);
    listBox.appendChild(a);
  }
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
    console.error('授業一覧の取得失敗:', classError);
    return c.text('取得に失敗しました。時間をおいて再度お試しください。', 500);
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
    return c.text('取得に失敗しました。時間をおいて再度お試しください。', 500);
  };
  return c.json(suggestions??[]);
})


app.get('/subject/:name',async(c)=>{
  const user = await getCurrentUser(c)
  const name = c.req.param('name') //URLの:nameの部分を取り出してname変数に入れている
  const sort = c.req.query('sort') ?? 'newest';
  const SORT_OPTIONS: Record<string, { column: string; ascending: boolean }> = {
  newest:     { column: "created_at", ascending: false }, // 新着順
  oldest:     { column: "created_at", ascending: true },  // 古い順
  score_high: { column: "score",      ascending: false }, // 評価が高い順
  score_low:  { column: "score",      ascending: true },  // 評価が低い順
}
  // sort が4キー以外（URL改変など）なら newest に倒す
  const sortOption = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;
  const { data: subjects, error } = await supabase
    .from('subject')
    .select('*')
    .eq('class_name', name)
    .order('created_at', { ascending: true })
    .limit(1);
  const subject = subjects?.[0];
  if (error || !subject) return c.text('授業が見つかりません', 404)

  const [{data:slots},{data:reviews}]=await Promise.all([
    supabase.from('subject_slot')
            .select('day,period')
            .eq('subject_id', subject.id,),

    supabase.from('review')
            .select('comment, score, created_at, id, user_id')
            .eq('subject_id', subject.id)
            .order(sortOption.column, { ascending: sortOption.ascending }),
]);

  const slotList = slots ?? [];
  const reviewList = reviews ?? [];
  // レビューが0件なら平均なし(null)、1件以上なら score の平均
  const avgScore = reviewList.length === 0
    ? null
    : reviewList.reduce((acc, r) => acc + (Number(r.score) || 0), 0) / reviewList.length;

  return c.html(
    <Layout title={subject.class_name} user={user}>
      <p class="back-link"><a href="/">← ホームに戻る</a></p>

      <div class="subject-detail">
        <h1>{subject.class_name}</h1>
        <div class="detail-meta">
          {subject.faculty  && <span class="badge">{subject.faculty}</span>}
          {subject.depart   && <span class="badge">{subject.depart}</span>}
          {subject.semester && <span class="badge">{subject.semester}</span>}
          {subject.point    && <span class="badge">{subject.point}単位</span>}
        </div>
        {avgScore === null ? (
          <p class="rating-empty">まだ評価がありません</p>
        ) : (
          <div class="rating-summary">
            <span class="rating-score">{avgScore.toFixed(1)}</span>
            <span class="rating-stars">{'★'.repeat(Math.round(avgScore))}{'☆'.repeat(5 - Math.round(avgScore))}</span>
            <span class="rating-count">{reviewList.length}件のレビュー</span>
          </div>
        )}
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
        <div class="detail-section-head">
          <h2>レビュー（{reviewList.length}件）</h2>
          <div class="head-controls">
            <form method='get' action={`/subject/${encodeURIComponent(subject.class_name)}`}>
              <select name="sort" class="sort-select" onchange="this.form.submit()">
                <option value="newest" selected={sort === 'newest'}>新しい順</option>
                <option value="oldest" selected={sort === 'oldest'}>古い順</option>
                <option value="score_high" selected={sort === 'score_high'}>スコアが高い順</option>
                <option value="score_low" selected={sort === 'score_low'}>スコアが低い順</option>
              </select>
            </form>
            <a href={`/new-review?subject_id=${subject.id}`} class="btn btn-sm">レビューを書く</a>
          </div>
        </div>
        {reviewList.length > 0 ? (
          <div class="review-list">
            {reviewList.map((review) => (
              <div class="review-item">
                <div class="review-score">
                  {'★'.repeat(Math.max(0,Math.min(5,Number(review.score)||0)))}
                  <span class="review-score-num">{review.score}</span>
                </div>
                <p class="review-comment">{review.comment}</p>
                <div class="review-foot">
                  {user && review.user_id === user.id && (
                    <a href={`/edit-review?subject_id=${subject.id}`} class="edit-link">編集</a>
                  )}
                  {user && review.user_id === user.id && (
                    <form method="post" action="/delete-review" class="delete-form" onsubmit="return confirm('このレビューを削除しますか？')">
                      <input type="hidden" name="review_id" value={review.id} />
                      <input type="hidden" name="subject_name" value={subject.class_name} />
                      <button type="submit" class="delete-btn">削除</button>
                    </form>
                  )}
                  <a href={`/report?target_type=review&target_id=${review.id}`} class="report-link">通報</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p class="detail-text">まだレビューがありません。</p>
        )}
      </section>

      <p class="report-subject">
        <a href={`/report?target_type=subject&target_id=${subject.id}`} class="report-link">この授業の情報を通報</a>
      </p>
    </Layout>
  )
})//検索したカードをクリックしたときの授業詳細ページ。概要・開講コマ・レビュー一覧を表示


app.get('/new-class',async(c)=>{
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/login')
  return c.html(
    <Layout title='新しい授業の登録' user={user}>
      <h1>新しく授業を登録する</h1>
      <form class="new-class" method="post" action="/new-class" id="new-class">
        <div class="new-class">
          <label for="class">授業名</label>
            <input type="text" id="class-name" name="class_name" class="form-control" placeholder='授業名を入力してください'></input>
        </div>
        <p id="name-error" class="field-error"></p>
        <div>
          <label for="about">授業概要</label>
          <input type='text' id="class_about" name='class_about' placeholder='概要を入力してください'></input>
        </div>
        <p id="about-error" class="field-error"></p>
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
                <option>農学部</option>
                <option>医学部</option>
                <option>全学共通</option>
            </select>
        </div>
        <div>
          <label for="depart">学科</label>
           <select id='depart' name='depart'>
              <option>電気電子・情報工学科</option>
              <option>応用生物学科</option>
              <option>機械工学科</option>
              <option>医学科</option>
              <option>全学共通</option>
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

        <div class="tag-field">
          <span class="tag-field-label">タグ（当てはまるものを選んでください・複数可）</span>
          <div class="tag-group">
            {/* ボタンは ALLOWED_TAGS から生成。タグを足し引きするときは配列だけ直せばよい */}
            {ALLOWED_TAGS.map((tag) => (
              <label class="tag-chip"><input type="checkbox" name="tags" value={tag} /><span>{tag}</span></label>
            ))}
          </div>
        </div>
        <button type='submit' class="button">登録</button>
      </form>
      {html`
        <script>
        const form=document.getElementById("new-class");
        const nameInput=document.getElementById("class-name");
        const aboutInput=document.getElementById("class_about");
        const nameError=document.getElementById("name-error");
        const aboutError=document.getElementById("about-error");
        form.addEventListener('submit',(event)=>{
         nameError.textContent="";
         aboutError.textContent="";
         const nameValue=nameInput.value.trim();
         const aboutValue=aboutInput.value.trim();
         if(nameValue==="" || /[.,。、]/.test(nameValue)){
          event.preventDefault();
          nameError.textContent="授業名は必須です（記号・空白のみは不可）";
         }
         if(aboutValue==="" || /[.,。、]/.test(aboutValue)){
          event.preventDefault();
          aboutError.textContent="概要は必須です（記号・空白のみは不可）";
         }
        })
        </script>
      `}
    </Layout>
  )
})//新しい授業の登録用のHTMLページを返す。formでapp.post('new-class')に入力を送り、登録作業を行う


app.post('/new-class', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/login')
  const body = await c.req.parseBody({all:true});
  const value=String(body.class_name).trim();
  const about=String(body.class_about).trim();
  const tags=[body.tags].flat().filter((t):t is string=>ALLOWED_TAGS.includes(t as any));
  if(value===""||/[.,。、]/.test(value)||value.length>200){
    console.error("授業名が不正です:", JSON.stringify(body.class_name));
    return c.html(
      <Layout title="入力内容を確認してください">
        <div class="error-view">
          <h1>授業名を確認してください</h1>
          <div class="error-card">
            <p>授業名が未入力か、使用できない文字が含まれています。</p>
            <p class="error-detail">記号（. , 。 、）や空白のみ、または200文字を超える授業名は登録できません。</p>
          </div>
          <p><a href="/new-class" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      400
    );
  }
  if(about.length>2000){
    console.error("概要が長すぎます");
    return c.html(
      <Layout title="入力内容を確認してください">
        <div class="error-view">
          <h1>概要を確認してください</h1>
          <div class="error-card">
            <p>概要が長すぎます。</p>
            <p class="error-detail">概要は2000文字以内で入力してください。</p>
          </div>
          <p><a href="/new-class" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      400
    );
  }

  const { data: subject, error: subjectError }=await createClientForRequest(c)
    .from('subject')
    .insert({
      class_name: body.class_name as string,
      semester: body.semester   as string,
      faculty:    body.faculty    as string,
      depart:     body.depart     as string,
      class_about:body.class_about as string,
      point:body.point as string,
      tags:tags
    })
    .select()
    .single();

  if (subjectError || !subject) {
    console.error('授業の登録に失敗', subjectError);
    return c.html(
      <Layout title="登録に失敗しました">
        <div class="error-view">
          <h1>授業の登録に失敗しました</h1>
          <div class="error-card">
            <p>入力内容を確認して、もう一度お試しください。</p>
          </div>
          <p><a href="/new-class" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      500
    );
  }//サーバーに入力内容を送信

  const { error: slotError } = await createClientForRequest(c)
    .from('subject_slot')
    .insert({
      subject_id: subject.id,
      day:        body.days as string,
      period:     Number(body.period),
    });

  if (slotError) {
    console.error('コマの登録に失敗', slotError);
    return c.html(
      <Layout title="登録に失敗しました">
        <div class="error-view">
          <h1>コマの登録に失敗しました</h1>
          <div class="error-card">
            <p>入力内容を確認して、もう一度お試しください。</p>
          </div>
          <p><a href="/new-class" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      500
    );
  }

  return c.redirect('/appriciate');
});


app.get('/appriciate',async(c)=>{
  const user = await getCurrentUser(c)
  const random=Math.floor(Math.random()*7)//整数０から６までランダムに出す
  const message=[
    "後輩たちの手助けになりましたよ！",
    "見返りを求めずに貢献してくれるなんて、素敵な先輩ですね！",
    "あなたのおかげで、このサイトがより信用されるようになりましたよ。",
    "本当にいい人ですね。たくさんの後輩がきっと救われるでしょう！",
    "助かります！絶対今日いいことがありますよ！",
    "もっと大学が攻略しやすくなりましたよ。ありがとう！",
    "サイトの情報源が本当に不足しているのでとても助かりました！ありがとう！"
  ]
  return c.html(
    <Layout title="ありがとうございました" user={user}>
      <div class="notice">
        <h1>協力ありがとうございました！</h1>
        <h2 class="notice-sub">{message[random]}</h2>
        <p><a href='/' class="btn">ホームに戻る</a></p>
      </div>
    </Layout>
  )
})//登録のお礼が出る画面


app.get('/contact', async (c) => {
  const user = await getCurrentUser(c)
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('【単位の地図】お問い合わせ')}`
  return c.html(
    <Layout title="お問い合わせ" user={user}>
      <div class="contact-page">
        <h1>お問い合わせ</h1>
        <p class="contact-lead">
          本サイトは有志の学生が運営する<strong>非公式サイト</strong>です。ご質問・ご意見のほか、
          掲載内容の<strong>削除・訂正のご依頼</strong>も、下記のメールアドレスで受け付けています。
        </p>

        <div class="contact-card">
          <span class="contact-label">連絡先メール</span>
          <a href={mailto} class="contact-mail">{CONTACT_EMAIL}</a>
          <p class="contact-note">
            メールソフトが開きます。開かない場合は、上記アドレス宛に直接お送りください。
          </p>
        </div>

        <section class="contact-guide">
          <h2>ご依頼の際のお願い</h2>
          <ul>
            <li><strong>削除・訂正のご依頼</strong>の場合は、対象の<strong>授業名</strong>と<strong>該当するレビューの内容</strong>など、特定できる情報をご記入ください。</li>
            <li>内容を確認のうえ対応します。<strong>返信までお時間をいただく場合があります</strong>のでご了承ください。</li>
          </ul>
        </section>

        <p class="back-link"><a href="/">← ホームに戻る</a></p>
      </div>
    </Layout>
  )
})//お問い合わせ（静的な連絡先ページ。mailtoのみ・DB保存なし）


app.get('/privacy', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(
    <Layout title="プライバシーポリシー" user={user}>
      <div class="legal-page">
        <h1>プライバシーポリシー</h1>
        <p class="legal-updated">施行日：【2026年10月26日】</p>

        <p class="legal-lead">
          本サイト「単位の地図」（有志の学生が運営する<strong>非公式の授業レビューサイト</strong>。以下「本サイト」）は、
          本サイトで提供するサービス（以下「本サービス」）における利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
        </p>

        <section class="legal-section">
          <h2>第1条（個人情報）</h2>
          <p>「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、当該情報に含まれる氏名、メールアドレスその他の記述等により特定の個人を識別できる情報をいいます。</p>
        </section>

        <section class="legal-section">
          <h2>第2条（個人情報の収集方法）</h2>
          <p>本サイトは、利用者が利用登録（ログイン）を行う際に、大学が発行するメールアドレス（@s.thers.ac.jp）を取得します。また、利用者がレビューや授業情報の投稿、通報などを行う際に、その内容・評価・出席情報・投稿日時・利用者を識別するID等を取得します。さらに、ログイン状態を保持するため、認証用のCookieを利用します（広告・行動追跡の目的では利用しません）。</p>
        </section>

        <section class="legal-section">
          <h2>第3条（個人情報を収集・利用する目的）</h2>
          <p>本サイトが個人情報を収集・利用する目的は、以下のとおりです。</p>
          <ul>
            <li>利用者の本人確認およびログイン状態の管理のため</li>
            <li>投稿されたレビュー・授業情報を表示し、本サービスを提供・運営するため</li>
            <li>不適切な投稿の確認・削除など、本サービスの健全な運営（モデレーション）のため</li>
            <li>利用者からのお問い合わせ、掲載内容の削除・訂正のご依頼に対応するため</li>
            <li>上記の利用目的に付随する目的のため</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>第4条（利用目的の変更）</h2>
          <p>本サイトは、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。利用目的を変更した場合には、変更後の目的を本サイト上に公表します。</p>
        </section>

        <section class="legal-section">
          <h2>第5条（個人情報の第三者提供）</h2>
          <p>本サイトは、法令に基づく場合を除き、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供しません。ただし、本サービスの運営のため、データベースおよび認証基盤の提供事業者である <strong>Supabase</strong> に個人情報の取扱いを委託しています（委託先への提供は、上記の第三者提供には該当しません）。なお、Supabase のサーバー所在地によっては、個人情報が<strong>外国に保管される場合</strong>があります（保管地域：【Supabaseのリージョン／保管国】）。</p>
        </section>

        <section class="legal-section">
          <h2>第6条（個人情報の開示）</h2>
          <p>本サイトは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより本人または第三者の生命・身体・財産その他の権利利益を害するおそれがある場合その他法令に違反することとなる場合は、その全部または一部を開示しないことがあり、その場合は、その旨を遅滞なく通知します。</p>
        </section>

        <section class="legal-section">
          <h2>第7条（個人情報の訂正および削除）</h2>
          <p>利用者は、本サイトの保有する自己の個人情報が誤った情報である場合には、本サイトに対し、個人情報の訂正・追加・削除（以下「訂正等」）を請求することができます。本サイトは、請求に応じる必要があると判断した場合には、遅滞なく当該個人情報の訂正等を行い、その旨を利用者に通知します。掲載内容（レビュー等）の削除・訂正のご依頼についても、第10条の窓口で受け付けます。</p>
        </section>

        <section class="legal-section">
          <h2>第8条（個人情報の利用停止等）</h2>
          <p>本サイトは、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」）を求められた場合には、遅滞なく必要な調査を行い、その結果に基づき、必要と認めるときは利用停止等を行い、その旨を本人に通知します。</p>
        </section>

        <section class="legal-section">
          <h2>第9条（プライバシーポリシーの変更）</h2>
          <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除き、利用者に通知することなく変更することができます。本サイトが別途定める場合を除き、変更後のプライバシーポリシーは、本サイトに掲載したときから効力を生じます。</p>
        </section>

        <section class="legal-section">
          <h2>第10条（お問い合わせ窓口）</h2>
          <p>本ポリシーに関するお問い合わせ、ならびに個人情報の開示・訂正・削除・利用停止等のご請求は、<a href="/contact" class="legal-inline-link">お問い合わせページ</a>またはメール（{CONTACT_EMAIL}）までご連絡ください。</p>
        </section>

        <p class="back-link"><a href="/">← ホームに戻る</a></p>
      </div>
    </Layout>
  )
})//プライバシーポリシー



app.get('/new-review',async(c)=>{
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/login')
  const classid=c.req.query('subject_id');
const {data,error:userError}=await supabase
.from("review")
.select("user_id,subject_id")
.eq("user_id",user.id)
.eq("subject_id",classid);
if(data&&data.length>0){
  return c.redirect(`/edit-review?subject_id=${classid}`);
}
if(userError){
  console.error("レビュー確認に失敗",userError);
  return c.text("読み込みに失敗しました。時間をおいて再度お試しください。",500);
}
  return c.html(
    <Layout title="レビュー登録" user={user}>
      <h1>レビュー登録</h1>
      <form class="form-card" id="form-card" method="post" action="/new-review">
        <div class="form-group">
          <label for="review">レビュー内容</label>
          <textarea id="review" name="review" class="form-control" placeholder="授業の感想を入力してください"></textarea>
        </div>
        <p id="review-error" class="field-error"></p>
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
        <div class="form-group">
          <label for="attendance">出席の有無</label>
          <select id="attendance" name="attendance" class="form-control">
            <option value="0">毎回ある</option>
            <option value="1">なし</option>
            <option value="2">出席課題のみ</option>
            <option value="3">不定期にとる</option>
          </select>
        </div>
        <input type="hidden" name="subject_id" value={classid} />
        <button type="submit" class="btn">登録する</button>
      </form>
      {html`
      <script>
      const reviewError=document.getElementById("review-error");
      const reviewInputEl=document.getElementById("review");
      const form=document.getElementById("form-card");
      form.addEventListener('submit',(event)=>{
      reviewError.textContent="";
      const reviewValue=reviewInputEl.value.trim();
      if(reviewValue===""){
      event.preventDefault();
      reviewError.textContent="内容を入力してください"
      }
      })
      </script>
      `}
    </Layout>
  )//コメントを入力するページ
});//レビューの入力ページ


app.get('/edit-review', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/login')
  const classid = c.req.query('subject_id')
  // ↓ここは仮のデータ取得（ロジックなので確認を）。自分のレビューを owner-scoped で取得、無ければ新規作成へ
  const { data: review } = await supabase
    .from('review')
    .select('comment, score, attendance, subject_id')
    .eq('subject_id', classid)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!review) return c.redirect(`/new-review?subject_id=${classid}`)
  return c.html(
    <Layout title="レビュー編集" user={user}>
      <h1>レビュー編集</h1>
      <form class="form-card" id="form-card" method="post" action="/new-review">
        <div class="form-group">
          <label for="review">レビュー内容</label>
          <textarea id="review" name="review" class="form-control" placeholder="授業の感想を入力してください">{review.comment}</textarea>
        </div>
        <p id="review-error" class="field-error"></p>
        <div class="form-group">
          <label for="score">評価点数</label>
          <select id="score" name="score" class="form-control">
            <option value="5" selected={Number(review.score) === 5}>★★★★★ 5</option>
            <option value="4" selected={Number(review.score) === 4}>★★★★ 4</option>
            <option value="3" selected={Number(review.score) === 3}>★★★ 3</option>
            <option value="2" selected={Number(review.score) === 2}>★★ 2</option>
            <option value="1" selected={Number(review.score) === 1}>★ 1</option>
          </select>
        </div>
        <div class="form-group">
          <label for="attendance">出席の有無</label>
          <select id="attendance" name="attendance" class="form-control">
            <option value="0" selected={Number(review.attendance) === 0}>毎回ある</option>
            <option value="1" selected={Number(review.attendance) === 1}>なし</option>
            <option value="2" selected={Number(review.attendance) === 2}>出席課題のみ</option>
            <option value="3" selected={Number(review.attendance) === 3}>不定期にとる</option>
          </select>
        </div>
        <input type="hidden" name="subject_id" value={review.subject_id} />
        <button type="submit" class="btn">更新する</button>
      </form>
      {html`
      <script>
      const reviewError=document.getElementById("review-error");
      const reviewInputEl=document.getElementById("review");
      const form=document.getElementById("form-card");
      form.addEventListener('submit',(event)=>{
      reviewError.textContent="";
      const reviewValue=reviewInputEl.value.trim();
      if(reviewValue===""){
      event.preventDefault();
      reviewError.textContent="内容を入力してください"
      }
      })
      </script>
      `}
    </Layout>
  )
})//既存レビューの編集ページ。初期値を入れたフォームを出し、POST /new-review で更新する


app.post('/new-review', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/login')
  const body = await c.req.parseBody();
  const review=String(body.review).trim();

  if(review===""||review.length>2000){
  return c.html(
      <Layout title="入力内容を確認してください">
        <div class="error-view">
          <h1>入力内容を確認してください</h1>
          <div class="error-card">
            <p>レビューが未入力か、長すぎます（2000文字以内）。</p>
          </div>
          <p><a href="/" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      400
    );
}
  const score=Math.max(0,Math.min(5,Number(body.score)));
  const attendance=Number(body.attendance);
  const subjectId=Number(body.subject_id);

  
  const { data: existing, error: checkError } = await supabase
    .from('review')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .maybeSingle();
  if (checkError) {
    console.error('レビュー確認に失敗:', checkError);
    return c.html(
      <Layout title="保存に失敗しました">
        <div class="error-view">
          <h1>レビューの保存に失敗しました</h1>
          <div class="error-card">
            <p>入力内容を確認して、もう一度お試しください。</p>
          </div>
          <p><a href="/" class="btn">ホームに戻る</a></p>
        </div>
      </Layout>,
      500
    );
  }

  // ③ 既存あり→UPDATE（所有者スコープ：user_id＋subject_idで自分の行だけ）／無し→INSERT
  let writeError;
  if (existing) {
    const { error } = await createClientForRequest(c)
      .from('review')
      .update({ comment: body.review as string, score: score, attendance: attendance })
      .eq('user_id', user.id)
      .eq('subject_id', subjectId);
    writeError = error;
  } else {
    const { error } = await createClientForRequest(c)
      .from('review')
      .insert({ comment: body.review as string, score: score, attendance: attendance, subject_id: subjectId, user_id: user.id });
    writeError = error;
  }

  if (writeError) {
    console.error('保存失敗:', writeError);
    return c.html(
      <Layout title="保存に失敗しました">
        <div class="error-view">
          <h1>レビューの保存に失敗しました</h1>
          <div class="error-card">
            <p>入力内容を確認して、もう一度お試しください。</p>
          </div>
          <p><a href="/" class="btn">ホームに戻る</a></p>
        </div>
      </Layout>,
      500
    );
  }
  return c.redirect('/appriciate');
}); //既存あればUPDATE・無ければINSERT。1人1レビューを維持しつつ編集も兼ねる


app.post("/delete-review",async (c)=>{
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  const body=await c.req.parseBody();
  const name=body.subject_name;
  const id=user.id;
  const {error}=await createClientForRequest(c)
        .from("review")
        .delete()
        .eq("id",body.review_id)
        .eq("user_id",id)
  if(error){
    console.error("レビュー削除に失敗",error);
    return c.text("削除に失敗しました。時間をおいて再度お試しください。",500);
  }
  return c.redirect(`/subject/${encodeURIComponent(String(name))}`)
})

app.get('/login',async(c)=>{
  const user = await getCurrentUser(c)
  return c.html(
    <Layout title="ログイン" user={user}>
      <form method="post" action="/login/auth">
        <div class="form-group">
          <label for="email">大学メールアドレス</label>
          <input type="email" id="email" name="email" class="form-control" required placeholder="例：s2312345@s.thers.ac.jp"></input>
          <p class="form-hint">大学発行のメール（@s.thers.ac.jp）のみ登録できます</p>
        </div>
        <p id="address-error" class="field-error"></p>
        <button type="submit" class="btn">ログイン</button>
      </form>
      {html`
        <script>
         const form=document.querySelector('form');
         const emailInput=document.getElementById("email");
         const emailError=document.getElementById("address-error");
         const Allowed_domain='@s.thers.ac.jp';
         form.addEventListener('submit',(event)=>{
         const check=String(emailInput.value).trim();
         if(!check.endsWith(Allowed_domain)){
         event.preventDefault();
         emailError.textContent="正規のメールアドレスを入力してください"
         }
         })
        </script>
      `}
    </Layout>
  )
})//ログイン画面

app.post("/login/auth",async (c)=>{
  const address=await c.req.parseBody();
  const check=String(address.email).trim();
  const Allowed_domain='@s.thers.ac.jp';
  if(check.endsWith(Allowed_domain)){
    const addressAuth=createClientForRequest(c);
    const { error: otpError } = await addressAuth.auth.signInWithOtp({email:check})
    if(otpError){
      console.error('コード送信失敗:', otpError);
      return c.html(
        <Layout title="送信に失敗しました">
          <div class="error-view">
            <h1>送信に失敗しました</h1>
            <div class="error-card">
              <p>ログイン用コードの送信に失敗しました。時間をおいて再度お試しください。</p>
            </div>
            <p><a href="/login" class="btn">ログイン画面に戻る</a></p>
          </div>
        </Layout>,
        500
      )
    }//エラーの時はここの中身が実施される。エラーでなければ次のreturnが実施される
    return c.html(
    <Layout title="メールを確認してください">
      <form method="post" action="/login/verify">
       <p>メールに届いた6桁コードを入力してください</p>
       <input type="hidden" name="email" value={check} />
       <input type="text" name="token" inputmode="numeric" required />
       <button type="submit" class="btn">確認</button>
      </form>
    </Layout>
   )
  }
  else{
    return c.html(
      <Layout title="メールアドレスをご確認ください">
        <div class="error-view">
          <h1>メールアドレスをご確認ください</h1>
          <div class="error-card">
            <p>入力されたメールアドレスが正しくありません。大学発行のメール（@s.thers.ac.jp）を入力してください。</p>
          </div>
          <p><a href="/login" class="btn">ログイン画面に戻る</a></p>
        </div>
      </Layout>,
      400
    )
  }
});//ログイン時にデータを送信

app.post("/login/verify",async(c)=>{
  const body=await c.req.parseBody();
  const email=String(body.email);
  const token=String(body.token);
  const client=createClientForRequest(c);
  const {error}=await client.auth.verifyOtp({ email, token, type: 'email'})
  if (error) {
    console.error('コード検証失敗:', error);
    return c.html(
      <Layout title="コードをご確認ください">
        <div class="error-view">
          <h1>コードをご確認ください</h1>
          <div class="error-card">
            <p>コードが正しくないか、有効期限が切れています。</p>
          </div>
          <p><a href="/login" class="btn">ログイン画面に戻る</a></p>
        </div>
      </Layout>,
      400
    );
  }
  return c.redirect('/');
})//cookieの検証

app.get("/alert",async(c)=>{

})

app.get("/report",async(c)=>{
  const user=await getCurrentUser(c);
  // フォームのhiddenに渡すために読むだけ。ログイン確認・target_type/target_id の検証はここで追加を
  const targetType=c.req.query('target_type') ?? '';
  const targetId=c.req.query('target_id') ?? '';
  return c.html(
    <Layout title="通報" user={user}>
      <h1>報告</h1>
      <form class="form-card" method="post" id="report" action="/report">
        <input type="hidden" name="target_type" value={targetType} />
        <input type="hidden" name="target_id" value={targetId} />
        <div class="form-group">
          <label for="reason">報告理由</label>
          <select id="reason" name="reason" class="form-control">
            {ALLOWED_REPORT_REASONS.map((reason) => (
              <option value={reason}>{reason}</option>
            ))}
          </select>
        </div>
        <button type="submit" class="btn">通報する</button>
      </form>
    </Layout>
  )
})

app.post("/report",async(c)=>{
  const user= await getCurrentUser(c);
  const body=await c.req.parseBody();
  if(!user){
    return c.redirect("/login");
  }
  if(body.target_type!="review"&&body.target_type!="subject"){
    return c.text("不正な操作です",400);
  }
  if(!ALLOWED_REPORT_REASONS.includes(body.reason as any)){
    return c.text("不正な操作です",400);
  }
  // maker_id＝通報された内容の作成者。reviewなら作者user_idをDBから引き、subjectは作者列が無いのでnull
  let makerId:string|null=null;
  if(body.target_type==="review"){
    const {data:reviewRow}=await supabase
      .from("review")
      .select("user_id")
      .eq("id",body.target_id)
      .maybeSingle();
    makerId=reviewRow?.user_id ?? null;
  }

  const {error}=await createClientForRequest(c)
  .from("report")
  .insert({
    target:body.target_type,
    reporter_id:user.id,
    reason:body.reason,
    target_id:body.target_id,
    maker_id:makerId,
  });

  if(error){
    console.error("通報の保存に失敗",error);
    return c.text("保存に失敗しました。時間をおいて再度お試しください。",500);
  }
  return c.redirect("/");
})

app.post("/logout",async(c)=>{
  const client=createClientForRequest(c);
  await client.auth.signOut();
  return c.redirect("/");
})//ログアウト機能



serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})//このserveがリクエストに対してポートを開く