import { useCallback, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { getCurrentUserId } from "../utils/currentUser";

function NotificationsPage() {
  const userId = getCurrentUserId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(() => {
    if (!userId) {
      setError("Please login first to view notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    api
      .get("/api/notifications", { params: { userId } })
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to load notifications. Please retry."))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const id = setTimeout(() => {
      loadNotifications();
    }, 0);
    return () => clearTimeout(id);
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      setError("Unable to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await api.put("/api/notifications/read-all", null, {
        params: { userId },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setError("Unable to mark all notifications as read.");
    }
  };

  return (
    <div className="space-y-5">
      <section className="hub-card">
        <h1 className="hub-title">Notifications</h1>
        <p className="hub-subtitle">
          Stay updated with alerts from your campus bookings and tickets.
        </p>
      </section>

      {error && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={loadNotifications}
              className="hub-btn hub-btn-secondary !px-3 !py-1.5 !text-xs"
            >
              Retry
            </button>
          </div>
        </section>
      )}

      {userId && (
        <section className="flex items-center justify-end">
          <button onClick={markAllAsRead} className="hub-btn hub-btn-primary">
            Mark All Read
          </button>
        </section>
      )}

      {loading ? (
        <section className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="hub-card animate-pulse">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-5/6 rounded bg-slate-100" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
            </article>
          ))}
        </section>
      ) : notifications.length === 0 ? (
        <section className="hub-card">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No notifications yet.
          </p>
        </section>
      ) : (
        <section className="grid gap-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`hub-card ${notification.read ? "" : "border-sky-300 bg-sky-50/70 dark:bg-sky-900/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {notification.type || "Notification"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="hub-btn hub-btn-secondary !px-3 !py-1.5 !text-xs"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default NotificationsPage;
