import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getCurrentAdmin } from "@/lib/auth";
import { login } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage(props) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const { error } = await props.searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <Logo className="mb-6 h-10 w-auto" />
      <div className="w-full max-w-sm border-[3px] border-ink bg-surface p-8">
        <h1 className="mb-6 font-display text-xl">Admin Login</h1>
        {error && (
          <p className="mb-4 border border-accent-warm bg-accent-warm/10 px-3 py-2 text-sm text-accent-warm">
            {error}
          </p>
        )}
        <form action={login} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60">
              Username
            </span>
            <input
              name="username"
              required
              autoFocus
              className="w-full border border-ink/30 bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide opacity-60">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-ink/30 bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="mt-2 bg-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-paper hover:opacity-80"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
