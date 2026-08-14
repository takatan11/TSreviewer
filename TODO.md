# Reviewer.js 作業メモ（オフライン用）

最終整理日: 2026-08-14

## ✈️ 機内でのローカルデバッグ手順（重要）
Supabaseはネット必須なので、**モックDBに切り替えて**オフラインで動作確認できるようにしてある。

1. `src/db/index.ts` の `const USE_MOCK = true` になっていることを確認（機内=true）。
   - `true`  … `src/db/mock.ts` の仮データで動く（ネット不要）
   - `false` … 本物のSupabaseに接続（通常はこちら）
2. `npm run dev` で起動 → http://localhost:3000
3. 検索・学部/学科絞り込み・サジェスト・カード表示がネットなしで動く。
4. 仮データを増やしたいときは `src/db/mock.ts` の `subjectData` 配列に追記。

### 帰宅後、元の構成に戻す方法（どちらでもよい）
- かんたん: `src/db/index.ts` の `USE_MOCK` を **false** に戻すだけ（mock.ts は残してOK）。
- 完全に消す: `git restore src/db/index.ts` して `src/db/mock.ts` を削除。
  （※搭乗前は working tree がクリーンなので、差分＝今回の仮変更だけ）

---

## ✅ 完成している部分
- ホーム `/`：検索欄・学部・学科・検索ボタンを1つのフォームに統合。
- 絞り込み検索：授業名=部分一致(`ilike`)、学部・学科=完全一致(`eq`)。DB側で絞り込み。
- サジェスト `/api/suggest`：入力に応じて候補表示、クリックで入力欄に反映。
- 検索結果カード：検索したときだけ表示。カードは `/subject/授業名` へリンク。
- レビュー登録 `/registration`：GET（フォーム表示）と POST（DB保存）が動作。
- オフライン用モックDB（`src/db/mock.ts` ＋ `USE_MOCK` スイッチ）。

---

## 🔨 作成中
### `/subject/:name`（授業ごとの詳細ページ）※未完成・要注意
- 現状（123〜126行）: `c.req.param('name')` は取得しているが、
  `supabase.from('').select('*').eq('class-name',name).single()` が
  **(1) テーブル名が空 '' (2) 列名が 'class-name'（正しくは class_name）
   (3) await していない (4) c.html を return していない**。
  → このページは今アクセスすると壊れる。次の形に直す:
  ```ts
  const name = c.req.param('name')
  const { data: subject, error } = await supabase
    .from('subject').select('*').eq('class_name', name).single()
  if (error || !subject) return c.text('授業が見つかりません', 404)
  return c.html(<Layout title={subject.class_name}> ... </Layout>)
  ```
- 詳細＋その授業のレビュー一覧＋コメント入力欄をこのページに置く。

### `/new-class`（新しい授業の登録）
- 画面（GET）はほぼ完成（授業名/開講時期/時限/学部/学科/曜日/単位数）。
- ただし時限・学部・学科・曜日・単位数の各 `<select>` に **`name` 属性が無い**
  → このままでは送信時に値が届かない。`name="period"` 等を付ける。
- **POST（201〜214行）が未完成**: `.from('')` テーブル名が空、`.insert()` が引数なし。
  ここが原因で tsc に型エラー1件（`.insert()` に引数が必要）が出る。実行(tsx)には影響なし。
  → `.from('subject').insert({ class_name: body.class_name, faculty: ..., depart: ..., ... })` の形にする。

### `/reviews`（すべての授業一覧）
- 現状（103〜107行）: `<h1>ここに全授業のカードを表示</h1>` のプレースホルダーのみ。
  → 全授業を取得してカード表示する。

---

## ⛔ 未解決の設計課題
1. **⚠️ レビューと授業の紐付けが未設計（最重要）**：
   `review` テーブルは `comment` と `score` だけ。「どの授業へのレビューか」を持っていない。
   → `review` に授業を指す列（例 `class_name` か `subject_id`）を追加し、
     登録フォームからその値も送って保存する。これが無いと詳細ページのレビュー一覧を作れない。
2. **登録フォームに講師名が無い**：以前あった `instructor` 欄が現在の `/registration` から消えている。
   必要なら復活させ、POST の insert にも含める。

---

## 進める順番のおすすめ
1. レビューと授業の紐付けを決める（設計課題1）。← DB設計なので機内でも紙で検討可。
2. `/subject/:name` の中身を実装（上の正しい形に直す）。
3. `/new-class` の各selectに `name` を付け、POST を完成させる。
4. `/reviews` を実装。

---

## メモ：属性の役割（混同しやすい点）
- `class` … CSS用。DBと無関係。
- `id` / `for` … ページ内でラベルと入力欄を結ぶ。1対1で固有に。
- `name` … 送信キー。サーバーで `body.○○` として受け取る。
- **DB列名を実際に書くのは Supabase メソッド引数だけ**
  （`.select()` / `.eq('列名',値)` / `.ilike('列名',...)` / `.insert({列名:値})`）。
- 学科の列名は `depart`（`department` ではない）。
