import{html} from 'hono/html'
import { TAG_GROUPS } from '../constants.js'

export const TagGroups=(props:{selected?:readonly string[]})=>(
  <>
    <div class="tag-groups">
      {TAG_GROUPS.map((group) => (
        <div class="tag-row">
          <span class="tag-row-label">{group.label}</span>
          <div class="tag-group" data-exclusive>
            {group.tags.map((tag) => (
              <label class="tag-chip"><input type="checkbox" name="tags" value={tag} checked={props.selected?.includes(tag) ?? false} /><span>{tag}</span></label>
            ))}
          </div>
        </div>
      ))}
    </div>
    {html`
      <script>
      document.querySelectorAll(".tag-group[data-exclusive]").forEach((group)=>{
        group.addEventListener("change",(e)=>{
          const picked=e.target;
          if(!picked||picked.name!=="tags"||!picked.checked){
            return;
          }
          group.querySelectorAll('input[name="tags"]').forEach((other)=>{
            if(other!==picked){
              other.checked=false;
            }
          });
        });
      });//同じ行のタグは1つまで。1つ選んだら同じ行のほかのタグを外す
      </script>
    `}
  </>
)//タグ選択の部品。検索欄と授業登録の両方で使う。行ごとにグループ名とタグを並べる
