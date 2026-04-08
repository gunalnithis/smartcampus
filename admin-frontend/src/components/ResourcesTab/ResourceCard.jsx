export function ResourceCard({ resource, onEdit, onDelete }) {
  const statusColor =
    resource.status === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50/50"
      : "border-amber-200 bg-amber-50/50";

  return (
    <div
      className={`${statusColor} border rounded-xl p-4 shadow-sm hover:shadow-md transition`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-slate-900 text-lg">{resource.name}</h4>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            resource.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {resource.status === "ACTIVE" ? "🟢 Active" : "🟠 Out of Service"}
        </span>
      </div>

      <p className="text-slate-600 text-sm mb-3">
        {resource.description || "No description"}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <p className="text-slate-500 text-xs font-semibold">CAPACITY</p>
          <p className="text-slate-900 font-bold">{resource.capacity} people</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs font-semibold">LOCATION</p>
          <p className="text-slate-900 font-bold truncate">
            {resource.location}
          </p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm">
        <span>🕐</span>
        <span className="text-slate-600">
          {resource.availableFrom} - {resource.availableTo}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(resource)}
          className="flex-1 px-3 py-2 bg-sky-100 text-sky-700 font-semibold text-sm rounded-lg hover:bg-sky-200 transition"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(resource.id)}
          className="flex-1 px-3 py-2 bg-rose-100 text-rose-700 font-semibold text-sm rounded-lg hover:bg-rose-200 transition"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
