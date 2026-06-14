import type { Child } from 'hono/jsx'

// 全ページ共通の外枠。各画面はこの中に children として差し込まれる。
// サイト共通の装飾（CSS）もここで一度だけ読み込む。
export const Layout = (props: { title: string; children: Child }) => (
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{props.title}</title>
      <style>{css}</style>
    </head>
    <body>
      <header class="site-header">
        <a href="/" class="logo">Reviewer</a>
      </header>

      <main class="container">{props.children}</main>

      <footer class="site-footer">© 2026 Reviewer</footer>
    </body>
  </html>
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
`
