import { createContext } from 'react'

/**
 * Value shape: { color, mode, autoCycle, setColor(hex), setMode(mode),
 * toggleMode(), setAutoCycle(enabled) }.
 */
export const ThemeContext = createContext(null)
