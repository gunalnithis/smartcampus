import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";
import {
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
} from "../utils/currentUser";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

function TicketsPage() {
  const userId = getCurrentUserId();
  const role = getCurrentUserRole();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentMap, setCommentMap] = useState({});
  const [form, setForm] = useState({
    resourceId: "",
    category: "",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
  });
  const [images, setImages] = useState([]);

  const loadTickets = useCallback(() => {
    const params = {};
    if (role === "USER") params.reportedBy = userId;
    if (role === "TECHNICIAN") params.assignedTo = userId;

    api
      .get("/api/tickets", { params })
      .then((res) => setTickets(res.data || []))
      .catch(() => setError("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, [role, userId]);

  useEffect(() => {
    if (!userId) return;
    loadTickets();
  }, [userId, loadTickets]);

  const submitTicket = async (e) => {
    e.preventDefault();
    setError("");
    if (!userId) {
      setError("Please login first");
      return;
    }
    if (images.length > 3) {
      setError("Maximum 3 images are allowed");
      return;
    }

    const payload = {
      ...form,
      reportedByUserId: userId,
    };

    const data = new FormData();
    data.append(
      "ticket",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    images.forEach((file) => data.append("images", file));

    try {
      await api.post("/api/tickets", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({
        resourceId: "",
        category: "",
        description: "",
        priority: "MEDIUM",
        contactDetails: "",
      });
      setImages([]);
      loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create ticket");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/api/tickets/${id}/status`, {
        actorUserId: userId,
        status,
      });
      loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update status");
    }
  };

  const submitComment = async (ticketId) => {
    const text = commentMap[ticketId];
    if (!text) return;
    try {
      await api.post(`/api/tickets/${ticketId}/comments`, { userId, text });
      setCommentMap((prev) => ({ ...prev, [ticketId]: "" }));
      loadTickets();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment");
    }
  };

  const toneForPriority = (priority) => {
    if (priority === "CRITICAL") return "bg-red-50 text-red-700 border-red-200";
    if (priority === "HIGH")
      return "bg-orange-50 text-orange-700 border-orange-200";
    if (priority === "MEDIUM")
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <main className="space-y-5">
      <div className="hub-card">
        <h1 className="hub-title">Maintenance and Incident Tickets</h1>
        <p className="hub-subtitle">
          Create issue tickets, upload evidence, collaborate with comments, and
          track status flow.
        </p>
        {currentUser && (
          <p className="mt-2 text-sm text-slate-500">
            Signed in as {currentUser.name} ({currentUser.role})
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <section className="hub-card">
        <h2 className="font-serif text-2xl text-slate-900">Create Ticket</h2>
        <form
          onSubmit={submitTicket}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <input
            className="hub-input md:col-span-1"
            placeholder="Resource ID (optional)"
            value={form.resourceId}
            onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
          />
          <input
            className="hub-input md:col-span-1"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <textarea
            className="hub-textarea md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <select
            className="hub-select"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <input
            className="hub-input"
            placeholder="Contact details (optional)"
            value={form.contactDetails}
            onChange={(e) =>
              setForm({ ...form, contactDetails: e.target.value })
            }
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Attach up to 3 images
            </label>
            <input
              className="hub-input p-2"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages(Array.from(e.target.files || []).slice(0, 3))
              }
            />
          </div>
          <button
            type="submit"
            className="hub-btn hub-btn-primary md:col-span-2"
          >
            Create Ticket
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-slate-900">Ticket Queue</h2>
          {loading && (
            <span className="text-sm text-slate-500">Loading...</span>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="hub-card">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {ticket.id}
                </span>
                <span
                  className={`hub-badge border ${toneForPriority(ticket.priority)}`}
                >
                  {ticket.priority}
                </span>
                <span className="hub-badge border border-sky-200 bg-sky-50 text-sky-700">
                  {ticket.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {ticket.category}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {ticket.description}
              </p>

              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">
                    Assigned:
                  </span>{" "}
                  {ticket.assignedToUserId || "Not assigned"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">
                    Reporter:
                  </span>{" "}
                  {ticket.reportedByUserId}
                </p>
              </div>

              {ticket.imageUrls?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-semibold text-slate-700">
                    Attachments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={`${API_BASE_URL}${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-sky-700 hover:bg-sky-50"
                      >
                        View image
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(role === "ADMIN" || role === "TECHNICIAN") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "OPEN",
                    "IN_PROGRESS",
                    "RESOLVED",
                    "CLOSED",
                    "REJECTED",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(ticket.id, s)}
                      className="hub-btn hub-btn-secondary !px-3 !py-1.5 !text-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-sm font-semibold text-slate-700">Comments</p>
                <div className="mt-2 space-y-1">
                  {ticket.comments?.map((c) => (
                    <p
                      key={c.id}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="font-semibold text-slate-900">
                        {c.userId}:
                      </span>{" "}
                      {c.text}
                    </p>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    className="hub-input"
                    placeholder="Write a comment"
                    value={commentMap[ticket.id] || ""}
                    onChange={(e) =>
                      setCommentMap((prev) => ({
                        ...prev,
                        [ticket.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => submitComment(ticket.id)}
                    className="hub-btn hub-btn-primary whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default TicketsPage;
