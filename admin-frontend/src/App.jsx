import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

// Components
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { ResourcesTab } from "./components/ResourcesTab/ResourcesTab";
import { ResourceForm } from "./components/ResourcesTab/ResourceForm";

// Custom Hooks
import { useResources } from "./hooks/useResources";
import { useDashboard } from "./hooks/useDashboard";

// Utilities and Constants
import { SIDEBAR_ITEMS } from "./utils/constants";
import {
  getStoredUserId,
  isAdminUser,
  resolveAdminUserId,
} from "./utils/helpers";

// Data Table Component for displaying tabular data
function DataTable({ title, columns, rows, emptyText }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-6 py-8 text-slate-500 text-center">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left font-semibold text-slate-600 uppercase tracking-[0.08em] text-xs"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="border-b border-slate-200 hover:bg-slate-50/80"
                >
                  {columns.map((column) => {
                    const rawValue = row[column.key];
                    const value =
                      rawValue === null ||
                      rawValue === undefined ||
                      rawValue === ""
                        ? "-"
                        : rawValue;
                    return (
                      <td
                        key={`${row.id || rowIndex}-${column.key}`}
                        className="px-6 py-4 text-slate-800"
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("users");

  // Use custom hooks for resource and dashboard data management
  const {
    resources,
    resourceForm,
    editingResourceId,
    resourceBusy,
    resourceInfo,
    loadResources,
    handleResourceFieldChange,
    handleEditResource,
    handleDeleteResource,
    handleResourceSubmit,
    resetResourceForm,
  } = useResources();

  const {
    users,
    bookings,
    tickets,
    notifications,
    adminUserId,
    notificationUserId,
    loading,
    error,
    loadDashboardData,
    loadNotifications,
    setAdminUserId,
    setNotificationUserId,
  } = useDashboard();

  // Computed values
  const stats = useMemo(
    () => [
      { label: "Users", value: users.length, icon: "👥" },
      { label: "Resources", value: resources.length, icon: "📦" },
      { label: "Bookings", value: bookings.length, icon: "📅" },
      { label: "Tickets", value: tickets.length, icon: "🎫" },
      { label: "Notifications", value: notifications.length, icon: "🔔" },
    ],
    [users, resources, bookings, tickets, notifications],
  );

  const usersRows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  const ticketRows = tickets.map((ticket) => ({
    id: ticket.id,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    reportedBy: ticket.reportedByUserId,
    assignedTo: ticket.assignedToUserId,
    updatedAt: ticket.updatedAt,
  }));

  const notificationRows = notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    message: notification.message,
    read: notification.read ? "Read" : "Unread",
    createdAt: notification.createdAt,
  }));

  const adminUsers = useMemo(
    () => users.filter((user) => isAdminUser(user)),
    [users],
  );

  const bookingActors = useMemo(
    () => (adminUsers.length > 0 ? adminUsers : users),
    [adminUsers, users],
  );

  const tabCounts = useMemo(
    () => ({
      users: users.length,
      resources: resources.length,
      bookings: bookings.length,
      tickets: tickets.length,
      notifications: notifications.length,
    }),
    [users, resources, bookings, tickets, notifications],
  );

  const adminName = useMemo(
    () =>
      users.find((u) => u.id === adminUserId)?.name ||
      adminUserId?.slice(0, 8) ||
      "Unknown",
    [adminUserId, users],
  );

  const resolveActiveAdminId = useCallback(
    (safeUsers) =>
      resolveAdminUserId(safeUsers, [
        getStoredUserId(),
        adminUserId,
        notificationUserId,
      ]),
    [adminUserId, notificationUserId],
  );

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      loadDashboardData(resolveActiveAdminId),
      loadResources(),
    ]);
  }, [loadDashboardData, resolveActiveAdminId, loadResources]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    if (notificationUserId) {
      loadNotifications(notificationUserId);
    }
  }, [notificationUserId, loadNotifications]);

  // Get sidebar items with icons
  const sidebarItems = useMemo(
    () =>
      SIDEBAR_ITEMS.map((item) => ({
        ...item,
        icon: {
          users: "👥",
          resources: "📦",
          bookings: "📅",
          tickets: "🎫",
          notifications: "🔔",
        }[item.id],
      })),
    [],
  );

  return (
    <main className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarItems={sidebarItems}
        tabCounts={tabCounts}
      />

      {/* Main Content */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title="Campus Operations Dashboard"
          subtitle="Real-time operations overview"
          onRefresh={refreshDashboard}
        />

        <div className="xl:hidden border-b border-slate-200 bg-white/90 backdrop-blur px-3 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    activeTab === item.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tabCounts[item.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px] w-full">
            {/* Dashboard Stats */}
            <Dashboard stats={stats} loading={loading} error={error} />

            {/* Tab Content */}
            {activeTab === "users" && (
              <DataTable
                title="Users"
                columns={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "role", label: "Role" },
                ]}
                rows={usersRows}
                emptyText="No users found."
              />
            )}

            {activeTab === "resources" && (
              <ResourcesTab
                resources={resources}
                form={resourceForm}
                onChange={handleResourceFieldChange}
                onSubmit={handleResourceSubmit}
                onCancel={resetResourceForm}
                editing={Boolean(editingResourceId)}
                busy={resourceBusy}
                resourceInfo={resourceInfo}
                onEdit={handleEditResource}
                onDelete={(resourceId) =>
                  handleDeleteResource(resourceId, adminUserId)
                }
                adminUserId={adminUserId}
                adminName={adminName}
              />
            )}

            {activeTab === "bookings" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Create Booking Resource
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Create the resource here. If the status is Active, it will
                    appear on the frontend booking page.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Acting As
                  </label>
                  <select
                    value={adminUserId}
                    onChange={(e) => setAdminUserId(e.target.value)}
                    className="w-full md:w-64 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select admin user</option>
                    {bookingActors.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <ResourceForm
                  form={resourceForm}
                  onChange={handleResourceFieldChange}
                  onSubmit={(e) => handleResourceSubmit(e, adminUserId)}
                  onCancel={resetResourceForm}
                  editing={Boolean(editingResourceId)}
                  busy={resourceBusy}
                  resourceInfo={resourceInfo}
                  submitLabel="Create Booking"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
