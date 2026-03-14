import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      style={{
        backgroundColor: dark ? 'var(--border-color)' : '#e2e8f0',
      }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Mode Terang' : 'Mode Gelap'}
    >
      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 text-xs">
        <span className={`transition-opacity duration-300 ${dark ? 'opacity-0' : 'opacity-100'}`}>☀️</span>
        <span className={`transition-opacity duration-300 ${dark ? 'opacity-100' : 'opacity-0'}`}>🌙</span>
      </span>
      {/* Thumb */}
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{
          left: dark ? 'calc(100% - 1.625rem)' : '0.125rem',
          backgroundColor: dark ? '#60a5fa' : '#ffffff',
        }}
      />
    </button>
  )
}
