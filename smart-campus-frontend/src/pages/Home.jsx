import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axiosInstance";
import { getCurrentUser, getCurrentUserId } from "../utils/currentUser";

function StatTile({ title, value }) {
  return (
    <article className="hub-card">
      <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <p className="mt-2 text-4xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </article>
  );
}

function Home() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = getCurrentUserId();
  const [stats, setStats] = useState({
    activeBookings: 0,
    openTickets: 0,
    unreadNotifications: 0,
    totalResources: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const requests = [api.get("/api/resources")];

    if (userId) {
      requests.push(api.get("/api/bookings/my", { params: { userId } }));
      requests.push(
        api.get("/api/tickets", { params: { reportedBy: userId } }),
      );
      requests.push(api.get("/api/notifications", { params: { userId } }));
    }

    Promise.allSettled(requests).then((result) => {
      const resources =
        result[0]?.status === "fulfilled" ? result[0].value.data || [] : [];

      if (!userId) {
        setStats((prev) => ({ ...prev, totalResources: resources.length }));
        return;
      }

      const bookings =
        result[1]?.status === "fulfilled" ? result[1].value.data || [] : [];
      const tickets =
        result[2]?.status === "fulfilled" ? result[2].value.data || [] : [];
      const notifications =
        result[3]?.status === "fulfilled" ? result[3].value.data || [] : [];

      setStats({
        totalResources: resources.length,
        activeBookings: bookings.filter(
          (b) => b.status !== "CANCELLED" && b.status !== "REJECTED",
        ).length,
        openTickets: tickets.filter(
          (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
        ).length,
        unreadNotifications: notifications.filter((n) => !n.read).length,
      });
      setRecentBookings(bookings.slice(0, 3));
    });
  }, [userId]);

  return (
    <div className="space-y-5">
      <section className="hub-card">
        <h1 className="hub-title">Dashboard Overview</h1>
        <p className="hub-subtitle">
          Track resources, bookings, tickets, and notifications from your home
          page.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Total Resources" value={stats.totalResources} />
        <StatTile title="Active Bookings" value={stats.activeBookings} />
        <StatTile title="Open Tickets" value={stats.openTickets} />
        <StatTile
          title="Unread Notifications"
          value={stats.unreadNotifications}
        />
      </section>

      <section className="hub-card">
        <div className="flex flex-wrap gap-3">
          <NavLink to="/resources" className="hub-btn hub-btn-primary">
            Browse Resources
          </NavLink>
          <NavLink to="/my-bookings" className="hub-btn hub-btn-secondary">
            View My Bookings
          </NavLink>
          <NavLink to="/tickets" className="hub-btn hub-btn-secondary">
            Open Tickets
          </NavLink>
          <NavLink to="/notifications" className="hub-btn hub-btn-secondary">
            Open Notifications
          </NavLink>
        </div>
      </section>

      <section className="hub-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Recent Bookings
          </h2>
          <NavLink to="/my-bookings" className="text-sm text-sky-700">
            View all
          </NavLink>
        </div>

        {!currentUser ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Login to see your booking details.
          </p>
        ) : recentBookings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            No bookings found yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {recentBookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800"
              >
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {booking.resourceId}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {booking.date} • {booking.startTime} - {booking.endTime}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
