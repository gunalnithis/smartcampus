import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function RegistrationStepHeader({ step }) {
  const steps = ["Email", "OTP", "Profile"];

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Registration</span>
        <span>
          Step {step} of {steps.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((label, index) => {
          const isActive = index + 1 === step;
          const isCompleted = index + 1 < step;

          return (
            <div
              key={label}
              className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700"
                  : isActive
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    itNumber: "",
    campusType: "COLOMBO",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (form.password !== form.confirmPassword) {
        throw new Error("Password and confirm password do not match");
      }

      const normalizedEmail = form.email.toLowerCase();
      await api.post("/api/auth/send-otp", { email: normalizedEmail });
      localStorage.setItem("registrationEmail", normalizedEmail);
      localStorage.setItem(
        "pendingRegistration",
        JSON.stringify({
          name: form.name,
          email: normalizedEmail,
          password: form.password,
          phoneNumber: form.phoneNumber || null,
          itNumber: form.itNumber || null,
          campusType: form.campusType || null,
          role: form.role,
        }),
      );
      navigate("/verify-otp", { state: { email: normalizedEmail } });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 grid max-w-md gap-5">
      <section className="hub-card">
        <RegistrationStepHeader step={1} />

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-sky-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="hub-title">Create Account</h1>
          <p className="hub-subtitle">Join Smart Campus Today</p>
        </div>

        <form onSubmit={handleSendOtp} className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full name
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              className="hub-input"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              After clicking register, only OTP input will be shown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="hub-input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <input
              className="hub-input"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="hub-input"
              type="text"
              placeholder="IT Number (optional)"
              value={form.itNumber}
              onChange={(e) => setForm({ ...form, itNumber: e.target.value })}
            />
            <input
              className="hub-input"
              type="tel"
              placeholder="Phone (optional)"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              className="hub-select"
              value={form.campusType}
              onChange={(e) => setForm({ ...form, campusType: e.target.value })}
            >
              <option value="COLOMBO">Colombo</option>
              <option value="KANDY">Kandy</option>
              <option value="JAFFNA">Jaffna</option>
            </select>

            <select
              className="hub-select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="USER">User</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hub-btn hub-btn-primary w-full"
          >
            {loading ? "Sending OTP..." : "Register and Send OTP"}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-600">or</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-700 hover:text-sky-900"
            >
              Sign In
            </Link>
          </p>
        </form>

        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">🔒 Secure:</span> Your email will be
            verified before account creation.
          </p>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
