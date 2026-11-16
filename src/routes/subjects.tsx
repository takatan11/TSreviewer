import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { Breadcrumb } from '../components/Breadcrumb.js'
import { ErrorPage } from '../components/ErrorPage.js'
import { TagGroups } from '../components/TagGroups.js'
import {supabase} from '../db/index.js'
import{html} from 'hono/html'
import{createClientForRequest} from '../db/server.js'
import { getCurrentUser } from '../auth.js'
import { ALLOWED_TAGS, TAG_GROUPS, Faculty, Department, SEMESTERS, DAYS, PERIODS, POINTS } from '../constants.js'

const subjects=new Hono();

subjects.get("/subject/:name",async(c)=>{
  const user=await getCurrentUser(c);
  const name=c.req.param("name");//URLの:nameの部分を取り出してname変数に入れている
  const sort=c.req.query("sort") ?? "newest";
  const SORT_OPTIONS:Record<string,{column:string;ascending:boolean}>={
    newest:{column:"created_at",ascending:false},//新着順
    oldest:{column:"created_at",ascending:true},//古い順
    score_high:{column:"score",ascending:false},//評価が高い順
    score_low:{column:"score",ascending:true},//評価が低い順
  };
  const sortOption=SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;//4つ以外（URL改変など）なら新着順にする
  const {data:subjects,error}=await supabase
  .from("subject")
  .select("*")
  .eq("class_name",name)
  .order("created_at",{ascending:true})
  .limit(1);
  const subject=subjects?.[0];
  if(error||!subject){
    return c.html(
      <ErrorPage title="授業が見つかりません" message="お探しの授業は登録されていないか、削除された可能性があります。" user={user} />,
      404
    );
  }

  const [{data:slots},{data:reviews}]=await Promise.all([
    supabase
    .from("subject_slot")
    .select("day,period")
    .eq("subject_id",subject.id),
    supabase
    .from("review")
    .select("comment,score,created_at,id,user_id")
    .eq("subject_id",subject.id)
    .order(sortOption.column,{ascending:sortOption.ascending}),
  ]);//開講コマとレビューを同時に取ってくる

  const slotList=slots ?? [];
  const reviewList=reviews ?? [];
  const avgScore=reviewList.length===0 ? null : reviewList.reduce((acc,r)=>acc+(Number(r.score)||0),0)/reviewList.length;//レビューが0件なら平均なし(null)
  const myReview=user ? reviewList.find((r)=>r.user_id===user.id) : undefined;//自分のレビュー。「レビューを書く」ボタンの文字を変えるのに使う
  const subjectTags:string[]=Array.isArray(subject.tags) ? subject.tags : [];
  const tagRows=TAG_GROUPS
  .map((group)=>({label:group.label,tags:group.tags.filter((tag)=>subjectTags.includes(tag.value))}))
  .filter((row)=>row.tags.length>0);//授業ページ用。付いているタグを行ごとにまとめる（「出席：とる」のように行の名前と一緒に出すため）
  const slotText=slotList.map((slot)=>`${slot.day} ${slot.period}限`).join("、");
  const formatDate=(iso:string)=>new Date(iso).toLocaleDateString("ja-JP");//投稿日の表示用（2026/10/14の形）

  return c.html(
    <Layout title={subject.class_name} user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: subject.class_name }]} />

      <div class="subject-detail">
        <h1>{subject.class_name}</h1>
        {avgScore === null ? (
          <p class="rating-empty">まだ評価がありません</p>
        ) : (
          <div class="rating-summary">
            <span class="rating-score">{avgScore.toFixed(1)}</span>
            <span class="rating-stars">{"★".repeat(Math.round(avgScore))}{"☆".repeat(5 - Math.round(avgScore))}</span>
            <span class="rating-count">{reviewList.length}件のレビュー</span>
          </div>
        )}
      </div>

      {/* 授業の情報（学部・学科などをラベル付きで並べる） */}
      <section class="detail-section">
        <h2>授業の情報</h2>
        <p class="detail-text info-about">{subject.class_about || "概要は登録されていません。"}</p>
        <dl class="info-list">
          <div class="info-row"><dt>学部</dt><dd>{subject.faculty || "—"}</dd></div>
          <div class="info-row"><dt>学科</dt><dd>{subject.depart || "—"}</dd></div>
          <div class="info-row"><dt>開講時期</dt><dd>{subject.semester || "—"}</dd></div>
          <div class="info-row"><dt>単位数</dt><dd>{subject.point ? `${subject.point}単位` : "—"}</dd></div>
          <div class="info-row"><dt>開講コマ</dt><dd>{slotText || "登録されていません"}</dd></div>
          <div class="info-row">
            <dt>タグ</dt>
            <dd>
              {/* タグを押すとそのタグで絞り込んだホームが開く */}
              {tagRows.length > 0 ? (
                <span class="tag-links">
                  {tagRows.map((row) => (
                    <span class="tag-item">
                      <span class="tag-item-name">{row.label}：</span>
                      {row.tags.map((tag, i) => (
                        <>
                          {i > 0 && "・"}
                          <a href={`/?tags=${encodeURIComponent(tag.value)}`} class="tag-link">{tag.label}</a>
                        </>
                      ))}
                    </span>
                  ))}
                </span>
              ) : "なし"}
            </dd>
          </div>
        </dl>
      </section>

      <section class="detail-section">
        <div class="detail-section-head">
          <h2>レビュー（{reviewList.length}件）</h2>
          <div class="head-controls">
            <form method='get' action={`/subject/${encodeURIComponent(subject.class_name)}`}>
              <select name="sort" class="sort-select" onchange="this.form.submit()" aria-label="並び順">
                <option value="newest" selected={sort === "newest"}>新しい順</option>
                <option value="oldest" selected={sort === "oldest"}>古い順</option>
                <option value="score_high" selected={sort === "score_high"}>スコアが高い順</option>
                <option value="score_low" selected={sort === "score_low"}>スコアが低い順</option>
              </select>
            </form>
            {/* 未ログイン・書いたことがある・まだ書いていない、でボタンの文字と行き先を変える */}
            {!user ? (
              <a href="/login" class="btn btn-sm">ログインしてレビューを書く</a>
            ) : myReview ? (
              <a href={`/edit-review?subject_id=${subject.id}`} class="btn btn-sm">自分のレビューを編集</a>
            ) : (
              <a href={`/new-review?subject_id=${subject.id}`} class="btn btn-sm">レビューを書く</a>
            )}
          </div>
        </div>
        {reviewList.length > 0 ? (
          <div class="review-list">
            {reviewList.map((review) => {
              const mine=user&&review.user_id===user.id;//自分のレビューかどうか
              return (
                <div class={mine ? "review-item is-mine" : "review-item"}>
                  <div class="review-head">
                    <div class="review-score">
                      {"★".repeat(Math.max(0,Math.min(5,Number(review.score)||0)))}
                      <span class="review-score-num">{review.score}</span>
                    </div>
                    <div class="review-meta">
                      {mine && <span class="review-mine">あなたのレビュー</span>}
                      <span class="review-date">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <p class="review-comment">{review.comment}</p>
                  {!mine && (
                    <div class="review-foot">
                      <a href={`/report?target_type=review&target_id=${review.id}`} class="report-link">通報</a>
                    </div>
                  )}{/* 自分のレビューには通報を出さない（編集は上の「自分のレビューを編集」から） */}
                </div>
              )
            })}
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
})//検索したカードをクリックしたときの授業詳細ページ。授業の情報とレビュー一覧を表示


