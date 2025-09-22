"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error boundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error monitoring service (e.g., Sentry)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and is working to fix this
              issue.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling async operations with error states
export function useAsyncOperation() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = React.useCallback(async <T>(\
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T> => {
    setLoading(true)
    setError(null)

  try {
    const result = await operation()
    onSuccess?.(result)
    return result
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
    setError(errorMessage)
    onError?.(err instanceof Error ? err : new Error(errorMessage))
    throw err
  } finally {
    setLoading(false)
  }
}
, [])

return { loading, error, execute, clearError: () => setError(null) }
}
