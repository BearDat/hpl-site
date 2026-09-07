import { updateTeam, deleteTeam } from "@/lib/actions/teams";
import { inputClass, buttonClass, buttonSecondaryClass } from "./ui";
export function TeamRow({ team }) {
    const updateWithId = updateTeam.bind(null, team.id);
    return (<div className="flex flex-col gap-3 border-b border-ink/10 py-4 last:border-b-0 sm:flex-row sm:items-center">
      {team.logoUrl ? (
        // Arbitrary user-uploaded dimensions; skip the built-in image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logoUrl} alt={team.name} className="h-10 w-10 flex-shrink-0 object-contain"/>) : (<div className="h-10 w-10 flex-shrink-0" style={{ background: team.primaryColor }}/>)}
      <form action={updateWithId} encType="multipart/form-data" className="grid flex-1 grid-cols-2 items-center gap-2 sm:grid-cols-7">
        <input name="name" defaultValue={team.name} className={`${inputClass} sm:col-span-2`}/>
        <input name="shortCode" defaultValue={team.shortCode} className={inputClass}/>
        <input type="color" name="primaryColor" defaultValue={team.primaryColor} className="h-9 w-full border border-ink/30"/>
        <input type="color" name="secondaryColor" defaultValue={team.secondaryColor ?? "#ffffff"} className="h-9 w-full border border-ink/30"/>
        <input type="file" name="logo" accept="image/*" className="text-xs sm:col-span-1"/>
        <button type="submit" className={`${buttonClass} !text-[10px]`}>
          Save
        </button>
      </form>
      <form action={deleteTeam}>
        <input type="hidden" name="teamId" value={team.id}/>
        <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
          Delete
        </button>
      </form>
    </div>);
}
