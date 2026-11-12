import { Hono } from 'hono'
import { Layout } from '../components/Layout.js'
import { Breadcrumb } from '../components/Breadcrumb.js'
import { getCurrentUser } from '../auth.js'
import { CONTACT_EMAIL } from '../constants.js'

const pages=new Hono();

pages.get('/appriciate',async(c)=>{
  const user=await getCurrentUser(c);
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


pages.get("/contact",async(c)=>{
  const user=await getCurrentUser(c);
  const mailto=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("【単位の地図】お問い合わせ")}`;//件名を最初から入れておく
  return c.html(
    <Layout title="お問い合わせ" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "お問い合わせ" }]} />
      <h1>お問い合わせ</h1>
      <div class="contact-page">
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

      </div>
    </Layout>
  )
})//お問い合わせのページ。メールアドレスを載せるだけで、DBには保存しない


pages.get("/privacy",async(c)=>{
  const user=await getCurrentUser(c);
  return c.html(
    <Layout title="プライバシーポリシー" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "プライバシーポリシー" }]} />
      <h1>プライバシーポリシー</h1>
      <div class="legal-page">
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

      </div>
    </Layout>
  )
})//プライバシーポリシーのページ


pages.get("/help",async(c)=>{
  const user=await getCurrentUser(c);
  return c.html(
    <Layout title="ヘルプ" user={user}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "ヘルプ" }]} />
      <h1>ヘルプ</h1>
      <div class="legal-page">
        <p class="legal-lead">「単位の地図」の使い方と、よくある質問をまとめています。</p>

        <section class="legal-section">
          <h2>使い方</h2>
          <ul>
            <li><strong>授業を探す</strong>：ホームには登録済みの授業がすべて並びます。検索欄・学部・学科・タグで絞り込めます。</li>
            <li><strong>レビューを書く</strong>：ログイン後、授業ページの「レビューを書く」から、評価点・出席・感想を投稿できます。</li>
            <li><strong>レビューを編集・削除する</strong>：自分のレビューの「編集」から内容を直せます。削除は編集ページの一番下からできます。</li>
            <li><strong>授業を登録する</strong>：検索して見つからない授業は、ホームの「＋ 授業を登録」から追加できます。タグも付けられます。</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>よくある質問</h2>
          <p><strong>Q. ログインできません。</strong><br />
            大学が発行するメール（@s.thers.ac.jp）宛に届く確認コードで認証します。メールが届かない場合は、迷惑メールフォルダもご確認ください。</p>
          <p><strong>Q. 同じ授業に何度もレビューできますか？</strong><br />
            1つの授業につき、あなたのレビューは1件です。もう一度投稿すると、既存のレビューが更新（上書き）されます。</p>
          <p><strong>Q. 不適切な投稿を見つけました。</strong><br />
            各レビューの「通報」から運営に報告できます。確認のうえ対応します。</p>
          <p><strong>Q. 自分の投稿や情報を削除したいです。</strong><br />
            自分のレビューは、編集ページの一番下にある「このレビューを削除」から消せます。そのほかの削除・訂正のご依頼は、お問い合わせからご連絡ください。</p>
        </section>

        <section class="legal-section">
          <h2>解決しないときは</h2>
          <p><a href="/contact" class="legal-inline-link">お問い合わせページ</a>からご連絡ください。</p>
        </section>

      </div>
    </Layout>
  )
})//ヘルプのページ。使い方とよくある質問

export default pages;//お問い合わせ・プライバシーポリシー・ヘルプ・お礼のページのルート
