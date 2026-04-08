import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

function RegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("registrationEmail");

    if (stateEmail) {
      setEmail(stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect back to register
      navigate("/register");
    }
  }, [location, navigate]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.name.trim()) {
        throw new Error("Please enter your name");
      }

      const normalizedEmail = email.toLowerCase();
      const { data } = await api.post("/api/auth/bootstrap-user", {
        name: form.name,
        email: normalizedEmail,
        role: form.role,
      });

      localStorage.setItem("currentUser", JSON.stringify(data));
      localStorage.setItem("userId", data.id);
      localStorage.removeItem("registrationEmail");

      // Show success message and redirect
      navigate("/resources");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 grid max-w-md gap-5">
      <section className="hub-card">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="hub-title">Complete Your Profile</h1>
          <p className="hub-subtitle text-sm">
            Just a few more details to get started
          </p>
        </div>

        <form onSubmit={handleCreateAccount} className="mt-6 grid gap-4">
          {/* Email Display */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              className="hub-input bg-slate-100 cursor-not-allowed"
              type="email"
              value={email}
              disabled
            />
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ Verified
            </p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              className="hub-input"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Role
            </label>
            <select
              className="hub-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="USER">User</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="hub-btn hub-btn-primary w-full"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("registrationEmail");
              navigate("/register");
            }}
            className="text-sm text-sky-700 hover:text-sky-900 text-center font-medium"
          >
            ← Start Over
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">ℹ️ Note:</span> You can update your
            profile details anytime from the account settings.
          </p>
        </div>
      </section>
    </div>
  );
}

export default RegisterCompletePage;
