export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const RESOURCE_TYPES = [
  { value: "LAB", label: "Lab", icon: "🔬" },
  { value: "LECTURE_HALL", label: "Lecture Hall", icon: "🎓" },
  { value: "MEETING_ROOM", label: "Meeting Room", icon: "💼" },
  { value: "EQUIPMENT", label: "Equipment", icon: "⚙️" },
];

export const RESOURCE_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "green" },
  { value: "OUT_OF_SERVICE", label: "Out Of Service", color: "orange" },
];

export const BUILDING_OPTIONS = [
  { value: "MAIN_BUILDING", label: "Main Building" },
  { value: "NEW_BUILDING", label: "New Building" },
  { value: "ENGINEERING_BUILDING", label: "Engineering Building" },
  { value: "BUSINESS_BUILDING", label: "Business Building" },
  { value: "WILLIAMS_BUILDING", label: "Williams Building" },
];

export const SIDEBAR_ITEMS = [
  { id: "users", label: "Users", icon: "👥" },
  { id: "resources", label: "Resources", icon: "📦" },
  { id: "bookings", label: "Bookings", icon: "📅" },
  { id: "tickets", label: "Tickets", icon: "🎫" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
];

export const EMPTY_RESOURCE_FORM = {
  name: "",
  type: "LAB",
  capacity: 1,
  building: "MAIN_BUILDING",
  location: "",
  status: "ACTIVE",
  description: "",
  imageUrl: "",
  availableFrom: "08:00",
  availableTo: "18:00",
};
