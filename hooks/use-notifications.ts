"use client"

import { useState, useCallback } from "react"

export interface NotificationData {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = useCallback((notification: Omit<NotificationData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    // Add new notification to the end of the array (it will appear at the bottom)
    setNotifications((prev) => [...prev, newNotification])

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "success", title, message, duration })
    },
    [addNotification],
  )

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "error", title, message, duration })
    },
    [addNotification],
  )

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "info", title, message, duration })
    },
    [addNotification],
  )

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      return addNotification({ type: "warning", title, message, duration })
    },
    [addNotification],
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}
