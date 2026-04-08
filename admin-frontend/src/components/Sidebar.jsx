export function Sidebar({ activeTab, setActiveTab, sidebarItems, tabCounts }) {
  return (
    <aside className="hidden xl:flex xl:w-72 flex-col bg-slate-950 text-slate-100 sticky top-0 h-screen overflow-y-auto border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 grid place-items-center font-bold">
            SC
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
              Smart Campus
            </p>
            <h1 className="text-lg font-bold text-white leading-tight">
              Control Room
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">Operations dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[11px] px-2 uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2">
          Navigation
        </p>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-900/40"
                : "text-slate-200 hover:bg-slate-800/90"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                activeTab === item.id
                  ? "bg-white/25 text-white"
                  : "bg-slate-700 text-slate-100"
              }`}
            >
              {tabCounts[item.id] ?? 0}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <p className="text-xs text-slate-400 leading-relaxed">
          Designed for admin productivity
        </p>
      </div>
    </aside>
  );
}
