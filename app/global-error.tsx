"use client"

import { Button } from "@/components/ui/button"
import { Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-8">
              <div className="text-6xl font-bold text-red-300 mb-4">!</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button variant="outline" asChild className="w-full">
                <a href="/" className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Homepage
                </a>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Error ID: {error.digest && <code className="bg-gray-100 px-1 rounded">{error.digest}</code>}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
