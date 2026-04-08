export const getStoredUserId = () => {
  const currentUserRaw = localStorage.getItem("currentUser");
  if (currentUserRaw) {
    try {
      const parsedCurrent = JSON.parse(currentUserRaw);
      if (parsedCurrent?.id) {
        return parsedCurrent.id;
      }
    } catch {
      // Ignore parse failure
    }
  }

  const raw = localStorage.getItem("userId");
  if (!raw) {
    return "";
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return parsed;
    }
    if (parsed?.userId) {
      return parsed.userId;
    }
    if (parsed?.id) {
      return parsed.id;
    }
    return raw;
  } catch {
    return raw;
  }
};

export const isAdminUser = (user) => {
  const role = String(user?.role || "").toUpperCase();
  return role === "ADMIN" || role === "ROLE_ADMIN";
};

export const resolveAdminUserId = (users, preferredIds = []) => {
  const safeUsers = Array.isArray(users) ? users : [];

  for (const id of preferredIds) {
    if (!id) {
      continue;
    }
    const matched = safeUsers.find(
      (user) => user.id === id && isAdminUser(user),
    );
    if (matched?.id) {
      return matched.id;
    }
  }

  return (
    safeUsers.find((user) => isAdminUser(user))?.id || safeUsers[0]?.id || ""
  );
};
