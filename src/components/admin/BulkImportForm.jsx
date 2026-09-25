import { previewBulkImportGames } from "@/lib/actions/schedule";
import { buttonClass } from "./ui";
export function BulkImportForm({ seasonId }) {
    const action = previewBulkImportGames.bind(null, seasonId);
    return (<form action={action} className="flex flex-col gap-3">
      <textarea name="scheduleText" rows={8} placeholder={"R1\t7PM EST\n\tSt Louis Archers\tNashville Blues  LS1\n\tBoston Bengals\tChicago Breeze  LS2"} className="w-full border border-ink/30 bg-surface p-3 font-mono text-xs focus:border-accent focus:outline-none"/>
      <p className="text-xs opacity-60">
        Paste the round text: a round line (&ldquo;R1&rdquo; + time), then one
        indented line per game (away team, tab, home team + location code). If a
        team name doesn&apos;t match exactly, you&apos;ll get a chance to pick the
        right team before anything is created.
      </p>
      <button type="submit" className={`${buttonClass} self-start`}>
        Preview Import
      </button>
    </form>);
}
