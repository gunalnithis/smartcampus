import { StatCard } from "./StatCard";

export function Dashboard({ stats, loading, error }) {
  return (
    <div className="space-y-4">
      {loading && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-700 text-sm font-medium">
          ⏳ Loading data from backend...
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
}
