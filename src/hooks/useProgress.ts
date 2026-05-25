import { useCallback, useEffect, useState } from 'react'
import { emptyProgress } from '../lib/progress'
import { loadProgress, syncProgress } from '../services/progressService'
import type { UserProgress } from '../types/domain'

export function useProgress(userId?: string) {
  const [progress, setProgress] = useState<UserProgress>(emptyProgress)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const timeoutId = window.setTimeout(() => {
      setLoading(true)
      loadProgress()
        .then(setProgress)
        .finally(() => setLoading(false))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [userId])

  const updateProgress = useCallback(
    async (updater: (current: UserProgress) => UserProgress) => {
      if (!userId) return

      const next = updater(progress)
      setProgress(next)
      try {
        await syncProgress(progress, next)
      } catch (error) {
        setProgress(progress)
        throw error
      }
    },
    [progress, userId],
  )

  return { progress, loading, updateProgress }
}
