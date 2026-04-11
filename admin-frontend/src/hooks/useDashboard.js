import { useState, useCallback } from "react";
import { fetchJson } from "../utils/api";

export const useDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalResources: 0,
    totalBookings: 0,
    activeResources: 0,
    cancelledBookings: 0,
    bookingsByBuilding: [],
    peakBookingHours: [],
  });
  const [adminUserId, setAdminUserId] = useState("");
  const [notificationUserId, setNotificationUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (userId) => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    setNotificationsLoading(true);
    try {
      const data = await fetchJson(
        `/api/notifications?userId=${encodeURIComponent(userId)}`,
      );
      setNotifications(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load notifications.");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const loadDashboardData = useCallback(
    async (resolver) => {
      setLoading(true);
      setError("");
      try {
        const usersData = await fetchJson("/api/auth/users");
        const bookingsData = await fetchJson("/api/bookings");
        const ticketsData = await fetchJson("/api/tickets");
        const analyticsData = await fetchJson("/api/analytics/dashboard");

        const safeUsers = Array.isArray(usersData) ? usersData : [];
        setUsers(safeUsers);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setAnalytics({
          totalResources: analyticsData?.totalResources ?? 0,
          totalBookings: analyticsData?.totalBookings ?? 0,
          activeResources: analyticsData?.activeResources ?? 0,
          cancelledBookings: analyticsData?.cancelledBookings ?? 0,
          bookingsByBuilding: Array.isArray(analyticsData?.bookingsByBuilding)
            ? analyticsData.bookingsByBuilding
            : [],
          peakBookingHours: Array.isArray(analyticsData?.peakBookingHours)
            ? analyticsData.peakBookingHours
            : [],
        });

        const resolvedAdminUserId = resolver(safeUsers);
        setAdminUserId(resolvedAdminUserId);
        setNotificationUserId((previous) => previous || resolvedAdminUserId);
      } catch (loadError) {
        setError(loadError.message || "Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    users,
    bookings,
    tickets,
    notifications,
    analytics,
    adminUserId,
    notificationUserId,
    loading,
    notificationsLoading,
    error,
    setAdminUserId,
    setNotificationUserId,
    setError,
    loadDashboardData,
    loadNotifications,
  };
};
