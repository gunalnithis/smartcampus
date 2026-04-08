import { useEffect, useState } from "react";
import { Search, Users, X, Clock, Info, Building2 } from "lucide-react";
import api from "../api/axiosInstance";

const AUTO_REFRESH_MS = 15000;

const API_BASE_URL = (api.defaults.baseURL ?? "http://localhost:8081").replace(
  /\/$/,
  "",
);

const BACKEND_IMAGE_BY_TYPE = {
  LAB: `${API_BASE_URL}/uploads/resources/lab.jpg`,
  LECTURE_HALL: `${API_BASE_URL}/uploads/resources/lecture-hall.jpg`,
  MEETING_ROOM: `${API_BASE_URL}/uploads/resources/meeting-room.jpg`,
  EQUIPMENT: `${API_BASE_URL}/uploads/resources/equipment.jpg`,
};

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23e2e8f0"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient></defs><rect width="800" height="450" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23475569" font-family="Arial, sans-serif" font-size="32">Campus Resource</text></svg>';

const TYPE_LABELS = {
  LAB: "Lab",
  LECTURE_HALL: "Lecture Hall",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

const TYPE_ICONS = {
  LAB: "🧪",
  LECTURE_HALL: "🏫",
  MEETING_ROOM: "📊",
  EQUIPMENT: "⚙️",
};

const BUILDING_LABELS = {
  MAIN_BUILDING: "Main Building",
  NEW_BUILDING: "New Building",
  ENGINEERING_BUILDING: "Engineering Building",
  BUSINESS_BUILDING: "Business Building",
  WILLIAMS_BUILDING: "Williams Building",
};

const BUILDING_OPTIONS = [
  "MAIN_BUILDING",
  "NEW_BUILDING",
  "ENGINEERING_BUILDING",
  "BUSINESS_BUILDING",
  "WILLIAMS_BUILDING",
];

const detectBuilding = (resource) => {
  if (resource?.building && BUILDING_LABELS[resource.building]) {
    return resource.building;
  }

  const location = String(resource?.location || "").toLowerCase();
  if (location.includes("engineering")) return "ENGINEERING_BUILDING";
  if (location.includes("business")) return "BUSINESS_BUILDING";
  if (location.includes("williams")) return "WILLIAMS_BUILDING";
  if (location.includes("new")) return "NEW_BUILDING";
  return "MAIN_BUILDING";
};

const getResourceImage = (resource) => {
  if (resource.imageUrl) {
    if (resource.imageUrl.startsWith("http")) return resource.imageUrl;
    return `${API_BASE_URL}${resource.imageUrl}`;
  }
  return BACKEND_IMAGE_BY_TYPE[resource.type] ?? FALLBACK_IMAGE;
};

const formatAvailability = (resource) => {
  if (resource.availableFrom && resource.availableTo) {
    return `${resource.availableFrom} - ${resource.availableTo}`;
  }
  return "08:00 - 18:00";
};

// 🔥 Status Badge (IMPORTANT CHANGE)
const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-green-100 text-green-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-700",
    OCCUPIED: "bg-red-100 text-red-700",
    OUT_OF_SERVICE: "bg-red-100 text-red-700",
  };

  const labels = {
    ACTIVE: "AVAILABLE",
    MAINTENANCE: "MAINTENANCE",
    OCCUPIED: "OCCUPIED",
    OUT_OF_SERVICE: "OUT OF SERVICE",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

// 🔥 Card Component (Updated UI)
const ResourceCard = ({ resource, onViewDetails }) => {
  return (
    <div className="bg-slate-900/75 rounded-2xl border border-slate-700 p-5 shadow-xl shadow-slate-950/30 hover:-translate-y-0.5 hover:border-cyan-500/40 transition duration-200">
      <img
        src={getResourceImage(resource)}
        alt={resource.name ?? "Resource"}
        className="h-36 w-full rounded-lg object-cover mb-3"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />

      {/* Top Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-xl">{TYPE_ICONS[resource.type] ?? "🏢"}</div>

        <StatusBadge status={resource.status} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {TYPE_LABELS[resource.type] ?? resource.type ?? "Resource"}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-100">{resource.name}</h3>

      {/* Quick details only; full details are in the modal */}
      <div className="mt-3 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Users size={14} />
          Capacity: {resource.capacity ?? "N/A"}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => onViewDetails(resource)}
          className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-slate-600 text-slate-200 hover:bg-slate-800"
        >
          <Info size={15} />
          View Details
        </button>
      </div>
    </div>
  );
};

