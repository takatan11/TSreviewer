import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { Breadcrumb } from '../components/Breadcrumb.js'
import { ErrorPage } from '../components/ErrorPage.js'
import {supabase} from '../db/index.js'
import{createClientForRequest} from '../db/server.js'
import { getCurrentUser } from '../auth.js'
import { ALLOWED_REPORT_REASONS } from '../constants.js'

const reports=new Hono();

reports.get("/report",async(c)=>{
  const user=await getCurrentUser(c);
  const targetType=c.req.query("target_type") ?? "";//フォームのhiddenに入れて、POSTにそのまま渡す
  const targetId=c.req.query("target_id") ?? "";//※このページではログイン確認と値の検証をまだしていない（POST /report側ではしている）
  return c.html(
    <Layout title="通報" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "通報" }]} />
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
})//通報のページ。理由を選んでPOST /reportに送る

reports.post("/report",async(c)=>{
  const user= await getCurrentUser(c);
  const body=await c.req.parseBody();
  if(!user){
    return c.redirect("/login");
  }
  if(body.target_type!="review"&&body.target_type!="subject"){
    return c.html(
      <ErrorPage title="通報できませんでした" message="通報の内容が正しくありません。通報したいレビューや授業のページから、もう一度お試しください。" user={user} />,
      400
    );
  }
  if(!ALLOWED_REPORT_REASONS.includes(body.reason as any)){
    return c.html(
      <ErrorPage title="通報できませんでした" message="通報の内容が正しくありません。通報したいレビューや授業のページから、もう一度お試しください。" user={user} />,
      400
    );
  }
  let makerId:string|null=null;//通報された内容を書いた人。授業には作者の列が無いのでnullのまま
  if(body.target_type==="review"){
    const {data:reviewRow}=await supabase
    .from("review")
    .select("user_id")
    .eq("id",body.target_id)
    .maybeSingle();
    if(!reviewRow){
      return c.html(
        <ErrorPage title="通報できませんでした" message="通報するレビューが見つかりませんでした。削除された可能性があります。" user={user} />,
        404
      );
    }
    makerId=reviewRow.user_id ?? null;
  }else{
    const {data:subjectRow}=await supabase
    .from("subject")
    .select("id")
    .eq("id",body.target_id)
    .maybeSingle();
    if(!subjectRow){
      return c.html(
        <ErrorPage title="通報できませんでした" message="通報する授業が見つかりませんでした。削除された可能性があります。" user={user} />,
        404
      );
    }
  }//通報する対象が本当にあるか確かめる。レビューの通報なら、そのレビューを書いた人のidも取ってくる

  const {error}=await createClientForRequest(c)
  .from("report")
  .insert({
    target:body.target_type,
    reporter_id:user.id,
    reason:body.reason,
    target_id:body.target_id,
    maker_id:makerId,
  });

  if(error?.code==="23505"){
    return c.html(
      <Layout title="通報済みです" user={user}>
        <div class="error-view">
          <h1>この内容はすでに通報済みです</h1>
          <div class="error-card">
            <p>ご協力ありがとうございます。同じ内容への通報は1人1回までです。</p>
            <p class="error-detail">いただいた通報は運営が順次確認します。</p>
          </div>
          <p><a href="/" class="btn">ホームに戻る</a></p>
        </div>
      </Layout>
    );
  }//同じ人が同じ内容を2回通報したとき（UNIQUE制約で弾かれたとき）は、エラーではなく通報済みとして知らせる
  if(error){
    console.error("通報の保存に失敗",error);
    return c.html(
      <ErrorPage title="通報に失敗しました" message="時間をおいて、もう一度お試しください。" user={user} />,
      500
    );
  }
  return c.redirect("/appriciate");//通報を受け付けたらお礼のページへ
})

export default reports;//通報のルート
