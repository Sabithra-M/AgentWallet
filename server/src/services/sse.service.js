// A minimal in-process SSE hub: tracks which open HTTP responses belong to
// which user, and lets any other service push an event straight to them.
// Deliberately has no HTTP or alert-specific knowledge — subscribe/publish
// only, so it stays reusable for anything else that wants a realtime push
// later without pulling in alert concepts.

const subscribersByUserId = new Map()

export function subscribe(userId, res) {
  if (!subscribersByUserId.has(userId)) {
    subscribersByUserId.set(userId, new Set())
  }
  subscribersByUserId.get(userId).add(res)

  return function unsubscribe() {
    const connections = subscribersByUserId.get(userId)
    if (!connections) return
    connections.delete(res)
    if (connections.size === 0) subscribersByUserId.delete(userId)
  }
}

export function publish(userId, event, data) {
  const connections = subscribersByUserId.get(userId)
  if (!connections || connections.size === 0) return

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const res of connections) {
    res.write(payload)
  }
}
