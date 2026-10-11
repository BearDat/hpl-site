import { previewBulkImportGames } from "@/lib/actions/schedule";
import { buttonClass } from "./ui";
export function BulkImportForm({ seasonId }) {
    const action = previewBulkImportGames.bind(null, seasonId);
    return (<form action={action} className="flex flex-col gap-3">
      <textarea name="scheduleText" rows={8} placeholder={"ROUND 1\nJailbirds @ AtlantaRebels 7PM LS1\nFirebirds @ NewYorkBombers 7PM LS2"} className="w-full border border-ink/30 bg-surface p-3 font-mono text-xs focus:border-accent focus:outline-none"/>
      <p className="text-xs opacity-60">
        Paste a round header (&ldquo;ROUND 1&rdquo;) followed by one line per
        game: &ldquo;Away @ Home TIME LOCATION&rdquo;. The old tab-indented
        format (round + shared time, then indented away/home/location lines)
        still works too. If a team name doesn&apos;t match, you&apos;ll get a
        chance to pick the right team before anything is created.
      </p>
      <button type="submit" className={`${buttonClass} self-start`}>
        Preview Import
      </button>
    </form>);
}
