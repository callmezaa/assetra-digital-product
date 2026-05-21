"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300 overflow-hidden group outline-none"
      aria-label="Toggle theme"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <Sun 
          className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
            theme === 'dark' 
              ? 'opacity-0 scale-50 rotate-90' 
              : 'opacity-100 scale-100 rotate-0 text-amber-500'
          }`} 
        />
        <Moon 
          className={`absolute h-5 w-5 transition-all duration-500 ease-out ${
            theme === 'dark' 
              ? 'opacity-100 scale-100 rotate-0 text-blue-400' 
              : 'opacity-0 scale-50 -rotate-90'
          }`} 
        />
      </div>
    </button>
  )
}
