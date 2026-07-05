// サジェスト機能の作業用ファイル（本番には読み込まれない下書き）
// ここで普通のJSとして書き、動いたら index.tsx の html`<script>...</script>` に貼る。
// ① 要素を掴む（入力欄と候補箱を、それぞれ別の変数に）
// ② 入力を監視する（入力欄に 'input' イベントを付ける）
//   ③ デバウンス（250msくらい入力が止まってから実行する。setTimeout / clearTimeout）
//     ④ 取ってくる & 描画す
//        - 入力が空なら候補箱を空にして終了
//        - fetch('/api/suggest?q=' + encodeURIComponent(値)) → await res.json()
//        - 返った配列を <li> にして候補箱の innerHTML に入れる
// ⑤ 候補をクリックしたら入力欄に入れて候補箱を空にする（あとで。まずは④まで動かす）

const input = document.getElementById('search');
const list = document.getElementById('suggest-list');
let timer;                                    

input.addEventListener('input', () => {       
     clearTimeout(timer);
     timer = setTimeout(async () => {
          const q = input.value;
          if (q === '') {
               list.innerHTML = '';
               return;
          }
          const res = await fetch('/api/suggest?q=' + encodeURIComponent(q));
          const data = await res.json();
          list.innerHTML = data.map(item => '<li>' + item.class_name + '</li>').join('');
     }, 250);
});
list.addEventListener('click',(e)=>{
     input.value=e.target.textContext;
     list.innerHTML='';
})
