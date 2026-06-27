/**
 * Friendly full-screen notice shown when the Supabase env vars are missing, so
 * the app never just crashes with a blank screen during setup.
 */
export function SetupNotice() {
  return (
    <main className="bg-stage flex min-h-screen items-center justify-center p-6">
      <div className="card-glass max-w-lg p-8 text-center">
        <div className="mb-3 text-5xl">🔌</div>
        <h1 className="font-display text-3xl font-bold text-gold-gradient">
          כמעט סיימנו!
        </h1>
        <p className="mt-3 text-white/70">
          מופע המעטפות זקוק לפרטי ההתחברות ל-Supabase כדי לפעול.
        </p>
        <ol className="mt-5 space-y-2 text-start text-sm text-white/70">
          <li>
            1. העתיקו את{" "}
            <code dir="ltr" className="rounded bg-black/40 px-1.5 py-0.5 text-gold-200">.env.local.example</code>{" "}
            אל <code dir="ltr" className="rounded bg-black/40 px-1.5 py-0.5 text-gold-200">.env.local</code>
          </li>
          <li>
            2. מלאו את{" "}
            <code dir="ltr" className="rounded bg-black/40 px-1.5 py-0.5 text-gold-200">NEXT_PUBLIC_SUPABASE_URL</code> ואת{" "}
            <code dir="ltr" className="rounded bg-black/40 px-1.5 py-0.5 text-gold-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
          <li>3. הפעילו מחדש את שרת הפיתוח</li>
        </ol>
        <p className="mt-5 text-xs text-white/40">
          ראו את <code dir="ltr" className="text-white/60">README.md</code> למדריך ההתקנה המלא.
        </p>
      </div>
    </main>
  );
}
