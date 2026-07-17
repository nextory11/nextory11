import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearLegacyOfflineState } from '../../src/lib/clearLegacyOfflineState.js'

describe('legacy offline state cleanup', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('unregisters legacy service workers and removes Cache Storage entries', async () => {
    const unregister = vi.fn().mockResolvedValue(true)
    const deleteCache = vi.fn().mockResolvedValue(true)

    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistrations: vi.fn().mockResolvedValue([{ unregister }]) },
    })
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue(['legacy-nextory', 'workbox-runtime']),
      delete: deleteCache,
    })

    await clearLegacyOfflineState()

    expect(unregister).toHaveBeenCalledOnce()
    expect(deleteCache).toHaveBeenCalledTimes(2)
  })

  it('is safe in environments without browser cache APIs', async () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('caches', undefined)

    await expect(clearLegacyOfflineState()).resolves.toBeUndefined()
  })
})
