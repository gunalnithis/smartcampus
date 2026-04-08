import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { getCurrentUser, getCurrentUserId } from "../utils/currentUser";

function UserProfilePage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = getCurrentUserId();

  const [profile, setProfile] = useState(currentUser);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    itNumber: currentUser?.itNumber || "",
    email: currentUser?.email || "",
    campusType: currentUser?.campusType || "COLOMBO",
    phoneNumber: currentUser?.phoneNumber || "",
  });
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError("");

    Promise.allSettled([
      api.get(`/api/auth/users/${userId}`),
      api.get("/api/bookings/my", { params: { userId } }),
    ])
      .then(([userRes, bookingRes]) => {
        if (userRes.status === "fulfilled") {
          const userData = userRes.value.data;
          setProfile(userData);
          setForm({
            name: userData?.name || "",
            itNumber: userData?.itNumber || "",
            email: userData?.email || "",
            campusType: userData?.campusType || "COLOMBO",
            phoneNumber: userData?.phoneNumber || "",
          });
          localStorage.setItem("currentUser", JSON.stringify(userData));
          localStorage.setItem("userId", userData.id);
        } else {
          setError("Unable to load latest profile details.");
        }

        if (bookingRes.status === "fulfilled") {
          const bookingData = Array.isArray(bookingRes.value.data)
            ? bookingRes.value.data
            : [];
          setBookings(bookingData);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const bookingStats = useMemo(() => {
    const approved = bookings.filter(
      (booking) => booking.status === "APPROVED",
    ).length;
    const pending = bookings.filter(
      (booking) => booking.status === "PENDING",
    ).length;
    const rejected = bookings.filter(
      (booking) => booking.status === "REJECTED",
    ).length;

    return {
      total: bookings.length,
      approved,
      pending,
      rejected,
    };
  }, [bookings]);

  const handleField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const startEdit = () => {
    setEditing(true);
    setInfo("");
    setError("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({
      name: profile?.name || "",
      itNumber: profile?.itNumber || "",
      email: profile?.email || "",
      campusType: profile?.campusType || "COLOMBO",
      phoneNumber: profile?.phoneNumber || "",
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!userId) {
      setError("User ID missing. Please login again.");
      return;
    }

    setSaving(true);
    setError("");
    setInfo("");

    try {
      const payload = {
        ...form,
        itNumber: form.itNumber.trim().toUpperCase(),
      };

      const { data } = await api.put(
        `/api/auth/users/${userId}/profile`,
        payload,
      );
      setProfile(data);
      localStorage.setItem("currentUser", JSON.stringify(data));
      localStorage.setItem("userId", data.id);
      setInfo("Profile updated successfully.");
      setEditing(false);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || !userId) {
    return <Navigate to="/login" replace />;
  }

  const statusPillClass = (status) => {
    if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
    if (status === "PENDING") return "bg-amber-100 text-amber-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    if (status === "CANCELLED") return "bg-slate-100 text-slate-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="hub-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="hub-title">My Profile</h1>
            <p className="hub-subtitle">
              Manage your personal details and review your booking activity.
            </p>
          </div>

          {!editing ? (
            <button onClick={startEdit} className="hub-btn hub-btn-primary">
              Edit Profile
            </button>
          ) : (
            <button onClick={cancelEdit} className="hub-btn hub-btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </section>

      <section className="hub-card">
        {loading && (
          <p className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Loading profile and bookings...
          </p>
        )}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {info}
          </p>
        )}

        <form onSubmit={saveProfile} className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Name
            <input
              className="hub-input"
              name="name"
              value={form.name}
              onChange={handleField}
              readOnly={!editing}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            IT Number
            <input
              className="hub-input"
              name="itNumber"
              value={form.itNumber}
              onChange={handleField}
              readOnly={!editing}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Email
            <input
              className="hub-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleField}
              readOnly={!editing}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Phone Number
            <input
              className="hub-input"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleField}
              readOnly={!editing}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Campus
            <select
              className="hub-select"
              name="campusType"
              value={form.campusType}
              onChange={handleField}
              disabled={!editing}
            >
              <option value="COLOMBO">Colombo</option>
              <option value="KANDY">Kandy</option>
              <option value="JAFFNA">Jaffna</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Role
            <input
              className="hub-input"
              value={profile?.role || "USER"}
              readOnly
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700 lg:col-span-2">
            Account ID
            <input className="hub-input" value={profile?.id || ""} readOnly />
          </label>

          <div className="flex flex-wrap gap-2 lg:col-span-2">
            {editing && (
              <button
                type="submit"
                className="hub-btn hub-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            )}
            <Link
              to="/resources"
              className="hub-btn hub-btn-secondary inline-flex"
            >
              Browse Resources
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="hub-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Bookings
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {bookingStats.total}
          </p>
        </article>
        <article className="hub-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Approved
          </p>
          <p className="mt-1 text-3xl font-semibold text-emerald-700">
            {bookingStats.approved}
          </p>
        </article>
        <article className="hub-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Pending
          </p>
          <p className="mt-1 text-3xl font-semibold text-amber-700">
            {bookingStats.pending}
          </p>
        </article>
        <article className="hub-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rejected
          </p>
          <p className="mt-1 text-3xl font-semibold text-red-700">
            {bookingStats.rejected}
          </p>
        </article>
      </section>

      <section className="hub-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-slate-900">
            Resource Booking History
          </h2>
          <Link
            to="/my-bookings"
            className="text-sm font-semibold text-sky-700 hover:text-sky-900"
          >
            Open My Bookings
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            No bookings yet. Start by booking a resource.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 8).map((booking) => (
              <article
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Resource ID: {booking.resourceId}
                  </p>
                  <p className="text-sm text-slate-600">
                    {booking.date} | {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Purpose: {booking.purpose || "-"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(booking.status)}`}
                >
                  {booking.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserProfilePage;
