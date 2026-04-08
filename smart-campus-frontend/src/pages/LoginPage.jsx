import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleEmailPasswordLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", {
        email: form.email.toLowerCase(),
        password: form.password,
      });
      localStorage.setItem("currentUser", JSON.stringify(data));
      localStorage.setItem("userId", data.id);
      navigate("/resources");
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 grid max-w-md gap-5">
      <section className="hub-card">
        <h1 className="hub-title">Welcome Back</h1>
        <p className="hub-subtitle">
          Login with email and password, or continue with Google.
        </p>

        <form onSubmit={handleEmailPasswordLogin} className="mt-6 grid gap-4">
          <input
            className="hub-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="hub-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

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
            {loading ? "Signing in..." : "Login with Email"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl bg-[#5f7cff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4d6cf6]"
        >
          Login with Google
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          New user?{" "}
          <Link
            to="/register"
            className="font-semibold text-sky-700 hover:text-sky-900"
          >
            Create account
          </Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
