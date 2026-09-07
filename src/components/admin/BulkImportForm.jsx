"use client";
import { useActionState } from "react";
import { bulkImportGames } from "@/lib/actions/schedule";
import { buttonClass } from "./ui";
export function BulkImportForm({ seasonId }) {
    const action = bulkImportGames.bind(null, seasonId);
    const [state, formAction, pending] = useActionState(action, null);
    return (<form action={formAction} className="flex flex-col gap-3">
      <textarea name="scheduleText" rows={8} placeholder={"R1\t7PM EST\n\tSt Louis Archers\tNashville Blues  LS1\n\tBoston Bengals\tChicago Breeze  LS2"} className="w-full border border-ink/30 bg-surface p-3 font-mono text-xs focus:border-accent focus:outline-none"/>
      <p className="text-xs opacity-60">
        Paste the round text: a round line (&ldquo;R1&rdquo; + time), then one
        indented line per game (away team, tab, home team + location code).
        Team names must match existing teams exactly.
      </p>
      <button type="submit" disabled={pending} className={`${buttonClass} self-start`}>
        {pending ? "Importing…" : "Import Games"}
      </button>
      {state && (<div className="border border-ink/20 bg-paper p-3 text-sm">
          <p className="font-bold">{state.createdCount} game(s) created.</p>
          {state.errors.length > 0 && (<ul className="mt-2 list-disc pl-5 text-[#c1391f]">
              {state.errors.map((err, i) => (<li key={i}>{err}</li>))}
            </ul>)}
        </div>)}
    </form>);
}
