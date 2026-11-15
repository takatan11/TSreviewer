import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { ErrorPage } from '../components/ErrorPage.js'
import { TagGroups } from '../components/TagGroups.js'
import {supabase} from '../db/index.js'
import{html} from 'hono/html'
import { getCurrentUser } from '../auth.js'
import { TAG_GROUPS, Faculty, Department } from '../constants.js'

const home=new Hono();

const PAGE_SIZE=24;//ホームの授業一覧に1ページあたり何件出すか

home.get('/', async(c) => {
  const user=await getCurrentUser(c);
  const keyword = c.req.query('q') ?? ''  ;
  const faculty=c.req.query('faculty') ?? '';
  const department=c.req.query('department') ?? '';
  const selectedTags=c.req.queries('tags')??[];
  const pageParam=Number(c.req.query('page') ?? "1");
  const page=Number.isInteger(pageParam)&&pageParam>=1 ? pageParam : 1;//数字でない・1未満なら1ページ目
  const pageUrl=(n:number)=>{
    const params=new URLSearchParams();
    if(keyword){
      params.set("q",keyword);
    }
    if(faculty){
      params.set("faculty",faculty);
    }
    if(department){
      params.set("department",department);
    }
    for(const t of selectedTags){
      params.append("tags",t);
    }
    if(n>1){
      params.set("page",String(n));
    }
    const qs=params.toString();
    return qs ? `/?${qs}` : "/";
  };//検索条件を保ったまま、nページ目へのURLを作る
  let courseQuery=supabase
  .from('subject')
  .select('class_name,faculty,depart',{count:"exact"})
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
  for(const group of TAG_GROUPS){
    const picked=selectedTags.filter((t)=>group.tags.some((tag)=>tag.value===t));
    if(picked.length){
      courseQuery="multiple" in group ? courseQuery.contains("tags",picked) : courseQuery.overlaps("tags",picked);
    }
  }//タグ検索。複数選べる行（評価方法）は選んだものすべて、ほかの行はどれか1つに当てはまる授業。違う行どうしはすべてに当てはまる授業に絞る
  const from=(page-1)*PAGE_SIZE;
  const{data:courses,count,error:readError}=await courseQuery.range(from,from+PAGE_SIZE-1);
  if(readError?.code==="PGRST103"){
    return c.redirect(pageUrl(1));
  }//件数より後ろのページを指定されたときは1ページ目に戻す
  if(readError){
    console.error("読み取り失敗!!", readError);
    return c.html(
      <ErrorPage title="読み込みに失敗しました" message="時間をおいて、もう一度お試しください。" user={user} />,
      500
    );
  }
  const total=count ?? 0;
  const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE));
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
            <select id="faculty-select" class="search-control" name="faculty" aria-label="学部">
              <option value="">学部を指定しない</option>
              {Faculty.map((name)=>(
                <option value={name} selected={faculty==name}>{name}</option>
              ))}
            </select>
            <select id='department-select' class="search-control" name="department" aria-label="学科" data-departments={JSON.stringify(Department)}>
              <option value="">学科を指定しない</option>
              {(Object.hasOwn(Department,faculty) ? (Department as Record<string,readonly string[]>)[faculty] : []).map((names)=>(
                <option value={names} selected={department==names}>{names}</option>
              ))}
            </select>
          </div>
          {/* タグ欄。選択中のタグがあれば開いた状態で表示 */}
          <details class="tag-filter" open={selectedTags.length > 0}>
            <summary class="tag-filter-summary">
              タグで絞り込み
              {selectedTags.length > 0 && <span class="tag-filter-count">{selectedTags.length}件選択中</span>}
            </summary>
            <p class="tag-filter-hint">各行から1つまで選べます（評価方法は複数可・もう一度押すと外れます）。選んだタグすべてに当てはまる授業に絞り込みます。</p>
            <TagGroups selected={selectedTags} />
          </details>
        </form>
      </section>

      {/* 授業の一覧。初期表示は全件、検索条件があれば絞り込む */}
      <div class="list-head">
        <h2 class="list-heading">
          {(keyword || faculty || department || selectedTags.length > 0) ? "検索結果" : "すべての授業"}
          <span class="list-count">{total}件</span>
        </h2>
        <a href="/new-class" class="btn-outline btn-sm">＋ 授業を登録</a>
      </div>
      {courses && courses.length > 0 ? (
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
        <div class="empty-state">
          <p class="empty-note">
            {(keyword || faculty || department || selectedTags.length > 0) ? "該当する授業が見つかりませんでした。" : "まだ授業が登録されていません。"}
          </p>
          <p class="empty-sub">見つからない授業は、あなたが登録できます。</p>
          <a href="/new-class" class="btn">授業を登録する</a>
        </div>
      )}
      {totalPages>1 && (
        <nav class="pagination" aria-label="ページ送り">
          {page>1 ? <a href={pageUrl(page-1)} class="btn-outline btn-sm">← 前へ</a> : <span class="pagination-spacer"></span>}
          <span class="pagination-status">{page} / {totalPages}ページ</span>
          {page<totalPages ? <a href={pageUrl(page+1)} class="btn-outline btn-sm">次へ →</a> : <span class="pagination-spacer"></span>}
        </nav>
      )}
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

const facultySelect=document.getElementById('faculty-select');
const departmentSelect=document.getElementById('department-select');
const departmentTable=JSON.parse(departmentSelect.dataset.departments);
facultySelect.addEventListener('change',()=>{
     const departments=Object.hasOwn(departmentTable,facultySelect.value) ? departmentTable[facultySelect.value] : [];
     departmentSelect.replaceChildren();
     const first=document.createElement('option');
     first.value='';
     first.textContent='学科を指定しない';
     departmentSelect.appendChild(first);
     for(const name of departments){
          const option=document.createElement('option');
          option.value=name;
          option.textContent=name;
          departmentSelect.appendChild(option);
     }
});//学部を選び直したら、学科の選択肢をその学部の学科に入れ替える



        </script>

      `}
    </Layout>
  )
});//最初に出すページ（授業を探す）。検索・絞り込み・授業一覧（ページ送り付き）。
   //<script>の中では、サジェストと学部→学科の選択肢の入れ替えをaddEventListenerで定義している


home.get('/api/suggest',async(c)=>{//検索のときにサジェストが出るようにするため、サーバーから情報をとってきている
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
    return c.json([],500);//画面側のJSは配列を受け取る前提なので、失敗しても空の配列を返す
  };
  return c.json(suggestions??[]);
})

export default home;//授業を探す（ホーム・すべての授業・サジェスト）のルート
