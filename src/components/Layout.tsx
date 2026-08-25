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
      <style>{raw(css)}</style>
    </head>
    <body>
      <header class="site-header">
        <a href="/" class="logo">Reviewer</a>
      </header>

      <main class="container">{props.children}</main>

      <footer class="site-footer">© 2026 Reviewer</footer>
    </body>
    </html>
  </>
)

// サイト全体に効く共通スタイル。装飾が増えたら public/style.css に移してもよい。
const css = `
  :root {
    --accent: #0066cc;
    --border: #e2e2e2;
    --text: #222;
    --muted: #777;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
    color: var(--text);
    line-height: 1.7;
    background: #fafafa;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: #fff;
    border-bottom: 1px solid var(--border);
  }
  .logo { font-weight: 700; font-size: 1.2rem; color: var(--text); }
  .site-nav a { margin-left: 1rem; }

  .container {
    max-width: 720px;
    margin: 2rem auto;
    padding: 0 1.25rem;
  }

  .site-footer {
    margin-top: 3rem;
    padding: 1.5rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
  }

  /* ---- フォーム ---- */
  .form-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .form-group {
    margin-bottom: 1.25rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text);
  }
  .form-control {
    width: 100%;
    padding: 0.65rem 0.85rem;
    font-size: 1rem;
    font-family: inherit;
    color: var(--text);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-control:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
  }
  textarea.form-control {
    resize: vertical;
    min-height: 7rem;
  }
  select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23777' d='M6 8 0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
    padding-right: 2.2rem;
  }

  /* ---- ボタン ---- */
  .btn {
    display: inline-block;
    padding: 0.65rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: #fff;
    background: var(--accent);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s;
  }
  .btn:hover { background: #0052a3; }
  .btn:active { transform: translateY(1px); }

  /* ---- 検索フォーム ---- */
  .search-card {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .search-group {
    position: relative;   /* 候補リストの浮かせる基準 */
    flex: 1;
  }
  .search-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .search-control {
    width: 100%;
    padding: 0.65rem 0.85rem;
    font-size: 1rem;
    font-family: inherit;
    color: var(--text);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-control:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
  }
  .search-card .btn {
    align-self: flex-end;   /* ボタンを入力欄の下端にそろえる */
  }

  /* ---- サジェスト候補 ---- */
  .suggest-list {
    position: absolute;
    top: calc(100% + 4px);   /* 入力欄のすぐ下 */
    left: 0;
    right: 0;
    margin: 0;
    padding: 0.25rem 0;
    list-style: none;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 20;
    max-height: 16rem;
    overflow-y: auto;
  }
  .suggest-list:empty {
    display: none;   /* 候補が無いときは箱ごと隠す */
  }
  .suggest-list li {
    padding: 0.5rem 0.85rem;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .suggest-list li:hover {
    background: #f0f6ff;
  }

  /* ---- 検索結果カード ---- */
  .course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .course-card {
    display: block;
    background: #fff;
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.1rem 1.25rem;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.05s;
  }
  .course-card:hover {
    text-decoration: none;
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .course-card:active { transform: translateY(1px); }

  /* ---- セレクトのプレースホルダー表示 ---- */
  /* 未選択（value="" の option が選ばれている）ときだけ薄い灰色にする */
  select:has(option[value=""]:checked) {
    color: var(--muted);
  }
  /* 実際の項目を選んだら通常の文字色に戻す */
  select option {
    color: var(--text);
  }
`
