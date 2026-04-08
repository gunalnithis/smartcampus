import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { getCurrentUserId } from "../utils/currentUser";

function MyBookingsPage() {
  const navigate = useNavigate();
  const userId = getCurrentUserId();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resourcesLoading, setResourcesLoading] = useState(false);

  useEffect(() => {
    setError("");
    api
      .get("/api/bookings")
      .then((res) => setBookings(res.data))
      .catch(() => setError("Failed to load bookings"));
  }, []);

  useEffect(() => {
    setResourcesLoading(true);
    api
      .get("/api/resources")
      .then((res) => {
        const activeResources = Array.isArray(res.data)
          ? res.data.filter((r) => r.status === "ACTIVE")
          : [];
        setResources(activeResources);
      })
      .catch(() => setResources([]))
      .finally(() => setResourcesLoading(false));
  }, []);

  const cancelBooking = (booking) => {
    if (!userId) {
      setInfo("Login first to cancel your booking.");
      return;
    }

    if (booking.userId !== userId) {
      setInfo("You can only cancel your own booking.");
      return;
    }

    setInfo("");

    api
      .put(`/api/bookings/${booking.id}/cancel`)
      .then(() =>
        setBookings(
          bookings.map((b) =>
            b.id === booking.id ? { ...b, status: "CANCELLED" } : b,
          ),
        ),
      )
      .then(() => setInfo("Booking cancelled successfully."))
      .catch(() => setError("Failed to cancel booking."));
  };

  const statusColor = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const statusMatches =
          statusFilter === "ALL" || booking.status === statusFilter;

        if (!statusMatches) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable = [
          booking.resourceId,
          booking.userId,
          booking.date,
          booking.startTime,
          booking.endTime,
          booking.purpose,
          booking.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        const left = `${a.date || ""} ${a.startTime || ""}`;
        const right = `${b.date || ""} ${b.startTime || ""}`;
        return right.localeCompare(left);
      });
  }, [bookings, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="hub-card">
        <h1 className="hub-title">Bookings Hub</h1>
        <p className="hub-subtitle">
          View available resources from admin, check booking status, and manage
          your reservations.
        </p>
      </div>

      <div className="hub-card">
        <h2 className="hub-title text-lg mb-3">Available Resources to Book</h2>
        <p className="hub-subtitle text-sm mb-4">
          These resources are created by admin and ready for booking.
        </p>

        {resourcesLoading && (
          <p className="text-sm text-slate-500">Loading resources...</p>
        )}

        {resources.length === 0 && !resourcesLoading && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            No resources available at the moment.
          </p>
        )}

        {resources.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {resource.name}
                    </h4>
                    <p className="text-xs text-slate-500">{resource.type}</p>
                  </div>
                  <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 mb-3">
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {resource.location}
                  </p>
                  <p>
                    <span className="font-semibold">Capacity:</span>{" "}
                    {resource.capacity}
                  </p>
                  {resource.availableFrom && resource.availableTo && (
                    <p>
                      <span className="font-semibold">Hours:</span>{" "}
                      {resource.availableFrom} - {resource.availableTo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/book/${resource.id}`)}
                  className="hub-btn hub-btn-primary w-full text-sm"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hub-card">
        <h2 className="hub-title text-lg mb-3">All Booking Status</h2>
        <p className="hub-subtitle text-sm mb-4">
          View all booking statuses and manage your reservations.
        </p>

        {!userId && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            New users can still view all booking statuses. Login is only
            required for cancellation.
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </p>
        )}

        <div className="hub-card grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Search bookings
            </label>
            <input
              className="hub-input"
              type="text"
              placeholder="Search by resource, user, date, purpose, status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Status filter
            </label>
            <select
              className="hub-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredBookings.map((b) => (
            <article key={b.id} className="hub-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-serif text-2xl text-slate-900">
                  {b.resourceId}
                </h3>
                <span className={`hub-badge border ${statusColor[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">
                    Booked By:
                  </span>{" "}
                  {b.userId}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Date:</span>{" "}
                  {b.date}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Time:</span>{" "}
                  {b.startTime} - {b.endTime}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Purpose:</span>{" "}
                  {b.purpose || "-"}
                </p>
              </div>
              {b.status === "APPROVED" && b.userId === userId && (
                <button
                  onClick={() => cancelBooking(b)}
                  className="hub-btn hub-btn-danger mt-4"
                >
                  Cancel
                </button>
              )}
            </article>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            No bookings found for your search.
          </p>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;
