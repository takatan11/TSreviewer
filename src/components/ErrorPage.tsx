import { Layout } from './Layout.js'

// エラー画面の共通部品。見出し・説明・戻り先だけ渡せば、他のエラー画面と同じ見た目になる
export const ErrorPage = (props: {
  title: string;
  message: string;
  detail?: string;
  backHref?: string;
  backLabel?: string;
  user?: { email?: string | null } | null;
}) => (
  <Layout title={props.title} user={props.user}>
    <div class="error-view">
      <h1>{props.title}</h1>
      <div class="error-card">
        <p>{props.message}</p>
        {props.detail && <p class="error-detail">{props.detail}</p>}
      </div>
      <p><a href={props.backHref ?? "/"} class="btn">{props.backLabel ?? "ホームに戻る"}</a></p>
    </div>
  </Layout>
)
