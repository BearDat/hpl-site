import { prisma } from "@/lib/prisma";
import { createTeam } from "@/lib/actions/teams";
import { Panel, Field, inputClass, buttonClass } from "@/components/admin/ui";
import { TeamRow } from "@/components/admin/TeamRow";
export const dynamic = "force-dynamic";
export default async function TeamsPage() {
    const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
    return (<div>
      <h1 className="mb-6 font-display text-2xl">Team Management</h1>

      <Panel title="Create a Team">
        <form action={createTeam} encType="multipart/form-data" className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Field label="Name">
            <input name="name" required className={inputClass}/>
          </Field>
          <Field label="Short code">
            <input name="shortCode" required placeholder="RHK" className={inputClass}/>
          </Field>
          <Field label="Primary color">
            <input type="color" name="primaryColor" defaultValue="#101B45" className="h-9 w-full border border-ink/30"/>
          </Field>
          <Field label="Secondary color">
            <input type="color" name="secondaryColor" defaultValue="#F2F4FA" className="h-9 w-full border border-ink/30"/>
          </Field>
          <Field label="Logo">
            <input type="file" name="logo" accept="image/*" className="text-xs"/>
          </Field>
          <div className="col-span-2 flex items-end sm:col-span-5">
            <button type="submit" className={buttonClass}>
              Create Team
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Teams">
        {teams.map((team) => (<TeamRow key={team.id} team={team}/>))}
      </Panel>
    </div>);
}
