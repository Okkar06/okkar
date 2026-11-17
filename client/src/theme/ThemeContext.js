import { createContext } from 'react'

/** Value shape: { color, mode, setColor(hex), setMode(mode), toggleMode() }. */
export const ThemeContext = createContext(null)
