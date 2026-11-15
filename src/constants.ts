//タグの一覧。「何についてのタグか」でグループ（行）に分けている。タグを足し引きするときはここだけ直す
//value＝DBに保存する値（全グループを通して重ならない名前にする）、label＝画面に出す短い名前
//multiple:trueの行は複数選べる。それ以外の行は1つまで
export const TAG_GROUPS=[
  {label:"難易度",tags:[{value:"楽単",label:"楽単"},{value:"普通",label:"普通"},{value:"難しい",label:"難しい"}]},
  {label:"課題の量",tags:[{value:"課題なし",label:"なし"},{value:"課題普通",label:"普通"},{value:"課題多い",label:"多い"}]},
  {label:"出席",tags:[{value:"出席とる",label:"とる"},{value:"出席とらない",label:"とらない"}]},
  {label:"評価方法",multiple:true,tags:[{value:"テスト",label:"テスト"},{value:"レポート",label:"レポート"},{value:"課題提出",label:"課題提出"}]},
  {label:"プレゼンテーション",tags:[{value:"プレゼンあり",label:"あり"},{value:"プレゼンなし",label:"なし"}]},
  {label:"オンデマンド",tags:[{value:"オンデマンドなし",label:"なし"},{value:"オンデマンド不定期",label:"不定期"},{value:"オンデマンド毎回",label:"毎回"}]},
  {label:"先生",tags:[{value:"先生優しい",label:"優しい"},{value:"先生厳しい",label:"厳しい"}]},
  {label:"雰囲気",tags:[{value:"面白い",label:"面白い"},{value:"つまらない",label:"つまらない"}]},
  {label:"内職",tags:[{value:"内職できる",label:"できる"},{value:"内職できない",label:"できない"}]},
  {label:"区分",tags:[{value:"必修",label:"必修"}]},
] as const;

export const Faculty=["教育学部","地域科学部","医学部","工学部","応用生物科学部","社会システム経営学環","全学共通教育"] as const
export const Department={
  "教育学部":["学校教育教員養成課程"],
  "地域科学部":["地域政策学科","地域文化学科"],
  "医学部":["医学科","看護学科"],
  "工学部":["社会基盤工学科","機械工学科","化学・生命工学科","電気電子コース","情報コース","応用物理コース"],
  "応用生物科学部":["応用生命科学課程","生産環境科学課程","共同獣医学科"],
  "社会システム経営学環":[],
  "全学共通教育":["人文科学","社会科学","自然科学","岐阜学","スポーツ・健康科学","英語","言語と文化","社会人リテラシー","数理・データサイエンス・AI"]
} as const
export const ALLOWED_TAGS:readonly string[]=TAG_GROUPS.flatMap((group)=>group.tags.map((tag)=>tag.value));//POSTのときの許可リスト。TAG_GROUPSから作っている

//授業登録の選択肢。フォームの<option>とPOSTの許可リストの両方でこの配列を使う
export const SEMESTERS=["前期","後期","通年"] as const;
export const DAYS=["月曜日","火曜日","水曜日","木曜日","金曜日","特別日程"] as const;
export const PERIODS=["1","2","3","4","5","6"] as const;
export const POINTS=["1","2"] as const;


export const ALLOWED_REPORT_REASONS=["誹謗中傷","個人情報","虚偽の情報","スパム","その他"] as const;//通報理由。通報フォームの選択肢とPOSTの許可リストの両方で使う

export const CONTACT_EMAIL="taninochizu.unei@gmail.com";//お問い合わせ先（運営用Gmail）
