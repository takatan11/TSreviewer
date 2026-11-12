import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { Breadcrumb } from '../components/Breadcrumb.js'
import { ErrorPage } from '../components/ErrorPage.js'
import {supabase} from '../db/index.js'
import{html} from 'hono/html'
import{createClientForRequest} from '../db/server.js'
import { getCurrentUser } from '../auth.js'

const reviews=new Hono();

async function findSubjectName(id:string){
  if(!/^\d+$/.test(id)){
    return null;
  }
  const {data}=await supabase
  .from("subject")
  .select("class_name")
  .eq("id",id)
  .maybeSingle();
  return data?.class_name ?? null;
}//授業idから授業名を取ってくる。idが数字でない・授業が存在しないときはnull

reviews.get('/new-review',async(c)=>{
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  const classid=c.req.query('subject_id') ?? "";
  const subjectName=await findSubjectName(classid);//パンくずに出す授業名
  if(subjectName===null){
    return c.html(
      <ErrorPage title="授業が見つかりません" message="レビューを書く授業が見つかりませんでした。授業のページからもう一度お試しください。" user={user} />,
      404
    );
  }//subject_idが無い・数字でない・授業が存在しないときは404
  const {data,error:userError}=await supabase
  .from("review")
  .select("user_id,subject_id")
  .eq("user_id",user.id)
  .eq("subject_id",classid);
  if(userError){
    console.error("レビュー確認に失敗",userError);
    return c.html(
      <ErrorPage title="読み込みに失敗しました" message="時間をおいて、もう一度お試しください。" user={user} />,
      500
    );
  }
  if(data&&data.length>0){
    return c.redirect(`/edit-review?subject_id=${classid}`);
  }//すでに書いていれば編集ページへ
  return c.html(
    <Layout title="レビュー登録" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: subjectName, href: `/subject/${encodeURIComponent(subjectName)}` }, { label: "レビューを書く" }]} />
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


reviews.get("/edit-review",async(c)=>{
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  const classid=c.req.query("subject_id");
  const {data:review}=await supabase
  .from("review")
  .select("id,comment,score,attendance,subject_id")
  .eq("subject_id",classid)
  .eq("user_id",user.id)
  .maybeSingle();//自分のレビューだけを取ってくる
  if(!review){
    return c.redirect(`/new-review?subject_id=${classid}`);
  }//まだ書いていなければ新規作成のページへ
  const {data:subject}=await supabase
  .from("subject")
  .select("class_name")
  .eq("id",review.subject_id)
  .maybeSingle();
  const subjectName=subject?.class_name ?? "";//パンくずと削除後の戻り先に使う授業名
  return c.html(
    <Layout title="レビュー編集" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: subjectName, href: `/subject/${encodeURIComponent(subjectName)}` }, { label: "レビュー編集" }]} />
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

      {/* 削除は更新ボタンから離してページの最後に置く */}
      <section class="danger-zone">
        <h2>レビューの削除</h2>
        <p>このレビューを削除します。削除すると元に戻せません。</p>
        <form method="post" action="/delete-review" onsubmit="return confirm('このレビューを削除しますか？この操作は取り消せません。')">
          <input type="hidden" name="review_id" value={review.id} />
          <input type="hidden" name="subject_name" value={subjectName} />
          <button type="submit" class="btn-danger">このレビューを削除</button>
        </form>
      </section>
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
})//レビューの編集ページ。今の内容を入れたフォームを出し、POST /new-review で更新する。削除もここから


reviews.post("/new-review",async(c)=>{
  const user=await getCurrentUser(c);
  if(!user){
    return c.redirect("/login");
  }
  const body=await c.req.parseBody();
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
  if(await findSubjectName(String(body.subject_id ?? ""))===null){
    return c.html(
      <ErrorPage title="授業が見つかりません" message="レビューを書く授業が見つかりませんでした。授業のページからもう一度お試しください。" user={user} />,
      404
    );
  }//存在しない授業へのレビューは保存しない
  const score=Number(body.score);
  const attendance=Number(body.attendance);
  if(![1,2,3,4,5].includes(score)||![0,1,2,3].includes(attendance)){
    return c.html(
      <ErrorPage title="入力内容を確認してください" message="評価点数か出席の有無が正しくありません。一覧の中から選んで、もう一度お試しください。" user={user} />,
      400
    );
  }//画面の選択肢（点数1〜5、出席0〜3）にない値を弾く
  const subjectId=Number(body.subject_id);

  const {data:existing,error:checkError}=await supabase
  .from("review")
  .select("id")
  .eq("user_id",user.id)
  .eq("subject_id",subjectId)
  .maybeSingle();//この授業にもうレビューを書いているか
  if(checkError){
    console.error("レビュー確認に失敗",checkError);
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

  let writeError;//UPDATEとINSERTのどちらで失敗しても、ここに入れて最後にまとめて確認する
  if(existing){
    const {error}=await createClientForRequest(c)
    .from("review")
    .update({comment:review,score:score,attendance:attendance})
    .eq("user_id",user.id)
    .eq("subject_id",subjectId);//自分のレビューだけを書き換える
    writeError=error;
  }else{
    const since=new Date(Date.now()-24*60*60*1000).toISOString();//24時間前の時刻
    const {count,error:countError}=await supabase
    .from("review")
    .select("id",{count:"exact",head:true})
    .eq("user_id",user.id)
    .gte("created_at",since);//直近24時間に書いたレビューの数
    if(countError){
      console.error("投稿数の確認に失敗",countError);
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
    if((count ?? 0)>=30){
      return c.html(
        <Layout title="投稿上限に達しました" user={user}>
          <div class="error-view">
            <h1>本日の投稿上限に達しました</h1>
            <div class="error-card">
              <p>レビューの投稿は24時間あたり30件までです。時間をおいて、もう一度お試しください。</p>
            </div>
            <p><a href="/" class="btn">ホームに戻る</a></p>
          </div>
        </Layout>,
        429
      );
    }//24時間で30件まで。超えていたら新しいレビューは書けない
    const {error}=await createClientForRequest(c)
    .from("review")
    .insert({comment:review,score:score,attendance:attendance,subject_id:subjectId,user_id:user.id});
    writeError=error;
  }

  if(writeError){
    console.error("保存失敗",writeError);
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
  return c.redirect("/appriciate");
});//レビューの保存。すでに書いていればUPDATE、まだならINSERT（1人1授業1レビュー）


reviews.post("/delete-review",async (c)=>{
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
    return c.html(
      <ErrorPage title="削除に失敗しました" message="時間をおいて、もう一度お試しください。" user={user} />,
      500
    );
  }
  return c.redirect(`/subject/${encodeURIComponent(String(name))}`);//削除したら元の授業のページに戻す
})

export default reviews;//レビューを書く・編集・保存・削除のルート
