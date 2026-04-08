import { NavLink } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="space-y-5">
      <div className="hub-card">
        <h1 className="hub-title">Admin Dashboard</h1>
        <p className="hub-subtitle">
          Manage campus operations, review approvals, and monitor service
          health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="hub-card">
          <p className="text-sm text-slate-500">Pending Bookings</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">0</p>
        </article>
        <article className="hub-card">
          <p className="text-sm text-slate-500">Open Tickets</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">0</p>
        </article>
        <article className="hub-card">
          <p className="text-sm text-slate-500">Active Resources</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">0</p>
        </article>
      </div>

      <div className="hub-card flex flex-wrap gap-3">
        <NavLink to="/resources" className="hub-btn hub-btn-secondary">
          View Resources
        </NavLink>
        <NavLink to="/tickets" className="hub-btn hub-btn-primary">
          Manage Tickets
        </NavLink>
      </div>
    </div>
  );
}

export default AdminDashboard;
