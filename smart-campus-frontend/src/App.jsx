import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import Navbar from "./components/Navbar";
import { getCurrentUser, getCurrentUserRole } from "./utils/currentUser";

function AppLayout() {
  const currentUser = getCurrentUser();
  const role = getCurrentUserRole();
  const location = useLocation();
  const isImmersiveRoute =
    location.pathname === "/dashboard" || location.pathname === "/admin";
  const isBookingRoute =
    location.pathname === "/booking" || location.pathname.startsWith("/book/");
  const isFullWidthRoute =
    isImmersiveRoute || location.pathname === "/resources" || isBookingRoute;

  return (
    <div className="min-h-screen">
      {!isImmersiveRoute && <Navbar />}
      <div className={isFullWidthRoute ? "" : "hub-shell"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route
            path="/admin"
            element={
              !currentUser ? (
                <Navigate to="/login" replace />
              ) : role === "ADMIN" || role === "ROLE_ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              !currentUser ? (
                <Navigate to="/login" replace />
              ) : role === "ADMIN" || role === "ROLE_ADMIN" ? (
                <Navigate to="/admin" replace />
              ) : (
                <UserDashboard />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
