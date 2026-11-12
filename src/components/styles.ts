// サイト全体の見た目（CSS）。Layout.tsx から読み込む
export const css = `
  :root {
    /* 背景は淡い青みグレー、中身は白いカード。カードと背景の明るさの差でまとまりを作る */
    --bg: #eef2f6;
    --surface: #ffffff;
    --surface-2: #f4f6f9;
    --text: #18212f;
    --text-2: #556070;
    --border: #dce2ea;
    --border-2: #d0d7e1;
    /* 入力欄・セレクト・タグなど“操作できる部品”の枠。背景に対し3:1以上（WCAG 1.4.11） */
    --control-border: #8592a3;
    --accent: #2563eb;
    /* 淡い青地の上に置く文字用の、一段濃い青（4.5:1以上を確保） */
    --accent-strong: #1d4ed8;
    --accent-soft: #e8effd;
    --thumb-bg: #ffffff;
    --thumb-fg: #18212f;
    --chip: #f1f4f8;
    --btn-bg: #2563eb;
    --btn-fg: #ffffff;
    --star: #b7791f;
    --radius: 8px;
    --radius-lg: 12px;
    --shadow: 0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.06);
    /* 全ページ共通の列幅。ヘッダー・本文・フッターの左端をそろえる */
    --maxw: 880px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0e131a;
      --surface: #161c25;
      --surface-2: #1d2430;
      --text: #e7ecf2;
      --text-2: #9aa6b6;
      --border: #28303c;
      --border-2: #323b49;
      --control-border: #6f7b8c;
      --accent: #7aa7ff;
      --accent-strong: #9cc0ff;
      --accent-soft: #1d2a44;
      --thumb-bg: #161c25;
      --thumb-fg: #e7ecf2;
      --chip: #1d2430;
      --btn-bg: #2563eb;
      --btn-fg: #ffffff;
      --star: #ffcf4a;
      --shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
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
    background: var(--accent);
    color: #ffffff;
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
  /* ページの題はカードの外・左端そろえ */
  .container > h1 { font-size: 1.6rem; margin: 0 0 1rem; letter-spacing: -0.025em; }
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
  .contact-page {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 1.5rem 1.6rem;
  }
  .contact-lead { color: var(--text); font-size: 0.95rem; margin: 0 0 1.3rem; }
  .contact-card {
    background: var(--surface-2);
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

  /* ---- 法的ページ（プライバシーポリシー等） ---- */
  .legal-page {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 1.5rem 1.6rem;
  }
  .legal-updated { color: var(--text-2); font-size: 0.8rem; margin: 0 0 1.3rem; }
  .legal-lead { color: var(--text); font-size: 0.95rem; margin: 0 0 1.6rem; }
  .legal-section { margin-bottom: 1.5rem; }
  .legal-section h2 { font-size: 1rem; margin-bottom: 0.5rem; }
  /* 長い文章は1行が長くなりすぎないようにする */
  .legal-section p, .legal-section li, .legal-lead { max-width: 44em; }
  .legal-section p { margin: 0 0 0.6rem; font-size: 0.9rem; color: var(--text); }
  .legal-section ul { margin: 0; padding-left: 1.2rem; }
  .legal-section li { font-size: 0.9rem; margin-bottom: 0.4rem; }
  .legal-inline-link { color: var(--accent); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }
  .legal-inline-link:hover { text-decoration: underline; }

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
    border: 1px solid var(--control-border);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .notice-arrow:hover { background: var(--surface-2); border-color: var(--text-2); }
  .notice-arrow[hidden] { display: none; }
  .notice-agree[hidden] { display: none; }
  .notice-agree { height: 60px; padding: 0 1.8rem; font-size: 1.3rem; }

  /* ---- ホーム 検索 ---- */
  .home-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 1rem; }
  .search-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 1.1rem 1.2rem;
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
    border: 1px solid var(--control-border);
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
  select.search-control:disabled {
    cursor: not-allowed;
    color: var(--text-2);
    background-color: var(--surface-2);
    border-color: var(--border-2);
  }/* 学科が無い・学部が未選択のときの学科欄。押せないことが見た目で分かるようにする */

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
  /* 枠線だけのボタン：主な操作（検索など）より一段控えめな操作に使う */
  .btn-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 1.2rem;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: inherit;
    color: var(--accent);
    background: var(--surface);
    border: 1px solid var(--control-border);
    border-radius: var(--radius);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-outline:hover { background: var(--accent-soft); border-color: var(--accent); }
  .btn-outline:active { transform: translateY(1px); }

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
  .list-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 2rem;
  }
  .list-heading { font-size: 1rem; display: flex; align-items: baseline; gap: 0.5rem; }
  .list-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent-strong);
    background: var(--accent-soft);
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
  }
  .course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
    margin-top: 0.9rem;
  }
  .course-card { display: flex; }
  .thumb {
    width: 100%;
    min-height: 104px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--thumb-bg);
    color: var(--thumb-fg);
    box-shadow: var(--shadow);
    padding: 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.4rem;
    overflow: hidden;
    transition: border-color 0.15s, background 0.15s, transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out);
  }
  .course-card:hover .thumb { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 24, 40, 0.1); }
  .course-card:hover .thumb-title { color: var(--accent-strong); }
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
  /* 検索結果が0件のとき：理由と次にできること（授業の登録）を1枚のカードで示す */
  .empty-state {
    margin-top: 0.9rem;
    padding: 1.6rem 1.4rem;
    text-align: center;
    background: var(--surface);
    border: 1px dashed var(--border-2);
    border-radius: var(--radius-lg);
  }
  .empty-note { margin: 0; color: var(--text-2); }
  .empty-sub { margin: 0.4rem 0 1rem; font-size: 0.85rem; color: var(--text-2); }

  /* ---- フォーム（授業登録・レビュー） ---- */
  /* フォームはカードにする（ログイン・確認コードのフォームも同じ見た目） */
  .form-card, form.new-class, .container > form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 1.5rem 1.6rem;
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
    border: 1px solid var(--control-border);
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
  /* タグのグループ：左にグループ名、右にそのグループのタグ。列をそろえて基準ごとに読めるようにする */
  .tag-groups { display: flex; flex-direction: column; gap: 0.6rem; }
  .tag-row {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    align-items: start;
    gap: 0.75rem;
  }
  .tag-row-label {
    padding-top: 0.45rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-2);
  }
  /* 検索欄のタグ絞り込み（折りたたみ） */
  .tag-filter { border-top: 1px solid var(--border); padding-top: 0.75rem; }
  .tag-filter-summary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-2);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .tag-filter-summary::-webkit-details-marker { display: none; }
  .tag-filter-summary::after {
    content: "▾";
    font-size: 0.8rem;
    transition: transform 0.15s;
  }
  .tag-filter[open] > .tag-filter-summary::after { transform: rotate(180deg); }
  .tag-filter-summary:hover { color: var(--text); }
  .tag-filter-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent-strong);
    background: var(--accent-soft);
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
  }
  .tag-filter-hint { margin: 0.6rem 0 0.6rem; font-size: 0.78rem; color: var(--text-2); }
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
    border: 1px solid var(--control-border);
    border-radius: var(--radius);
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.1s;
  }
  .tag-chip span:hover { background: var(--surface-2); }
  /* 選択中のタグは青で塗りつぶす（選ばれていることが一目で分かるように） */
  .tag-chip input:checked + span {
    color: var(--btn-fg);
    background: var(--btn-bg);
    border-color: var(--btn-bg);
  }
  .tag-chip input:focus-visible + span {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }

  /* ---- 授業詳細ページ ---- */
  /* パンくず：深い階層でも現在地と戻り先を画面に残す */
  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.9rem;
    font-size: 0.85rem;
    color: var(--text-2);
  }
  .breadcrumb a { color: var(--accent); font-weight: 500; }
  .breadcrumb a:hover { text-decoration: underline; }
  .crumb-sep { color: var(--border-2); }
  .crumb-current { color: var(--text); font-weight: 600; }
  .subject-detail { margin: 0 0 1.1rem; }
  .subject-detail h1 { font-size: 1.6rem; letter-spacing: -0.025em; margin-bottom: 0.3rem; }
  .detail-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .rating-summary { display: flex; align-items: baseline; gap: 0.55rem; margin-top: 0.4rem; }
  .rating-score { font-size: 2rem; font-weight: 700; line-height: 1; letter-spacing: -0.02em; }
  .rating-stars { color: var(--star); font-size: 1.05rem; letter-spacing: 1px; }
  .rating-count { color: var(--text-2); font-size: 0.85rem; }
  .rating-empty { color: var(--text-2); font-size: 0.9rem; margin: 0.2rem 0 0; }
  .detail-section {
    margin: 1rem 0 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    padding: 1.25rem 1.4rem;
  }
  /* カードの見出し：小さな灰色ではなく、本文より一段大きく濃い文字にして読みやすくする */
  .detail-section h2 {
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 0.8rem;
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
    border: 1px solid var(--control-border);
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
  /* 授業の情報：属性はラベル付きの項目として並べる（読むだけの表示なので枠やボタン風の見た目は付けない） */
  .info-about { margin-bottom: 1rem; }
  .info-list { margin: 0; border-top: 1px solid var(--border); }
  .info-row {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--border);
  }
  .info-row dt { font-size: 0.85rem; font-weight: 600; color: var(--text-2); }
  .info-row dd { margin: 0; font-size: 0.92rem; color: var(--text); }
  /* タグはリンク（押すとそのタグの授業一覧が開く）。押せることが分かるようアクセント色＋下線 */
  .tag-links { display: flex; flex-wrap: wrap; gap: 0.35rem 0.9rem; }
  .tag-link { color: var(--accent); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent); }
  .tag-link:hover { text-decoration-color: var(--accent); }
  .review-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .review-item { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.9rem 1.05rem; }
  /* 自分のレビューは左端の帯で示す（状態を見た目で表す） */
  .review-item.is-mine { border-left: 3px solid var(--accent); }
  .review-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
  .review-meta { display: flex; align-items: center; gap: 0.6rem; }
  .review-mine {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--accent-strong);
    background: var(--accent-soft);
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
  }
  .review-date { font-size: 0.8rem; color: var(--text-2); }
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
    border: 1px solid var(--control-border);
    border-radius: var(--radius);
    transition: color 0.15s, border-color 0.15s;
  }
  .edit-link:hover { color: var(--accent); border-color: var(--accent); }
  /* 破壊的な操作は日常の操作から離し、ページ末尾の赤枠にまとめる */
  .danger-zone {
    margin: 2rem 0 0;
    padding: 1.1rem 1.25rem;
    border: 1px solid color-mix(in srgb, #d93025 40%, var(--border));
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, #d93025 4%, var(--surface));
  }
  .danger-zone h2 { font-size: 0.95rem; margin-bottom: 0.35rem; color: #d93025; }
  .danger-zone p { margin: 0 0 0.9rem; font-size: 0.85rem; color: var(--text-2); }
  .danger-zone form { margin: 0; }
  .btn-danger {
    height: 38px;
    padding: 0 1.1rem;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: inherit;
    color: #ffffff;
    background: #d93025;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .btn-danger:hover { opacity: 0.9; }
  :root:not([data-theme="light"]) .danger-zone h2 { color: #ff6b5e; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .danger-zone h2 { color: #ff6b5e; } }
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
  .report-subject { margin: 1rem 0 0; text-align: right; }

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
  /* ---- アニメーション（状態の変化を伝えるためだけに使う。短く、透明度と位置だけを動かす） ---- */
  :root { --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1); }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes rise-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  @keyframes pop-in { from { opacity: 0; transform: translateY(8px) scale(0.97); } to { opacity: 1; transform: none; } }
  @keyframes slide-from-right { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
  @keyframes slide-from-left { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }

  /* 注意事項モーダル：背景が暗くなり、カードが少し持ち上がって現れる。ページ送りは進む向きにスライド */
  .notice-overlay:not([hidden]) { animation: fade-in 0.2s ease-out; }
  .notice-overlay:not([hidden]) .notice-card { animation: pop-in 0.24s var(--ease-out); }
  .notice-overlay[data-dir="next"] .notice-page:not([hidden]) { animation: slide-from-right 0.22s var(--ease-out); }
  .notice-overlay[data-dir="prev"] .notice-page:not([hidden]) { animation: slide-from-left 0.22s var(--ease-out); }

  /* タグ欄を開いたとき、中身が上から軽く下りてくる */
  .tag-filter[open] > :not(summary) { animation: rise-in 0.2s var(--ease-out); }

  /* 検索候補が出るとき */
  .suggest-list:not(:empty) { animation: rise-in 0.15s var(--ease-out); }

  /* 押した手応え */
  .tag-chip:active span { transform: scale(0.96); }
  .edit-link:active, .report-link:active, .btn-danger:active, .notice-arrow:active { transform: translateY(1px); }

  /* OSで「動きを減らす」を設定している人には、アニメーションを止める */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (max-width: 600px) {
    .search-row { flex-direction: column; }
    .search-row .btn { width: 100%; }
    .site-nav a { padding: 0.45rem 0.55rem; }
    .tag-row { grid-template-columns: 1fr; gap: 0.35rem; }
    .info-row { grid-template-columns: 1fr; gap: 0.15rem; }
    /* レビュー見出しと並び替え・ボタンは縦に並べる（見出しが折れないように） */
    .detail-section-head { flex-direction: column; align-items: flex-start; }
    .detail-section-head h2 { white-space: nowrap; }
    .tag-row-label { padding-top: 0; }
  }
`
