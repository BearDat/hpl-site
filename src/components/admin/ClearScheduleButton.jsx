"use client";
import { clearSchedule } from "@/lib/actions/schedule";
import { buttonSecondaryClass } from "./ui";
export function ClearScheduleButton({ seasonId }) {
    return (<form action={clearSchedule} onSubmit={(e) => {
            if (!window.confirm("Delete every regular-season game for this season? Playoff games aren't affected. This can't be undone.")) {
                e.preventDefault();
            }
        }}>
      <input type="hidden" name="seasonId" value={seasonId}/>
      <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
        Clear Schedule
      </button>
    </form>);
}
