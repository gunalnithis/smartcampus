import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [email, setEmail] = useState("");

  // Get email from location state or localStorage
  useEffect(() => {
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("registrationEmail");

    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("registrationEmail", stateEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect back to register
      navigate("/register");
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const normalizedEmail = email.toLowerCase();
      await api.post("/api/auth/verify-otp", { email: normalizedEmail, otp });

      const pendingRegistrationRaw = localStorage.getItem(
        "pendingRegistration",
      );
      if (!pendingRegistrationRaw) {
        throw new Error(
          "Registration details not found. Please register again.",
        );
      }

      const pendingRegistration = JSON.parse(pendingRegistrationRaw);
      const { data } = await api.post("/api/auth/bootstrap-user", {
        ...pendingRegistration,
        email: normalizedEmail,
      });

      localStorage.setItem("currentUser", JSON.stringify(data));
      localStorage.setItem("userId", data.id);
      localStorage.removeItem("registrationEmail");
      localStorage.removeItem("pendingRegistration");

      setSuccessMessage("✓ Account created successfully!");
      setTimeout(() => {
        navigate("/resources");
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    setTimeLeft(300);

    try {
      const normalizedEmail = email.toLowerCase();
      await api.post("/api/auth/send-otp", { email: normalizedEmail });
      setSuccessMessage("✓ New OTP sent to your email!");
      setOtp("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 grid max-w-md gap-5">
      <section className="hub-card">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="hub-title">Verify Your Email</h1>
          <p className="hub-subtitle text-sm">
            We sent a verification code to:
          </p>
          <p className="font-semibold text-slate-900">{email}</p>
        </div>

        <form onSubmit={handleVerifyOtp} className="mt-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              className="hub-input text-center text-4xl tracking-widest font-bold"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength="6"
              inputMode="numeric"
              required
              autoFocus
            />
            <div className="text-xs text-slate-500 mt-2 text-center">
              OTP expires in:{" "}
              <span className={timeLeft < 60 ? "text-red-600 font-bold" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || successMessage}
            className="hub-btn hub-btn-primary w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || timeLeft > 240} // Can only resend after 1 minute
            className="hub-btn hub-btn-secondary w-full text-sky-700 border-2 border-sky-700 bg-transparent hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Didn't receive OTP?"}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("registrationEmail");
              localStorage.removeItem("pendingRegistration");
              navigate("/register");
            }}
            className="text-sm text-sky-700 hover:text-sky-900 text-center font-medium"
          >
            ← Use a different email
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">💡 Tip:</span> Check your spam
            folder if you don't see the email. Add us to your contacts to
            prevent this.
          </p>
        </div>
      </section>
    </div>
  );
}

export default VerifyOtpPage;
