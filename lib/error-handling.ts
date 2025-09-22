"use client"

import React from "react"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429)
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    console.error("Unexpected error:", error)
    return {
      message: "Internal server error",
      statusCode: 500,
    }
  }

  console.error("Unknown error:", error)
  return {
    message: "Unknown error occurred",
    statusCode: 500,
  }
}

// Retry mechanism for API calls
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")

      if (attempt === maxRetries) {
        throw lastError
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED"

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN"
      } else {
        throw new Error("Circuit breaker is OPEN")
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = "CLOSED"
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = "OPEN"
    }
  }
}

// Global error boundary for React components
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export function createErrorBoundary() {
  return class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
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
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )
      }

      return this.props.children
    }
  }
}

// Async error handler for forms
export async function handleAsyncFormSubmit<T>(
  submitFn: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    const result = await submitFn()
    onSuccess?.(result)
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    console.error("Form submission error:", errorObj)
    onError?.(errorObj)
  }
}
