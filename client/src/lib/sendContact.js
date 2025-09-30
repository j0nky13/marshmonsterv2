const FORMSPREE_ENDPOINT = "https://formspree.io/f/mnngdpny"

export async function sendContact(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Form submit failed (${res.status}): ${text}`)
  }
  return true
}