import { useState, useCallback } from 'react'

const useToast = () => {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, type = 'info', duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      title,
      description,
      type,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    toast,
    dismissToast,
  }
}

export { useToast } 