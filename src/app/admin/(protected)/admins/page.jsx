import { prisma } from "@/lib/prisma";
import { addAdmin, updateAdminRole, removeAdmin } from "@/lib/actions/admins";
import { setAdminPassword } from "@/lib/actions/auth";
import { Panel, Field, inputClass, buttonClass, buttonSecondaryClass } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">Admin Management</h1>

      <Panel title="Admins">
        <div className="mb-4 flex flex-col gap-2">
          {admins.map((admin) => {
            const updateRoleWithId = updateAdminRole.bind(null, admin.id);
            const setPasswordWithId = setAdminPassword.bind(null, admin.id);
            return (
              <div key={admin.id} className="flex flex-wrap items-center gap-3 border-b border-ink/10 py-2 text-sm">
                <span className="flex-1">
                  {admin.name} <span className="opacity-55">· @{admin.username} · {admin.email}</span>
                </span>
                <form action={updateRoleWithId} className="flex items-center gap-2">
                  <select name="role" defaultValue={admin.role} className={`${inputClass} !w-32`}>
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Update
                  </button>
                </form>
                <form action={setPasswordWithId} className="flex items-center gap-2">
                  <input type="password" name="password" placeholder="New password" minLength={8} className={`${inputClass} !w-36`} />
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Set Password
                  </button>
                </form>
                <form action={removeAdmin}>
                  <input type="hidden" name="adminId" value={admin.id} />
                  <button type="submit" className={`${buttonSecondaryClass} !text-[10px]`}>
                    Remove
                  </button>
                </form>
              </div>
            );
          })}
        </div>
        <form action={addAdmin} className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Username">
            <input name="username" required className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" required className={inputClass} />
          </Field>
          <Field label="Password">
            <input type="password" name="password" required minLength={8} className={inputClass} />
          </Field>
          <Field label="Role">
            <select name="role" defaultValue="EDITOR" className={inputClass}>
              <option value="OWNER">Owner</option>
              <option value="ADMIN">Admin</option>
              <option value="EDITOR">Editor</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button type="submit" className={buttonClass}>
              Add Admin
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
