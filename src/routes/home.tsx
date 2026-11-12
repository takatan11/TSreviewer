import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { TagGroups } from '../components/TagGroups.js'
import {supabase} from '../db/index.js'
import{html} from 'hono/html'
import { getCurrentUser } from '../auth.js'
import { TAG_GROUPS, Faculty, Department } from '../constants.js'

const home=new Hono();

home.get('/', async(c) => {
  const user=await getCurrentUser(c);
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
  for(const group of TAG_GROUPS){
    const picked=selectedTags.filter((t)=>(group.tags as readonly string[]).includes(t));
    if(picked.length){
      courseQuery=courseQuery.overlaps("tags",picked);
    }
  }//タグ検索。同じ行の中はどれか1つ、違う行どうしはすべてに当てはまる授業に絞る
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
            <p class="tag-filter-hint">各行から1つまで選べます（もう一度押すと外れます）。選んだタグすべてに当てはまる授業に絞り込みます。</p>
            <TagGroups selected={selectedTags} />
          </details>
        </form>
      </section>

      {/* 授業の一覧。初期表示は全件、検索条件があれば絞り込む */}
      <div class="list-head">
        <h2 class="list-heading">
          {(keyword || faculty || department || selectedTags.length > 0) ? "検索結果" : "すべての授業"}
          <span class="list-count">{courses?.length ?? 0}件</span>
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
  )//レビュー一覧で/reviewsに、新しいレビューを登録でapp.getの/registrationに飛ぶ
});//最初に出すページ。URLなどが付いたボタンも設置されている。水色の部分はページ上に
   //配置されているボタンが押されたときに何が起きるのかaddEventLiisterで定義している


home.get('/allclass',async(c)=>{
  const {data:allClass,error:classError}=await supabase
  .from('subject')
  .select('class_name,faculty,depart');

  if(classError){
    console.error('授業一覧の取得失敗:', classError);
    return c.text('取得に失敗しました。時間をおいて再度お試しください。', 500);
  };

  return c.json(allClass??[]);
})//すべての授業を表示させるとき画面下部にカードが出る


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
    return c.text('取得に失敗しました。時間をおいて再度お試しください。', 500);
  };
  return c.json(suggestions??[]);
})

export default home;//授業を探す（ホーム・すべての授業・サジェスト）のルート
