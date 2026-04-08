import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/currentUser";

function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const currentUser = getCurrentUser();

  const savedMode = localStorage.getItem("hub-theme");
  if (!savedMode) {
    const shouldUseDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    localStorage.setItem("hub-theme", shouldUseDark ? "dark" : "light");
  }

  const isDark = darkMode || localStorage.getItem("hub-theme") === "dark";
  document.documentElement.classList.toggle("dark", isDark);

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
    window.location.reload();
  };

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-hub-aqua text-white shadow"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
    }`;

  const closeMobileMenu = () => setMobileOpen(false);

  const profileName = currentUser?.name || "User";
  const profileEmail = currentUser?.email || "No email";
  const profileRole = currentUser?.role || "USER";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/85">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:px-6 lg:px-10">
        <NavLink
          to="/"
          onClick={closeMobileMenu}
          className="mr-1 flex items-center gap-2 rounded-xl bg-hub-ink px-3 py-2 text-sm font-semibold text-white"
        >
          <span className="text-base">⚡</span>
          <span>Smart Hub</span>
        </NavLink>

        <div className="hidden items-center justify-center gap-1 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/resources" className={navClass}>
            Resources
          </NavLink>
          <NavLink to="/booking" className={navClass}>
            Bookings
          </NavLink>
          <NavLink to="/tickets" className={navClass}>
            Tickets
          </NavLink>
          <NavLink to="/notifications" className={navClass}>
            Notification
          </NavLink>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              const next = !(localStorage.getItem("hub-theme") === "dark");
              localStorage.setItem("hub-theme", next ? "dark" : "light");
              setDarkMode(next);
            }}
            className="hub-btn hub-btn-secondary !px-3"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀" : "☾"}
          </button>

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="hub-btn hub-btn-secondary gap-2"
                aria-label="Open profile menu"
              >
                <span className="text-base">👤</span>
                <span className="hidden sm:inline">{profileName}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-panel dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {profileName}
                    </p>
                    <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                      {profileEmail}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {profileRole}
                    </p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/login" className="inline-flex">
                <span className="hub-btn hub-btn-secondary">Login</span>
              </NavLink>
              <NavLink to="/register" className="inline-flex">
                <span className="hub-btn hub-btn-primary">Register</span>
              </NavLink>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="hub-btn hub-btn-secondary !px-3 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
          <div className="grid gap-2">
            <NavLink to="/" onClick={closeMobileMenu} className={navClass}>
              Home
            </NavLink>
            <NavLink
              to="/resources"
              onClick={closeMobileMenu}
              className={navClass}
            >
              Resources
            </NavLink>
            <NavLink
              to="/booking"
              onClick={closeMobileMenu}
              className={navClass}
            >
              Bookings
            </NavLink>
            <NavLink
              to="/tickets"
              onClick={closeMobileMenu}
              className={navClass}
            >
              Tickets
            </NavLink>
            <NavLink
              to="/notifications"
              onClick={closeMobileMenu}
              className={navClass}
            >
              Notification
            </NavLink>
            {!currentUser && (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMobileMenu}
                  className={navClass}
                >
                  Register
                </NavLink>
              </>
            )}
            {currentUser && (
              <>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/profile");
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
