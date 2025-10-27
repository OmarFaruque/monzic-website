import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare } from "lucide-react"
import Link from "next/link"
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function TicketLoading() {

  const generalSettings = await db.query.settings.findFirst({
    where: eq(settings.param, 'general')
  });
  let companyName = 'Mozero AI Ltd'; // Default fallback
  if (generalSettings && generalSettings.value) {
    const parsedSettings = JSON.parse(generalSettings.value);
    companyName = parsedSettings.companyName || 'Mozero AI Ltd';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-white hover:text-teal-100 transition-colors">
            MONZIC
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Support Request
            </Button>
            <Button
              variant="outline"
              className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Skeleton className="h-4 w-12" />
            <span className="mx-2">/</span>
            <Skeleton className="h-4 w-16" />
            <span className="mx-2">/</span>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Back Button */}
          <div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Ticket Header */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
                    <Skeleton className="h-5 w-64 bg-white/20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16 bg-white/20" />
                  <Skeleton className="h-6 w-20 bg-white/20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-32 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-5 w-28 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-52" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-teal-200 rounded" />
                <Skeleton className="h-6 w-40" />
              </div>
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Message skeletons */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] space-y-3 bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-3 bg-teal-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-300 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] space-y-3 bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>

              {/* Reply Form Skeleton */}
              <div className="space-y-6 border-t border-gray-100 pt-8 mt-8">
                <div>
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">MONZIC</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your trusted partner for insurance policies and AI-powered document generation services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-300">Get Insurance Quote</span>
                </li>
                <li>
                  <span className="text-gray-300">AI Documents</span>
                </li>
                <li>
                  <span className="text-gray-300">View Policy</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-300">Contact Support</span>
                </li>
                <li>
                  <span className="text-gray-300">Customer Dashboard</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-300">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-gray-300">Terms of Service</span>
                </li>
                <li>
                  <span className="text-gray-300">Return Policy</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} {companyName}. All rights reserved. | Providing exceptional insurance and AI document services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}