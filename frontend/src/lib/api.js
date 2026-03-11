const BASE = import.meta.env.VITE_API_URL || ""

export async function api(url, options = {}) {
  const user = JSON.parse(localStorage.getItem("k7xdr_user") || "null")
  const res = await fetch(BASE + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(user ? { "X-User-Role": user.role, "X-User-Email": user.email } : {}),
      ...(options.headers || {})
    }
  })
  if (res.ok === false) throw new Error(res.statusText)
  return res.json()
}
