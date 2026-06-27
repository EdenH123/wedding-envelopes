import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-stage-animated vignette relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <div className="mb-4 text-6xl animate-float-slow">💌</div>
        <h1 className="font-display text-5xl font-bold tracking-wide text-gold-shimmer sm:text-7xl">
          מופע המעטפות
        </h1>
        <p className="mt-4 text-lg text-white/70">
          חגיגת פתיחת מעטפות בחתונה 🎊
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <Link
            href="/admin"
            className="card-glass group flex flex-col items-center gap-2 p-8 transition hover:border-gold-500/50 hover:bg-white/[0.07]"
          >
            <span className="text-4xl transition group-hover:scale-110">🎛️</span>
            <span className="mt-2 text-xl font-bold text-white">ניהול</span>
            <span className="text-sm text-white/60">
              שליטה במופע מהטלפון
            </span>
          </Link>

          <Link
            href="/display"
            className="card-gold group flex flex-col items-center gap-2 p-8 transition hover:bg-gold-500/[0.12]"
          >
            <span className="text-4xl transition group-hover:scale-110">📺</span>
            <span className="mt-2 text-xl font-bold text-gold-gradient">תצוגה</span>
            <span className="text-sm text-white/60">
              להצגה על המסך הגדול / מקרן
            </span>
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/40">
          טיפ: פתחו את <span className="font-mono text-white/60">/display</span> בטלוויזיה ואת{" "}
          <span className="font-mono text-white/60">/admin</span> בטלפון.
        </p>
      </div>
    </main>
  );
}
