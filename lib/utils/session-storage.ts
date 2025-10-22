export function saveExploreDataToSession(data: {
  zip_code: string
  date_of_birth: string
  gender: string
  is_smoker: boolean
  last_tobacco_use?: string
}) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('explore_data', JSON.stringify(data))
    // Persist also in localStorage to survive new tab/email confirmation
    try {
      localStorage.setItem('explore_data', JSON.stringify(data))
    } catch {}
  }
}

export function getExploreDataFromSession() {
  if (typeof window !== 'undefined') {
    // Prefer sessionStorage; fallback to localStorage
    const data = sessionStorage.getItem('explore_data') || localStorage.getItem('explore_data')
    return data ? JSON.parse(data) : null
  }
  return null
}

export function clearExploreDataFromSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('explore_data')
    try {
      localStorage.removeItem('explore_data')
    } catch {}
  }
}

