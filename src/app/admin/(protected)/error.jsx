"use client";
export default function AdminError({ error, retry }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center gap-4 border-2 border-ink bg-surface p-6">
      <h2 className="font-display text-lg">Something went wrong</h2>
      <p className="max-w-xl text-sm opacity-80">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => retry()}
        className="bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-paper hover:opacity-80"
      >
        Try Again
      </button>
    </div>
  );
}
