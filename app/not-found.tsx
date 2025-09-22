import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-8">
              <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600 mb-6">
                Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you
                entered the wrong URL.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact our support team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
