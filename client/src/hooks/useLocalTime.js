import { useEffect, useState } from 'react'

function formatTime(timezone) {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function useLocalTime(timezone = 'Asia/Singapore') {
  const [time, setTime] = useState(() => formatTime(timezone))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(timezone)), 10000)
    return () => clearInterval(id)
  }, [timezone])

  return time
}
