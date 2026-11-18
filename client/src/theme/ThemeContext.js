import { createContext } from 'react'

/**
 * Value shape: { color, mode, setColor(hex), setMode(mode), toggleMode() }.
 * The colour also moves to the next preset on its own every 30 seconds.
 */
export const ThemeContext = createContext(null)
