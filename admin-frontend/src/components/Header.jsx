export function Header({ title, subtitle, onRefresh }) {
  const now = new Date();

  return (
    <div className="px-4 md:px-6 py-5 md:py-6 bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500 font-semibold">
            Admin Command Center
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            {title}
          </h2>
          <p className="text-slate-600 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden lg:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {now.toLocaleDateString()}
          </span>
          <span className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live Mode
          </span>
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
