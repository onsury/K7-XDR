export async function api(url, options = {}) {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(res.statusText)
    return res.json()
  }