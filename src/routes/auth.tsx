import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import{html} from 'hono/html'
import{createClientForRequest} from '../db/server.js'
import { getCurrentUser } from '../auth.js'

const auth=new Hono();

auth.get('/login',async(c)=>{
  const user=await getCurrentUser(c);
  return c.html(
    <Layout title="ログイン" user={user} hideLogin>
      <h1>ログイン</h1>
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

auth.post("/login/auth",async (c)=>{
  const address=await c.req.parseBody();
  const check=String(address.email).trim();
  const Allowed_domain='@s.thers.ac.jp';
  if(check.endsWith(Allowed_domain)){
    const addressAuth=createClientForRequest(c);
    const { error: otpError } = await addressAuth.auth.signInWithOtp({email:check})
    if(otpError){
      console.error('コード送信失敗:', otpError);
      return c.html(
        <Layout title="送信に失敗しました" hideLogin>
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
    <Layout title="メールを確認してください" hideLogin>
      <h1>確認コードの入力</h1>
      <form method="post" action="/login/verify">
        <p class="otp-lead"><strong>{check}</strong> に確認コードを送りました。メールに届いた数字を入力してください。</p>
        <input type="hidden" name="email" value={check} />
        <div class="form-group">
          <label for="token">確認コード</label>
          <input type="text" id="token" name="token" class="form-control otp-input" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,10}" maxlength={10} required autofocus />
          <p class="form-hint">メールが届かないときは、迷惑メールフォルダも確認してください。</p>
        </div>
        <button type="submit" class="btn">ログイン</button>
      </form>
      <p class="otp-back"><a href="/login">メールアドレスを入力し直す</a></p>
    </Layout>
   )
  }
  else{
    return c.html(
      <Layout title="メールアドレスをご確認ください" hideLogin>
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

auth.post("/login/verify",async(c)=>{
  const body=await c.req.parseBody();
  const email=String(body.email);
  const token=String(body.token);
  const client=createClientForRequest(c);
  const {error}=await client.auth.verifyOtp({ email, token, type: 'email'})
  if (error) {
    console.error('コード検証失敗:', error);
    return c.html(
      <Layout title="コードをご確認ください" hideLogin>
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
  return c.redirect('/?flash=login');//ホームで「ログインしました」の帯を出す
})//cookieの検証


auth.post("/logout",async(c)=>{
  const client=createClientForRequest(c);
  await client.auth.signOut();
  return c.redirect("/?flash=logout");//ホームで「ログアウトしました」の帯を出す
})//ログアウト機能

export default auth;//ログイン・ログアウトのルート
