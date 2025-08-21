"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  duration?: number
  variant?: "default" | "destructive"
}

type ToastInput = Omit<Toast, "id">

type ToastContextValue = {
  toast: (input: ToastInput) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, duration = 5000, variant }: ToastInput) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, duration, variant }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)
  }, [])

  return <ToastContext.Provider value={{ toast, toasts }}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

