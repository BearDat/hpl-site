import Link from "next/link";
import { updatePlayer } from "@/lib/actions/roster";
import { inputClass, buttonClass } from "./ui";
export function PlayerRow({ player, teams }) {
    const updateWithId = updatePlayer.bind(null, player.id);
    return (<form action={updateWithId} className="grid grid-cols-2 items-center gap-2 border-b border-ink/10 py-2 text-sm last:border-b-0 sm:grid-cols-12">
      <Link href={`/players/${player.slug}`} target="_blank" className="col-span-2 truncate font-bold hover:text-accent sm:col-span-2">
        {player.name}
      </Link>
      <input name="name" defaultValue={player.name} className={`${inputClass} col-span-2 sm:col-span-2`}/>
      <input name="position" defaultValue={player.position} className={`${inputClass} col-span-1 sm:col-span-1`}/>
      <select name="teamId" defaultValue={player.teamId ?? ""} className={`${inputClass} col-span-2 sm:col-span-2`}>
        <option value="">Free Agent</option>
        {teams.map((t) => (<option key={t.id} value={t.id}>
            {t.name}
          </option>))}
      </select>
      <select name="status" defaultValue={player.status} className={`${inputClass} col-span-1 sm:col-span-2`}>
        <option value="ACTIVE">Active</option>
        <option value="FREE_AGENT">Free Agent</option>
        <option value="RETIRED">Retired</option>
      </select>
      <input name="robloxId" defaultValue={player.robloxId ?? ""} placeholder="Roblox ID" className={`${inputClass} col-span-2 sm:col-span-2`}/>
      <div className="col-span-2 flex justify-end sm:col-span-1">
        <button type="submit" className={`${buttonClass} !px-2.5 !py-1.5 !text-[10px]`}>
          Save
        </button>
      </div>
    </form>);
}
