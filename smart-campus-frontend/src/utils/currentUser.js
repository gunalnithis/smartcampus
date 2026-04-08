export function getCurrentUser() {
  const raw = localStorage.getItem('currentUser')
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.id || ''
}

export function getCurrentUserRole() {
  const rawRole = getCurrentUser()?.role
  if (!rawRole) return ''
  return String(rawRole).trim().toUpperCase()
}
