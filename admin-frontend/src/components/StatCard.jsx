export function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.1em]">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
        </div>
        <div className="text-2xl md:text-3xl rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1.5 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}
