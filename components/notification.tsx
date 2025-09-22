"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export interface NotificationProps {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
  index: number
  totalCount: number
}

export function Notification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  index,
  totalCount,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  // Calculate position - newest notification (highest index) stays at bottom
  // Older notifications (lower index) get pushed up
  // We need to calculate from the bottom up, so we use (totalCount - index - 1)
  // This way, index 0 (oldest) will be pushed up the most
  const translateY = (totalCount - index - 1) * -80 // Each notification is 80px apart

  return (
    <div
      className={`
      fixed z-50 w-full sm:max-w-sm 
      transform transition-all duration-300 ease-in-out
      ${isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    `}
      style={{
        bottom: `${16 + index * 80}px`, // Stack notifications upward
        right: "16px",
        position: "fixed",
        zIndex: 50 + index,
        maxWidth: "384px", // max-w-sm equivalent
        width: "calc(100vw - 32px)", // Responsive width with padding
        maxWidth: "384px",
      }}
    >
      <div
        className={`
      rounded-lg border shadow-lg p-3 sm:p-4 ${getColorClasses()}
      backdrop-blur-sm bg-opacity-95 touch-manipulation
    `}
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-0.5 sm:mb-1">{title}</h4>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed line-clamp-3 sm:line-clamp-none">{message}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleClose()
            }}
            className="flex-shrink-0 ml-1 sm:ml-2 p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Close notification"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar for timed notifications */}
        {duration > 0 && (
          <div className="mt-2 sm:mt-3 w-full bg-black bg-opacity-10 rounded-full h-1">
            <div
              className="h-1 bg-current rounded-full opacity-60"
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export function NotificationContainer({
  notifications,
  onClose,
}: {
  notifications: NotificationProps[]
  onClose: (id: string) => void
}) {
  return (
    <>
      {notifications.map((notification, index) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
          index={index}
          totalCount={notifications.length}
        />
      ))}
    </>
  )
}
