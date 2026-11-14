import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'
import { bodyLimit } from 'hono/body-limit'
import { ErrorPage } from './components/ErrorPage.js'
import home from './routes/home.js'
import subjects from './routes/subjects.js'
import reviews from './routes/reviews.js'
import reports from './routes/reports.js'
import auth from './routes/auth.js'
import pages from './routes/pages.js'
import { supabase } from './db/index.js'
const app = new Hono()

app.use("*",csrf());//CSRF対策。状態を変えるPOSTはOrigin/Refererを検証する
app.use("*",secureHeaders());//安全のためのヘッダーを付ける。ほかのサイトの枠(iframe)の中に埋め込まれるのを防ぐ（クリックジャッキング対策）など
app.use("*",bodyLimit({
  maxSize:100*1024,
  onError:(c)=>c.html(<ErrorPage title="送信内容が大きすぎます" message="入力内容を短くして、もう一度お試しください。" />,413),
}));//送信できるデータは100KBまで。大きすぎるデータでサーバーのメモリを圧迫されないようにする

app.route("/",home);//授業を探す（ホーム・すべての授業・サジェスト）
app.route("/",subjects);//授業の詳細と、授業の登録
app.route("/",reviews);//レビューを書く・編集・保存・削除
app.route("/",reports);//通報
app.route("/",auth);//ログイン・ログアウト
app.route("/",pages);//お問い合わせ・プライバシーポリシー・利用規約・ヘルプ・お礼のページ

export default {
  fetch:app.fetch,
  async scheduled(){
    const {error}=await supabase
    .from("subject")
    .select("id")
    .limit(1);
    if(error){
      console.error("定期アクセスに失敗",error);
    }
  },//wrangler.tomlのcronで週2回呼ばれる。Supabaseに軽くアクセスして、無料プランの自動停止を防ぐ
};//Cloudflare Workersに渡す。fetchはふだんのアクセス、scheduledは決まった時間の処理
