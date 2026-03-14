import { useState, useCallback, useRef } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type, exiting: false }])

    // Auto dismiss after 3.5s
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
      )
      // Remove from DOM after exit animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 300)
    }, 3500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
    )
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  return { toasts, showToast, dismissToast }
}