subjects.get('/new-class',async(c)=>{
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  return c.html(
    <Layout title='新しい授業の登録' user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "授業を登録" }]} />
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
              {SEMESTERS.map((s)=>(
                <option value={s}>{s}</option>
              ))}
            </select>
        </div>
        <div>
          <label for="days">曜日</label>
            <select id='days' name='days'>
              {DAYS.map((d)=>(
                <option value={d}>{d}</option>
              ))}
            </select>
        </div>
        <div>
          <label for="period">時限</label>
            <select id="period" name='period'>
              {PERIODS.map((p)=>(
                <option value={p}>{p}限</option>
              ))}
            </select>
        </div>
        <div>
          <label for="faculty">学部</label>
            <select id='faculty' name='faculty' required>
                <option value="">学部を選択</option>
                {Faculty.map((name)=>(
                  <option value={name}>{name}</option>
                ))}
            </select>
        </div>
        <div>
          <label for="depart">学科</label>
           <select id='depart' name='depart' data-departments={JSON.stringify(Department)}>
              <option value="">学部を先に選択</option>
           </select>
        </div>

        <div>
          <label for="point">単位数</label>
            <select id='point' name='point'>
              {POINTS.map((pt)=>(
                <option value={pt}>{pt}</option>
              ))}
            </select>
        </div>

        <div class="tag-field">
          <span class="tag-field-label">タグ（当てはまるものを各行から1つまで・評価方法は複数可・もう一度押すと外れます）</span>
          {/* タグはTAG_GROUPSから作る */}
          <TagGroups />
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
         if(/^[\s.,。、]*$/.test(aboutValue)){
          event.preventDefault();
          aboutError.textContent="概要は必須です（記号・空白のみは不可）";
         }
        })
        const facultySelect=document.getElementById("faculty");
        const departSelect=document.getElementById("depart");
        const departTable=JSON.parse(departSelect.dataset.departments);
        facultySelect.addEventListener('change',()=>{
         const departs=Object.hasOwn(departTable,facultySelect.value) ? departTable[facultySelect.value] : [];
         departSelect.replaceChildren();
         const first=document.createElement("option");
         first.value="";
         first.textContent=facultySelect.value==="" ? "学部を先に選択" : departs.length===0 ? "学科なし" : "学科を選択";
         departSelect.appendChild(first);
         for(const name of departs){
          const option=document.createElement("option");
          option.value=name;
          option.textContent=name;
          departSelect.appendChild(option);
         }
         departSelect.required=departs.length>0;
        })//学部を選び直したら、学科の選択肢をその学部の学科に入れ替える。学科がある学部では学科も必須にする
        </script>
      `}
    </Layout>
  )
})//新しい授業の登録用のHTMLページを返す。formでapp.post('new-class')に入力を送り、登録作業を行う


subjects.post('/new-class', async (c) => {
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  const body = await c.req.parseBody({all:true});
  const value=String(body.class_name).trim();
  const about=String(body.class_about).trim();
  const tags=[body.tags].flat().filter((t):t is string=>typeof t==="string"&&ALLOWED_TAGS.includes(t));
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
  const faculty=String(body.faculty ?? "");
  const depart=String(body.depart ?? "");
  const departs=Object.hasOwn(Department,faculty) ? (Department as Record<string,readonly string[]>)[faculty] : null;
  if(!departs||(departs.length>0 ? !departs.includes(depart) : depart!=="")){
    console.error("学部・学科が不正です:", JSON.stringify({faculty,depart}));
    return c.html(
      <Layout title="入力内容を確認してください">
        <div class="error-view">
          <h1>学部・学科を確認してください</h1>
          <div class="error-card">
            <p>学部が選ばれていないか、学部と学科の組み合わせが正しくありません。</p>
            <p class="error-detail">学部を選んでから、その学部の学科を選んでください。</p>
          </div>
          <p><a href="/new-class" class="btn">登録画面に戻る</a></p>
        </div>
      </Layout>,
      400
    );
  }//学部が表にあるか、学科がその学部のものかを確かめる。画面を通さずに送られた組み合わせを弾く
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

  const semester=String(body.semester ?? "");
  const day=String(body.days ?? "");
  const period=String(body.period ?? "");
  const point=String(body.point ?? "");
  if(!(SEMESTERS as readonly string[]).includes(semester)||!(DAYS as readonly string[]).includes(day)
    ||!(PERIODS as readonly string[]).includes(period)||!(POINTS as readonly string[]).includes(point)){
    console.error("選択肢にない値が送られました:", JSON.stringify({semester,day,period,point}));
    return c.html(
      <ErrorPage title="入力内容を確認してください" message="開講時期・曜日・時限・単位数のいずれかが正しくありません。" detail="一覧の中から選んで、もう一度登録してください。" backHref="/new-class" backLabel="登録画面に戻る" user={user} />,
      400
    );
  }//画面の選択肢にない値（画面を通さずに送られたもの）を弾く

  const { data: subject, error: subjectError }=await createClientForRequest(c)
    .from('subject')
    .insert({
      class_name: value,
      semester: body.semester   as string,
      faculty:    body.faculty    as string,
      depart:     body.depart     as string,
      class_about:body.class_about as string,
      point:body.point as string,
      tags:tags
    })
    .select()
    .single();

  if(subjectError?.code==="23505"){
    return c.html(
      <Layout title="すでに登録されています" user={user}>
        <div class="error-view">
          <h1>この授業はすでに登録されています</h1>
          <div class="error-card">
            <p>同じ名前の授業が登録済みです。レビューはそちらのページから書けます。</p>
          </div>
          <p><a href={`/subject/${encodeURIComponent(value)}`} class="btn">登録済みの授業を見る</a></p>
        </div>
      </Layout>,
      409
    );
  }//授業名はDBでUNIQUEにしてあるので、同名の授業はここで弾かれる
  if (subjectError || !subject) {
    console.error('授業の登録に失敗', subjectError);
    return c.html(
      <ErrorPage title="登録に失敗しました" message="入力内容を確認して、もう一度お試しください。" backHref="/new-class" backLabel="登録画面に戻る" user={user} />,
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
      <ErrorPage title="コマの登録に失敗しました" message="入力内容を確認して、もう一度お試しください。" backHref="/new-class" backLabel="登録画面に戻る" user={user} />,
      500
    );
  }

  return c.redirect('/appriciate');
});

export default subjects;//授業の詳細と、授業の登録のルート
