import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import { css } from './styles.js'

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
                  <li>授業を修了した方はホームの<strong>「＋ 授業を登録」</strong>から、授業情報を登録してくださると大変助かります。</li>
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
          prev.addEventListener('click', function(){ if(i>0){ i--; modal.dataset.dir='prev'; render(); } });
          next.addEventListener('click', function(){ if(i<last){ i++; modal.dataset.dir='next'; render(); } });
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
