import { useEffect, useState } from 'react'

const REFRESH_MS = 10_000

function formatTime(timezone) {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    // An unknown time zone throws a RangeError; show nothing rather than crash.
    return '—'
  }
}

/** The current wall-clock time in `timezone`, refreshed every ten seconds. */
export function useLocalTime(timezone = 'Asia/Singapore') {
  const [time, setTime] = useState(() => formatTime(timezone))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timezone)), REFRESH_MS)
    return () => clearInterval(id)
  }, [timezone])

  return time
}
