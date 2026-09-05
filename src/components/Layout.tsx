import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'

// 全ページ共通の外枠。各画面はこの中に children として差し込まれる。
// サイト共通の装飾（CSS）もここで一度だけ読み込む。
export const Layout = (props: { title: string; children: Child }) => (
  <>
    {raw('<!DOCTYPE html>')}
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{raw(css)}</style>
      </head>
      <body>
        <header class="site-header">
          <div class="header-inner">
            <a href="/" class="logo">
              <span class="logo-mark">R</span>
              <span class="logo-text">Reviewer</span>
            </a>
            <nav class="site-nav">
              <a href="/new-class">授業を登録</a>
              <a href="/registration">レビューを書く</a>
            </nav>
          </div>
        </header>

        <main class="container">{props.children}</main>

        <footer class="site-footer">
          <div class="footer-inner">© 2026 Reviewer</div>
        </footer>
      </body>
    </html>
  </>
)

const css = `
  :root {
    --bg: #f9f9f9;
    --surface: #ffffff;
    --surface-2: #f2f2f2;
    --text: #0f0f0f;
    --text-2: #606060;
    --border: #e5e5e5;
    --border-2: #d6d6d6;
    --accent: #065fd4;
    --thumb-bg: #e8edf3;
    --thumb-fg: #41576b;
    --chip: #f2f2f2;
    --btn-bg: #0f0f0f;
    --btn-fg: #ffffff;
    --star: #e8a300;
    --radius: 12px;
    --maxw: 1080px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0f0f0f;
      --surface: #1b1b1b;
      --surface-2: #272727;
      --text: #f1f1f1;
      --text-2: #a6a6a6;
      --border: #303030;
      --border-2: #3d3d3d;
      --accent: #3ea6ff;
      --thumb-bg: #26313f;
      --thumb-fg: #9fb7cc;
      --chip: #272727;
      --btn-bg: #f1f1f1;
      --btn-fg: #0f0f0f;
      --star: #ffcf4a;
    }
  }

  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    font-family: 'Roboto', 'Noto Sans JP', system-ui, sans-serif;
    color: var(--text);
    background: var(--bg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  h1, h2, h3 { margin: 0; font-weight: 700; }

  /* ---- ヘッダー ---- */
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .header-inner {
    max-width: var(--maxw);
    margin: 0 auto;
    height: 56px;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
  }
  .logo-mark {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--text);
    color: var(--surface);
    font-weight: 800;
    font-size: 1rem;
  }
  .site-nav { display: flex; align-items: center; gap: 0.25rem; }
  .site-nav a {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
  }
  .site-nav a:hover { background: var(--surface-2); }

  /* ---- レイアウト ---- */
  .container { max-width: var(--maxw); margin: 1.75rem auto 3rem; padding: 0 1rem; }
  .container > h1 { font-size: 1.35rem; max-width: 620px; margin: 0 auto 1.1rem; letter-spacing: -0.01em; }
  .site-footer { border-top: 1px solid var(--border); color: var(--text-2); }
  .footer-inner { max-width: var(--maxw); margin: 0 auto; padding: 1.5rem 1rem; font-size: 0.8rem; }

  /* ---- ホーム 検索 ---- */
  .home-hero { max-width: 720px; margin: 0 auto; }
  .home-title { font-size: 1.35rem; letter-spacing: -0.01em; margin-bottom: 1rem; }
  .search-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1rem;
  }
  .search-row { display: flex; gap: 0.6rem; align-items: stretch; }
  .search-group { position: relative; flex: 1; }
  .search-control {
    width: 100%;
    height: 42px;
    padding: 0 0.95rem;
    font-size: 0.95rem;
    font-family: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border-2);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-input { border-radius: 999px; padding-left: 1.1rem; }
  .search-control:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  .filter-row { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; }
  .filter-row .search-control { flex: 1; min-width: 140px; }
  select.search-control {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M6 8 0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
    padding-right: 2.2rem;
  }

  /* ---- ボタン ---- */
  .btn, .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.4rem;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: inherit;
    color: var(--btn-fg);
    background: var(--btn-bg);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s, transform 0.04s;
  }
  .btn:hover, .button:hover { opacity: 0.88; }
  .btn:active, .button:active { transform: translateY(1px); }
  #show-all {
    display: inline-flex;
    align-items: center;
    height: 38px;
    padding: 0 1.1rem;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    color: var(--text);
    background: var(--chip);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s;
  }
  #show-all:hover { background: var(--surface-2); }

  /* ---- サジェスト候補 ---- */
  .suggest-list {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    margin: 0;
    padding: 0.3rem;
    list-style: none;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 30;
    max-height: 17rem;
    overflow-y: auto;
  }
  .suggest-list:empty { display: none; }
  .suggest-list li { padding: 0.55rem 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
  .suggest-list li:hover { background: var(--surface-2); }

  /* ---- 授業カード（グリッド） ---- */
  .course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem 1rem;
    margin-top: 1.75rem;
  }
  .course-card { display: flex; }
  .thumb {
    width: 100%;
    min-height: 120px;
    border-radius: var(--radius);
    background: var(--thumb-bg);
    color: var(--thumb-fg);
    padding: 0.95rem 1.05rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.3rem;
    overflow: hidden;
    transition: transform 0.15s;
  }
  .course-card:hover .thumb { transform: translateY(-2px); }
  .thumb-title {
    font-size: 1.02rem;
    font-weight: 700;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb-meta { font-size: 0.8rem; opacity: 0.85; }
  .empty-note { margin-top: 2rem; color: var(--text-2); text-align: center; }

  /* ---- フォーム（授業登録・レビュー） ---- */
  .form-card, form.new-class {
    max-width: 620px;
    margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
  }
  form.new-class > div, .form-group { margin-bottom: 1.1rem; }
  form.new-class label, .form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-2);
  }
  .form-control, form.new-class input, form.new-class select {
    width: 100%;
    height: 42px;
    padding: 0 0.9rem;
    font-size: 0.95rem;
    font-family: inherit;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border-2);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  textarea.form-control { height: auto; min-height: 8rem; padding: 0.7rem 0.9rem; resize: vertical; }
  .form-control:focus, form.new-class input:focus, form.new-class select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  form.new-class select, select.form-control {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M6 8 0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
    padding-right: 2.2rem;
  }
  form.new-class .button, .form-card .btn { margin-top: 0.5rem; }

  /* ---- 授業詳細ページ ---- */
  .back-link { max-width: 800px; margin: 0 auto 1rem; }
  .back-link a { color: var(--text-2); font-size: 0.875rem; font-weight: 500; }
  .back-link a:hover { color: var(--text); }
  .subject-detail { max-width: 800px; margin: 0 auto; }
  .subject-detail h1 { font-size: 1.5rem; letter-spacing: -0.01em; margin-bottom: 0.7rem; }
  .detail-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .badge {
    background: var(--chip);
    color: var(--text);
    padding: 0.32rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 500;
  }
  .detail-section {
    max-width: 800px;
    margin: 1rem auto 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.2rem 1.35rem;
  }
  .detail-section h2 {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-2);
    margin-bottom: 0.75rem;
  }
  .detail-text { margin: 0; }
  .detail-text a { color: var(--accent); font-weight: 500; margin-left: 0.4rem; }
  .slot-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .slot-item { background: var(--chip); border-radius: 8px; padding: 0.45rem 0.9rem; font-size: 0.9rem; font-weight: 500; }
  .review-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .review-item { border: 1px solid var(--border); border-radius: 12px; padding: 0.9rem 1.05rem; }
  .review-score { color: var(--star); font-size: 0.95rem; letter-spacing: 2px; }
  .review-score-num { color: var(--text-2); font-size: 0.82rem; margin-left: 0.5rem; letter-spacing: normal; }
  .review-comment { margin: 0.4rem 0 0; white-space: pre-wrap; }

  /* ---- お礼／通知画面 ---- */
  .notice { max-width: 520px; margin: 3rem auto; text-align: center; }
  .notice h1 { font-size: 1.4rem; margin-bottom: 1.25rem; }

  /* ---- レスポンシブ ---- */
  @media (max-width: 600px) {
    .search-row { flex-direction: column; }
    .search-row .btn { width: 100%; }
    .site-nav a { padding: 0.45rem 0.55rem; }
  }
`
