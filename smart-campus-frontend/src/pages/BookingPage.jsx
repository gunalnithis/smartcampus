import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Search,
  Sparkles,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const TYPE_LABELS = {
  LAB: "Lab",
  LECTURE_HALL: "Lecture Hall",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

const TYPE_BADGES = {
  LAB: "from-cyan-500/20 to-cyan-500/5 text-cyan-100 border-cyan-400/30",
  LECTURE_HALL:
    "from-indigo-500/20 to-indigo-500/5 text-indigo-100 border-indigo-400/30",
  MEETING_ROOM:
    "from-violet-500/20 to-violet-500/5 text-violet-100 border-violet-400/30",
  EQUIPMENT:
    "from-amber-500/20 to-amber-500/5 text-amber-100 border-amber-400/30",
};

const BUILDING_LABELS = {
  MAIN_BUILDING: "Main Building",
  NEW_BUILDING: "New Building",
  ENGINEERING_BUILDING: "Engineering Building",
  BUSINESS_BUILDING: "Business Building",
  WILLIAMS_BUILDING: "Williams Building",
};

const TYPE_ART = {
  LAB: "🧪",
  LECTURE_HALL: "🏫",
  MEETING_ROOM: "📊",
  EQUIPMENT: "⚙️",
};

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e293b"/></linearGradient></defs><rect width="800" height="450" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23e2e8f0" font-family="Arial, sans-serif" font-size="30">Campus Resource</text></svg>';

const getResourceImage = (resource) => {
  if (resource?.imageUrl) {
    if (resource.imageUrl.startsWith("http")) return resource.imageUrl;
    return `${API_BASE_URL}${resource.imageUrl}`;
  }

  const byType = {
    LAB: `${API_BASE_URL}/uploads/resources/lab.jpg`,
    LECTURE_HALL: `${API_BASE_URL}/uploads/resources/lecture-hall.jpg`,
    MEETING_ROOM: `${API_BASE_URL}/uploads/resources/meeting-room.jpg`,
    EQUIPMENT: `${API_BASE_URL}/uploads/resources/equipment.jpg`,
  };

  return byType[resource?.type] ?? FALLBACK_IMAGE;
};

const formatAvailability = (resource) => {
  if (resource?.availableFrom && resource?.availableTo) {
    return `${resource.availableFrom} - ${resource.availableTo}`;
  }
  return "08:00 - 18:00";
};

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

function ResourceCard({ resource, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(resource.id)}
      className={`group text-left overflow-hidden rounded-3xl border transition duration-200 ${
        selected
          ? "border-cyan-400/60 bg-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_20px_60px_rgba(15,23,42,0.45)]"
          : "border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-white/10"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={getResourceImage(resource)}
          alt={resource.name ?? "Resource"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 backdrop-blur">
          {TYPE_ART[resource.type] ?? "🏢"}
          {TYPE_LABELS[resource.type] ?? resource.type ?? "Resource"}
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-400/20 backdrop-blur">
          Active
        </div>
      </div>

      <div className="space-y-4 p-4 text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {resource.name}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              {resource.description || "Available for booking"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-2 text-center ring-1 ring-inset ring-white/10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Seats
            </p>
            <p className="text-lg font-bold text-cyan-200">
              {resource.capacity ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2">
            <Building2 size={14} className="text-cyan-300" />
            {BUILDING_LABELS[detectBuilding(resource)]}
          </div>
          <div className="inline-flex items-center gap-2">
            <MapPin size={14} className="text-cyan-300" />
            {resource.location || "Campus"}
          </div>
          <div className="inline-flex items-center gap-2 sm:col-span-2">
            <Clock3 size={14} className="text-cyan-300" />
            {formatAvailability(resource)}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          <span>Tap to book</span>
          <span className={selected ? "text-cyan-200" : "text-slate-400"}>
            {selected ? "Selected" : "View"}
          </span>
        </div>
      </div>
    </button>
  );
}

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState(id || "");
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  useEffect(() => {
    setSelectedResourceId(id || "");
  }, [id]);

  const loadActiveResources = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resources`, {
        withCredentials: true,
      });
      const list = Array.isArray(res.data) ? res.data : [];
      const activeOnly = list.filter((item) => item.status === "ACTIVE");
      setResources(activeOnly);

      setSelectedResourceId((previousId) => {
        if (previousId && activeOnly.some((item) => item.id === previousId)) {
          return previousId;
        }
        if (id && activeOnly.some((item) => item.id === id)) {
          return id;
        }
        return activeOnly[0]?.id || "";
      });
    } catch {
      setResources([]);
    }
  }, [id]);

  useEffect(() => {
    loadActiveResources();
    const intervalId = setInterval(loadActiveResources, 10000);
    return () => clearInterval(intervalId);
  }, [loadActiveResources]);

  useEffect(() => {
    if (!selectedResourceId) {
      setResource(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/resources/${selectedResourceId}`, {
        withCredentials: true,
      })
      .then((res) => setResource(res.data))
      .catch(() => setErrorMessage("Failed to load resource details."))
      .finally(() => setLoading(false));
  }, [selectedResourceId]);
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date || !selectedResourceId) {
        setAvailableSlots([]);
        return;
      }

      try {
        setSlotsLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/bookings/available-slots`,
          {
            params: {
              resourceId: selectedResourceId,
              date: formData.date,
            },
            withCredentials: true,
          },
        );

        const slots = Array.isArray(res?.data?.slots) ? res.data.slots : [];
        setAvailableSlots(
          slots.map((slot) => ({
            ...slot,
            available:
              slot.available === true ||
              String(slot.available).toLowerCase() === "true",
          })),
        );
      } catch {
        setAvailableSlots([]);
        setErrorMessage("Could not load time-slot availability for this date.");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [formData.date, selectedResourceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "date") {
        next.startTime = "";
        next.endTime = "";
      }
      if (name === "startTime") {
        next.endTime = "";
      }
      return next;
    });
  };

  const getStoredUserId = () => {
    const raw = localStorage.getItem("userId");
    if (!raw) return "";

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "string") return parsed;
      if (parsed?.userId) return parsed.userId;
      if (parsed?.id) return parsed.id;
      return raw;
    } catch {
      return raw;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const { date, startTime, endTime, purpose, expectedAttendees } = formData;

    if (!date || !startTime || !endTime || !purpose || !expectedAttendees) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const allowed = availableSlots.some(
      (slot) =>
        slot.available &&
        slot.startTime === startTime &&
        slot.endTime === endTime,
    );

    if (!allowed) {
      setErrorMessage(
        "Selected time slot is no longer available. Please choose another slot.",
      );
      return;
    }

    if (endTime <= startTime) {
      setErrorMessage("End time must be after start time.");
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      setErrorMessage("User is not logged in. Please login again.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        resourceId: selectedResourceId,
        userId,
        date,
        startTime,
        endTime,
        purpose,
        expectedAttendees: Number(expectedAttendees),
      };

      const res = await axios.post(`${API_BASE_URL}/api/bookings`, payload, {
        withCredentials: true,
      });
      const approved =
        res?.data?.status === "APPROVED" ||
        res?.status === 201 ||
        res?.status === 200;

      if (approved) {
        setSuccessMessage(
          "Booking approved successfully! Redirecting to My Bookings...",
        );
      } else {
        setSuccessMessage(
          "Booking submitted successfully! Redirecting to My Bookings...",
        );
      }

      setTimeout(() => navigate("/my-bookings"), 1200);
    } catch (err) {
      const status = err?.response?.status;
      const backendMessage = String(
        err?.response?.data?.message || "",
      ).toLowerCase();

      if (status === 409 || backendMessage.includes("conflict")) {
        setErrorMessage(
          "Booking failed: selected time slot conflicts with an existing booking.",
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message ||
            "Failed to create booking. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectResource = (resourceId) => {
    setSelectedResourceId(resourceId);
    setFormData((prev) => ({
      ...prev,
      date: "",
      startTime: "",
      endTime: "",
    }));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_40%,#020617_100%)] px-4 py-6 md:px-6 md:py-8">
      <div className="w-full">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur">
            <div className="relative p-6 md:p-8">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute left-16 top-6 h-20 w-20 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="relative flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles size={14} />
                Smart Campus Booking
              </div>
              <h1 className="relative mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
                Book active campus resources
              </h1>
              <p className="relative mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Admin-created resources appear here automatically when they are
                marked Active. Pick a room, review its details, and reserve a
                valid time slot.
              </p>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Active resources
                  </p>
                  <p className="mt-1 text-2xl font-bold text-cyan-200">
                    {resources.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Selected type
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {resource?.type
                      ? (TYPE_LABELS[resource.type] ?? resource.type)
                      : "Choose one"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Availability
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-300">
                    {resource ? formatAvailability(resource) : "Ready"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.35)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Available Resources
                </h2>
                <p className="text-sm text-slate-400">
                  Admin-created active resources appear here for booking.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <Search size={14} />
                Live list
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[340px] animate-pulse rounded-3xl border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-slate-300">
                No active resources are available for booking yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {resources.map((item) => (
                  <ResourceCard
                    key={item.id}
                    resource={item}
                    selected={item.id === selectedResourceId}
                    onSelect={handleSelectResource}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default BookingPage;
