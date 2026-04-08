import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { getCurrentUser, getCurrentUserId } from "../utils/currentUser";

function StatCard({ title, value, icon, tone = "blue" }) {
  const toneClass = {
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-emerald-100 text-emerald-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[30px] leading-none font-semibold text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-lg text-slate-600">{title}</p>
        </div>
        <div className={`rounded-xl p-3 ${toneClass[tone] || toneClass.blue}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

function SidebarLink({ to, children, active = false }) {
  if (!to) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[27px] transition ${
          active
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-[27px] transition ${
          isActive || active
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = getCurrentUserId();

  const [activeBookings, setActiveBookings] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    if (!userId) return;

    Promise.allSettled([
      api.get("/api/bookings/my", { params: { userId } }),
      api.get("/api/tickets", { params: { reportedBy: userId } }),
      api.get("/api/notifications", { params: { userId } }),
    ]).then(([bookingsRes, ticketsRes, notificationsRes]) => {
      const bookings =
        bookingsRes.status === "fulfilled" ? bookingsRes.value.data || [] : [];
      const tickets =
        ticketsRes.status === "fulfilled" ? ticketsRes.value.data || [] : [];
      const notifications =
        notificationsRes.status === "fulfilled"
          ? notificationsRes.value.data || []
          : [];

      const activeCount = bookings.filter(
        (b) => b.status !== "CANCELLED" && b.status !== "REJECTED",
      ).length;
      const openTicketCount = tickets.filter(
        (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
      ).length;
      const unreadCount = notifications.filter((n) => !n.read).length;

      setActiveBookings(activeCount);
      setOpenTickets(openTicketCount);
      setUnreadNotifications(unreadCount);
      setRecentBookings(bookings.slice(0, 3));
    });
  }, [userId]);

  const fallbackBookings = [
    {
      id: "mock-1",
      resourceId: "Seminar Hall A",
      date: "2026-04-05",
      startTime: "09:00",
      endTime: "11:00",
      status: "APPROVED",
    },
    {
      id: "mock-2",
      resourceId: "Computer Lab 1",
      date: "2026-04-06",
      startTime: "14:00",
      endTime: "16:00",
      status: "PENDING",
    },
  ];

  const visibleBookings = recentBookings.length
    ? recentBookings
    : fallbackBookings;
  const userName = currentUser?.name || "Arun Kumar";

  const statusPillClass = (status) => {
    if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
    if (status === "PENDING") return "bg-amber-100 text-amber-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-[315px] flex-col border-r border-slate-200 bg-white xl:flex">
        <div className="border-b border-slate-200 p-7">
          <h1 className="text-4xl font-semibold text-slate-900">
            Smart Campus
          </h1>
          <p className="mt-1 text-[27px] text-slate-500">Operations Hub</p>
        </div>

        <div className="border-b border-slate-200 px-7 py-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-content-center rounded-full bg-slate-100 text-3xl">
              👨🏽‍💼
            </div>
            <div>
              <p className="text-[30px] font-medium text-slate-900">
                {userName}
              </p>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-base font-semibold text-slate-600">
                USER
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <SidebarLink to="/dashboard" active>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/resources">Resources</SidebarLink>
          <SidebarLink to="/my-bookings">My Bookings</SidebarLink>
          <SidebarLink to="/tickets">My Tickets</SidebarLink>
          <SidebarLink>Notifications</SidebarLink>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={logout}
            className="w-full rounded-xl px-4 py-3 text-left text-[27px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-8 lg:p-10">
        <header>
          <h2 className="text-5xl font-semibold text-slate-900">
            Welcome back, {userName}!
          </h2>
          <p className="mt-2 text-[33px] text-slate-500">
            Here&apos;s your campus overview
          </p>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <StatCard
            title="Active Bookings"
            value={activeBookings || 2}
            tone="blue"
            icon={<span className="text-xl">📅</span>}
          />
          <StatCard
            title="Open Tickets"
            value={openTickets || 2}
            tone="amber"
            icon={<span className="text-xl">🛠️</span>}
          />
          <StatCard
            title="Unread Notifications"
            value={unreadNotifications || 2}
            tone="green"
            icon={<span className="text-xl">🔔</span>}
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h3 className="text-3xl font-semibold text-slate-900">
              Recent Bookings
            </h3>
            <NavLink
              to="/my-bookings"
              className="text-[25px] text-slate-700 hover:text-slate-900"
            >
              View all
            </NavLink>
          </div>

          <div className="space-y-3 p-4">
            {visibleBookings.map((booking) => (
              <article
                key={booking.id}
                className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3"
              >
                <div>
                  <h4 className="text-[28px] font-medium text-slate-900">
                    {booking.resourceId}
                  </h4>
                  <p className="text-[23px] text-slate-500">
                    {booking.date} • {booking.startTime}-{booking.endTime}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-base font-semibold ${statusPillClass(booking.status)}`}
                >
                  {booking.status}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <NavLink
            to="/resources"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <p className="text-3xl font-semibold text-slate-900">
              Browse Resources
            </p>
            <p className="mt-1 text-[27px] text-slate-500">
              Find rooms, labs &amp; equipment
            </p>
          </NavLink>
          <NavLink
            to="/tickets"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <p className="text-3xl font-semibold text-slate-900">
              Report an Issue
            </p>
            <p className="mt-1 text-[27px] text-slate-500">
              Submit maintenance tickets
            </p>
          </NavLink>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
