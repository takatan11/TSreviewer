import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'

// 全ページ共通の外枠。各画面はこの中に children として差し込まれる。
// サイト共通の装飾（CSS）もここで一度だけ読み込む。
export const Layout = (props: { title: string; children: Child; user?: { email?: string | null } | null }) => (
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
              <span class="logo-mark">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.6" />
                  <g transform="rotate(18 12 12)">
                    <path d="M12 4.3 L14.4 12 L12 19.7 L9.6 12 Z" fill="currentColor" opacity="0.32" />
                    <path d="M12 4.3 L14.4 12 L9.6 12 Z" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.15" fill="currentColor" />
                  </g>
                </svg>
              </span>
              <span class="logo-text">単位の地図</span>
            </a>
            <nav class="site-nav">
              <a href="/new-class">授業を登録</a>
              {props.user ? (
                <form method="post" action="/logout" class="logout-form">
                  <button type="submit">ログアウト</button>
                </form>
              ) : (
                <a href="/login">ログイン</a>
              )}
            </nav>
          </div>
        </header>

        <main class="container">{props.children}</main>

        <footer class="site-footer">
          <div class="footer-inner">
            <a href="/contact" class="footer-link">お問い合わせ</a>
            <a href="/help" class="footer-link">ヘルプ</a>
            <a href="/privacy" class="footer-link">プライバシーポリシー</a>
            <span>© 2026 単位の地図</span>
          </div>
        </footer>

        {/* 初回ログイン時の注意事項モーダル（ログイン中のみ描画）。既定でhidden＝表示・ページ送りはJSで制御する */}
        {props.user && (
          <div id="notice-modal" class="notice-overlay" hidden>
            <div class="notice-card" role="dialog" aria-modal="true" aria-labelledby="notice-title">
              <div class="notice-page" data-page="0">
                <h2 id="notice-title" class="notice-head">単位の地図へようこそ</h2>
                <p>このサイトは、有志の岐阜大学学生が運営する<strong>非公式の授業レビューサイト</strong>です。みんなの口コミで、授業選びをもっとラクに。使い始める前に、いくつか注意事項の確認をお願いします。</p>
              </div>
              <div class="notice-page" data-page="1" hidden>
                <h2 class="notice-head">投稿のルール</h2>
                <ul>
                  <li><strong>誹謗中傷</strong>や、<strong>個人を特定する情報</strong>の書き込みはやめてください。</li>
                  <li>レビューはあくまで<strong>「個人の感想」</strong>です。事実と意見を分けて書きましょう。</li>
                  <li>ルールに反する投稿は、<strong>通報・削除</strong>、複数回の違反に対しては<strong>アカウント停止</strong>の対象となります。くれぐれもご注意ください。</li>
                </ul>
              </div>
              <div class="notice-page" data-page="2" hidden>
                <h2 class="notice-head">使うときの注意</h2>
                <ul>
                  <li>掲載内容の正確さについては、善処しますが、保証できません。<strong>最終的な判断はご自身で</strong>。</li>
                  <li>不適切な投稿を見つけたら、<strong>通報</strong>で教えてください。</li>
                  <li>削除・訂正のご依頼やご意見・ご要望は、<strong>お問い合わせ</strong>から受け付けています。</li>
                  
                </ul>
              </div>
              <div class="notice-page" data-page="3" hidden>
                <h2 class="notice-head">さいごに</h2>
                <ul>
                  <li>このサイトは皆様の善意の情報提供によって成り立っています。</li>
                  <li>授業を修了した方はサイト右上の<strong>授業を登録</strong>にて、授業情報を登録してくださると大変助かります。</li>
                  <li>レビューにも率直なご感想を書き込んでいただけますと幸いです。</li>
                  
                </ul>
              </div>

              <div class="notice-foot">
                <div class="notice-dots">
                  <span class="notice-dot is-on" data-dot="0"></span>
                  <span class="notice-dot" data-dot="1"></span>
                  <span class="notice-dot" data-dot="2"></span>
                  <span class="notice-dot" data-dot="3"></span>
                </div>
                <div class="notice-nav">
                  <button type="button" id="notice-prev" class="notice-arrow" aria-label="前へ" hidden>◂</button>
                  <button type="button" id="notice-next" class="notice-arrow" aria-label="次へ">▸</button>
                  <button type="button" id="notice-agree" class="btn notice-agree" hidden>同意して始める</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {props.user && raw(`
        <script>
        (function(){
          var KEY='notice_seen';
          try { if (localStorage.getItem(KEY)) return; } catch(e) {}
          var modal=document.getElementById('notice-modal'); if(!modal) return;
          var pages=modal.querySelectorAll('.notice-page');
          var dots=modal.querySelectorAll('.notice-dot');
          var prev=document.getElementById('notice-prev');
          var next=document.getElementById('notice-next');
          var agree=document.getElementById('notice-agree');
          var i=0, last=pages.length-1;
          function render(){
            for(var k=0;k<pages.length;k++){ pages[k].hidden = (k!==i); }
            for(var d=0;d<dots.length;d++){ dots[d].classList.toggle('is-on', d===i); }
            prev.hidden = (i===0);
            next.hidden = (i===last);
            agree.hidden = (i!==last);
          }
          prev.addEventListener('click', function(){ if(i>0){ i--; render(); } });
          next.addEventListener('click', function(){ if(i<last){ i++; render(); } });
          agree.addEventListener('click', function(){
            try { localStorage.setItem(KEY,'1'); } catch(e) {}
            modal.hidden=true;
          });
          modal.hidden=false;
          render();
        })();
        </script>
        `)}
      </body>
    </html>
  </>
)

const css = `
  :root {
    --bg: #fcfcfc;
    --surface: #ffffff;
    --surface-2: #f4f4f5;
    --text: #111113;
    --text-2: #6b6b73;
    --border: #ececee;
    --border-2: #dedee1;
    --accent: #4f46e5;
    --thumb-bg: #f4f4f5;
    --thumb-fg: #111113;
    --chip: #f4f4f5;
    --btn-bg: #111113;
    --btn-fg: #ffffff;
    --star: #e8a300;
    --radius: 6px;
    --maxw: 1080px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --surface: #121214;
      --surface-2: #1b1b1f;
      --text: #ededef;
      --text-2: #8a8a93;
      --border: #242428;
      --border-2: #2f2f35;
      --accent: #8b85f0;
      --thumb-bg: #1b1b1f;
      --thumb-fg: #ededef;
      --chip: #1b1b1f;
      --btn-bg: #ededef;
      --btn-fg: #09090b;
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
  h1, h2, h3 { margin: 0; font-weight: 700; letter-spacing: -0.02em; }

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
    border-radius: var(--radius);
  }
  .site-nav a:hover { background: var(--surface-2); }
  .logout-form { margin: 0; display: flex; }
  .logout-form button {
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-2);
    padding: 0.45rem 0.8rem;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    cursor: pointer;
  }
  .logout-form button:hover { background: var(--surface-2); color: var(--text); }

  /* ---- レイアウト ---- */
  .container { max-width: var(--maxw); margin: 1.75rem auto 3rem; padding: 0 1rem; }
  .container > h1 { font-size: 1.55rem; max-width: 620px; margin: 0 auto 1.1rem; letter-spacing: -0.025em; }
  .site-footer { border-top: 1px solid var(--border); color: var(--text-2); }
  .footer-inner {
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 1.5rem 1rem;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .footer-link { font-weight: 500; }
  .footer-link:hover { color: var(--text); text-decoration: underline; }

  /* ---- お問い合わせページ（静的・mailto） ---- */
  .contact-page { max-width: 620px; margin: 0 auto; }
  .contact-page h1 { font-size: 1.5rem; letter-spacing: -0.01em; margin-bottom: 0.9rem; }
  .contact-lead { color: var(--text); font-size: 0.95rem; margin: 0 0 1.3rem; }
  .contact-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.2rem 1.35rem;
    text-align: center;
  }
  .contact-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }
  .contact-mail {
    display: inline-block;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--accent);
    word-break: break-all;
  }
  .contact-mail:hover { text-decoration: underline; }
  .contact-note { color: var(--text-2); font-size: 0.8rem; margin: 0.7rem 0 0; }
  .contact-guide { margin-top: 1.6rem; }
  .contact-guide h2 {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-2);
    margin-bottom: 0.6rem;
  }
  .contact-guide ul { margin: 0; padding-left: 1.2rem; }
  .contact-guide li { font-size: 0.9rem; margin-bottom: 0.4rem; }
  .contact-page .back-link { max-width: none; margin: 1.8rem 0 0; }

  /* ---- 法的ページ（プライバシーポリシー等） ---- */
  .legal-page { max-width: 720px; margin: 0 auto; }
  .legal-page h1 { font-size: 1.5rem; letter-spacing: -0.01em; margin-bottom: 0.4rem; }
  .legal-updated { color: var(--text-2); font-size: 0.8rem; margin: 0 0 1.3rem; }
  .legal-lead { color: var(--text); font-size: 0.95rem; margin: 0 0 1.6rem; }
  .legal-section { margin-bottom: 1.5rem; }
  .legal-section h2 { font-size: 1rem; margin-bottom: 0.5rem; }
  .legal-section p { margin: 0; font-size: 0.9rem; color: var(--text); }
  .legal-section ul { margin: 0; padding-left: 1.2rem; }
  .legal-section li { font-size: 0.9rem; margin-bottom: 0.4rem; }
  .legal-inline-link { color: var(--accent); font-weight: 500; }
  .legal-inline-link:hover { text-decoration: underline; }
  .legal-page .back-link { max-width: none; margin: 2rem 0 0; }

  /* ---- 初回注意事項モーダル（3ページ・JSで表示/ページ送り） ---- */
  .notice-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
  .notice-overlay[hidden] { display: none; }
  .notice-card {
    width: 100%;
    max-width: 630px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.4rem 2.25rem 1.8rem;
    box-shadow: 0 18px 56px rgba(0, 0, 0, 0.3);
  }
  .notice-page { min-height: 13.5rem; }
  .notice-page[hidden] { display: none; }
  .notice-head { font-size: 1.7rem; margin-bottom: 1.05rem; }
  .notice-page p { margin: 0; font-size: 1.35rem; color: var(--text); }
  .notice-page ul { margin: 0; padding-left: 1.8rem; }
  .notice-page li { font-size: 1.35rem; margin-bottom: 0.8rem; color: var(--text); }
  /* フッターは縦積み・中央寄せ：ドットの下に、ページ送り矢印を中央下部へ配置 */
  .notice-foot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.3rem;
    margin-top: 1.8rem;
  }
  .notice-dots { display: flex; gap: 0.6rem; }
  .notice-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--border-2);
    transition: background 0.15s, transform 0.15s;
  }
  .notice-dot.is-on { background: var(--accent); transform: scale(1.15); }
  .notice-nav { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
  .notice-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    font-size: 1.65rem;
    line-height: 1;
    font-family: inherit;
    color: var(--text);
    background: var(--chip);
    border: 1px solid var(--border-2);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .notice-arrow:hover { background: var(--surface-2); border-color: var(--text-2); }
  .notice-arrow[hidden] { display: none; }
  .notice-agree[hidden] { display: none; }
  .notice-agree { height: 60px; padding: 0 1.8rem; font-size: 1.3rem; }

  /* ---- ホーム 検索 ---- */
  .home-hero { max-width: 720px; margin: 0 auto; }
  .home-title { font-size: 1.9rem; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 1.1rem; }
  .search-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
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
    border-radius: var(--radius);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-input { border-radius: var(--radius); padding-left: 1.1rem; }
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
    border-radius: var(--radius);
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
    border-radius: var(--radius);
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
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
    margin-top: 1.75rem;
  }
  .course-card { display: flex; }
  .thumb {
    width: 100%;
    min-height: 104px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
    padding: 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.4rem;
    overflow: hidden;
    transition: border-color 0.12s, background 0.12s;
  }
  .course-card:hover .thumb { border-color: var(--text-2); background: var(--surface-2); }
  .thumb-title {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: -0.01em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb-meta { font-size: 0.78rem; color: var(--text-2); margin-top: auto; }
  .empty-note { margin-top: 2rem; color: var(--text-2); text-align: center; }

  /* ---- フォーム（授業登録・レビュー） ---- */
  .form-card, form.new-class {
    max-width: 620px;
    margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
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
    border-radius: var(--radius);
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

  /* ---- タグ選択（チェックボックス式トグルボタン） ---- */
  .tag-field-label {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-2);
  }
  .tag-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .tag-group .tag-chip { position: relative; display: inline-flex; margin: 0; cursor: pointer; }
  /* チェックボックス本体は視覚的に隠す（form.new-class input より詳細度を高くして上書き） */
  .tag-chip input[type="checkbox"] {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
  }
  .tag-chip span {
    display: inline-flex;
    align-items: center;
    padding: 0.42rem 0.9rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text);
    background: var(--chip);
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .tag-chip span:hover { background: var(--surface-2); }
  .tag-chip input:checked + span {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface));
    border-color: color-mix(in srgb, var(--accent) 45%, var(--border-2));
  }
  .tag-chip input:focus-visible + span {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }

  /* ---- 授業詳細ページ ---- */
  .back-link { max-width: 800px; margin: 0 auto 1rem; }
  .back-link a { color: var(--text-2); font-size: 0.875rem; font-weight: 500; }
  .back-link a:hover { color: var(--text); }
  .subject-detail { max-width: 800px; margin: 0 auto; }
  .subject-detail h1 { font-size: 1.5rem; letter-spacing: -0.01em; margin-bottom: 0.7rem; }
  .detail-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .rating-summary { display: flex; align-items: baseline; gap: 0.55rem; margin-top: 0.85rem; }
  .rating-score { font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
  .rating-stars { color: var(--star); font-size: 1.05rem; letter-spacing: 1px; }
  .rating-count { color: var(--text-2); font-size: 0.85rem; }
  .rating-empty { color: var(--text-2); font-size: 0.9rem; margin-top: 0.85rem; }
  .badge {
    background: var(--chip);
    color: var(--text);
    padding: 0.32rem 0.8rem;
    border-radius: var(--radius);
    font-size: 0.78rem;
    font-weight: 500;
  }
  .detail-section {
    max-width: 800px;
    margin: 1rem auto 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
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
  .detail-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .detail-section-head h2 { margin-bottom: 0; }
  .head-controls { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .head-controls form { margin: 0; }
  .sort-select {
    appearance: none;
    height: 34px;
    padding: 0 2rem 0 0.9rem;
    font-size: 0.82rem;
    font-family: inherit;
    color: var(--text);
    background-color: var(--surface);
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M6 8 0 0h12z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    transition: border-color 0.15s;
  }
  .sort-select:hover { border-color: var(--text-2); }
  .sort-select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .btn-sm { height: 34px; padding: 0 1rem; font-size: 0.82rem; }
  .detail-text { margin: 0; }
  .detail-text a { color: var(--accent); font-weight: 500; margin-left: 0.4rem; }
  .slot-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .slot-item { background: var(--chip); border-radius: 8px; padding: 0.45rem 0.9rem; font-size: 0.9rem; font-weight: 500; }
  .review-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .review-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.9rem 1.05rem; }
  .review-score { color: var(--star); font-size: 0.95rem; letter-spacing: 2px; }
  .review-score-num { color: var(--text-2); font-size: 0.82rem; margin-left: 0.5rem; letter-spacing: normal; }
  .review-comment { margin: 0.4rem 0 0; white-space: pre-wrap; }
  /* 通報リンク：専用ページ(/report)へ飛ぶ、うっすら赤いピルボタン。右下に寄せる */
  .review-foot { display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.5rem; }
  /* 自分のレビューにだけ出す編集リンク。通報(赤)と並ぶので、こちらは中立グレーのピル */
  .edit-link {
    display: inline-flex;
    align-items: center;
    height: 30px;
    padding: 0 0.9rem;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-2);
    background: var(--chip);
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    transition: color 0.15s, border-color 0.15s;
  }
  .edit-link:hover { color: var(--accent); border-color: var(--accent); }
  /* 削除：自分のレビュー管理なので既定は編集と同じ中立グレー。破壊的操作なのでホバーで赤く警告 */
  .delete-form { display: inline-flex; margin: 0; }
  .delete-btn {
    display: inline-flex;
    align-items: center;
    height: 30px;
    padding: 0 0.9rem;
    font-size: 0.78rem;
    font-weight: 500;
    font-family: inherit;
    color: var(--text-2);
    background: var(--chip);
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .delete-btn:hover {
    color: #d93025;
    border-color: color-mix(in srgb, #d93025 45%, var(--border-2));
    background: color-mix(in srgb, #d93025 7%, transparent);
  }
  :root:not([data-theme="light"]) .delete-btn:hover { color: #ff6b5e; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .delete-btn:hover { color: #ff6b5e; } }
  .report-link {
    display: inline-flex;
    align-items: center;
    height: 30px;
    padding: 0 0.9rem;
    font-size: 0.78rem;
    font-weight: 500;
    color: #d93025;
    background: color-mix(in srgb, #d93025 8%, var(--surface));
    border: 1px solid color-mix(in srgb, #d93025 28%, var(--border));
    border-radius: var(--radius);
    transition: background 0.15s, border-color 0.15s;
  }
  .report-link:hover {
    background: color-mix(in srgb, #d93025 15%, var(--surface));
    border-color: color-mix(in srgb, #d93025 45%, var(--border));
  }
  /* ダークでは赤文字を少し明るくして可読性を確保（field-error と同じ方針） */
  :root:not([data-theme="light"]) .report-link { color: #ff6b5e; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .report-link { color: #ff6b5e; } }
  .report-subject { max-width: 800px; margin: 1rem auto 0; text-align: right; }

  /* ---- お礼／通知画面 ---- */
  .notice { max-width: 520px; margin: 3rem auto; text-align: center; }
  .notice h1 { font-size: 1.4rem; margin-bottom: 1.25rem; }
  .notice-sub { font-size: 0.95rem; font-weight: 500; color: var(--text-2); margin-bottom: 1.25rem; }
  .error-view { max-width: 520px; margin: 3rem auto; text-align: center; }
  .error-view h1 { font-size: 1.3rem; margin-bottom: 0.75rem; }
  .error-card {
    background: color-mix(in srgb, #d93025 8%, var(--surface));
    border: 1px solid color-mix(in srgb, #d93025 35%, var(--border));
    border-radius: var(--radius);
    padding: 1rem 1.15rem;
    color: var(--text);
    text-align: left;
    margin-bottom: 1.5rem;
  }
  .error-detail { color: var(--text-2); font-size: 0.85rem; margin: 0.4rem 0 0; word-break: break-word; }
  .form-hint { color: var(--text-2); font-size: 0.8rem; margin: 0.25rem 0 0; }
  .field-error { color: #d93025; font-size: 0.8rem; margin: 0.25rem 0 0; }
  :root:not([data-theme="light"]) .field-error { color: #ff6b5e; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .field-error { color: #ff6b5e; } }

  /* ---- レスポンシブ ---- */
  @media (max-width: 600px) {
    .search-row { flex-direction: column; }
    .search-row .btn { width: 100%; }
    .site-nav a { padding: 0.45rem 0.55rem; }
  }
`