const LoadingSkeletonCard = () => (
  <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-5 shadow-sm animate-pulse">
    <div className="h-36 w-full rounded-lg bg-slate-700 mb-3" />
    <div className="flex justify-between items-center mb-3">
      <div className="h-6 w-8 bg-slate-700 rounded" />
      <div className="h-6 w-20 bg-slate-700 rounded-full" />
    </div>
    <div className="h-5 w-2/3 bg-slate-700 rounded mb-2" />
    <div className="h-4 w-full bg-slate-800 rounded mb-1" />
    <div className="h-4 w-5/6 bg-slate-800 rounded mb-3" />
    <div className="h-4 w-1/2 bg-slate-800 rounded mb-2" />
    <div className="h-4 w-1/3 bg-slate-800 rounded" />
    <div className="mt-4 h-10 w-full bg-slate-700 rounded-lg" />
  </div>
);

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeBuilding, setActiveBuilding] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setLoadError("");

    api
      .get("/api/resources", { timeout: 6000 })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setResources(data);
      })
      .catch(() => {
        setLoadError(
          "Could not refresh resources now. Showing the last loaded data.",
        );
      })
      .finally(() => setLoading(false));
  };

  // 🔥 Fetch API
  useEffect(() => {
    fetchResources();

    const intervalId = setInterval(() => {
      fetchResources({ silent: true });
    }, AUTO_REFRESH_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 🔍 Search filter
  const filtered = resources.filter(
    (r) =>
      `${r.name ?? ""} ${r.location ?? ""} ${r.description ?? ""}`
        .toLowerCase()
        .includes(searchText.toLowerCase()) &&
      (activeBuilding === "ALL" || detectBuilding(r) === activeBuilding),
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(6,182,212,0.18),transparent_24%),radial-gradient(circle_at_88%_8%,rgba(59,130,246,0.20),transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#020617_100%)]">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 mb-1">
            Campus Resources
          </h1>
          <p className="text-slate-300">
            Explore resources by building with live updates from admin.
          </p>
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg bg-amber-500/10 px-4 py-2 text-sm text-amber-200 border border-amber-500/40">
            <div className="flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <button
                onClick={fetchResources}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="bg-slate-900/70 rounded-2xl border border-slate-700 p-4 shadow-lg h-fit xl:sticky xl:top-24 backdrop-blur">
            <h2 className="text-sm uppercase tracking-[0.14em] font-bold text-slate-300 mb-3">
              Search
            </h2>
            <div className="flex items-center bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-600 w-full mb-5">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="ml-2 w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-400"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <X
                  size={16}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  onClick={() => setSearchText("")}
                />
              )}
            </div>

            <h2 className="text-sm uppercase tracking-[0.14em] font-bold text-slate-300 mb-3">
              Buildings
            </h2>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveBuilding("ALL")}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeBuilding === "ALL"
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                All Buildings ({resources.length})
              </button>
              {BUILDING_OPTIONS.map((buildingKey) => {
                const count = resources.filter(
                  (resource) => detectBuilding(resource) === buildingKey,
                ).length;

                return (
                  <button
                    key={buildingKey}
                    type="button"
                    onClick={() => setActiveBuilding(buildingKey)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                      activeBuilding === buildingKey
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    {BUILDING_LABELS[buildingKey]} ({count})
                  </button>
                );
              })}
            </div>
          </aside>

          <section>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Total
                </p>
                <p className="text-2xl font-bold text-slate-100">
                  {filtered.length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Active
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {filtered.filter((r) => r.status === "ACTIVE").length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Labs
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {filtered.filter((r) => r.type === "LAB").length}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Equipment
                </p>
                <p className="text-2xl font-bold text-violet-400">
                  {filtered.filter((r) => r.type === "EQUIPMENT").length}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingSkeletonCard key={index} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-10 text-center text-slate-300">
                No resources found for this filter.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onViewDetails={setSelectedResource}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="relative">
              <img
                src={getResourceImage(selectedResource)}
                alt={selectedResource.name ?? "Resource"}
                className="h-56 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute right-3 top-3 rounded-full bg-slate-950/90 p-2 text-slate-200 hover:bg-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-slate-100">
                  {selectedResource.name}
                </h3>
                <StatusBadge status={selectedResource.status} />
              </div>

              <p className="mb-5 text-slate-300">
                {selectedResource.description ||
                  "No detailed description available for this resource."}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Type
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {TYPE_ICONS[selectedResource.type] ?? "🏢"}{" "}
                    {TYPE_LABELS[selectedResource.type] ??
                      selectedResource.type}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Capacity
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {selectedResource.capacity ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Building
                  </p>
                  <p className="mt-1 font-semibold text-slate-100 inline-flex items-center gap-2">
                    <Building2 size={15} />
                    {BUILDING_LABELS[detectBuilding(selectedResource)]}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 font-semibold text-slate-100 inline-flex items-center gap-2">
                    <Building2 size={15} />
                    {selectedResource.location || "Campus"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Availability
                  </p>
                  <p className="mt-1 font-semibold text-slate-100 inline-flex items-center gap-2">
                    <Clock size={15} />
                    {formatAvailability(selectedResource)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
