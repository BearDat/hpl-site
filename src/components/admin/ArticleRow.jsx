import { updateArticle, deleteArticle } from "@/lib/actions/news";
import { inputClass, buttonClass, buttonSecondaryClass } from "./ui";
export function ArticleRow({ article }) {
    const updateWithId = updateArticle.bind(null, article.id);
    return (<div className="border-b border-ink/10 py-4 last:border-b-0">
      <form action={updateWithId} encType="multipart/form-data" className="flex flex-col gap-2">
        <input name="title" defaultValue={article.title} className={`${inputClass} font-bold`}/>
        <textarea name="body" defaultValue={article.body} rows={3} className={inputClass}/>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="published" defaultChecked={article.published}/>
            Published
          </label>
          <label className="flex items-center gap-2 text-xs">
            Hero image:
            <input type="file" name="heroImage" accept="image/*" className="text-xs"/>
          </label>
          <button type="submit" className={`${buttonClass} !text-[10px]`}>
            Save
          </button>
        </div>
      </form>
      <form action={deleteArticle} className="mt-2">
        <input type="hidden" name="articleId" value={article.id}/>
        <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
          Delete Article
        </button>
      </form>
    </div>);
}
