"use client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RootError({ error, retry }) {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-start justify-center gap-4 px-14 py-20">
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="max-w-xl text-sm opacity-70">
          {error?.message || "An unexpected error occurred loading this page."}
        </p>
        <button
          onClick={() => retry()}
          className="bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-paper hover:opacity-80"
        >
          Try Again
        </button>
      </main>
      <Footer />
    </div>
  );
}
