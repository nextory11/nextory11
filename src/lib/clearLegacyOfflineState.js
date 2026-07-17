export async function clearLegacyOfflineState() {
  const tasks = []

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      ),
    )
  }

  if (typeof caches !== 'undefined') {
    tasks.push(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    )
  }

  await Promise.allSettled(tasks)
}
