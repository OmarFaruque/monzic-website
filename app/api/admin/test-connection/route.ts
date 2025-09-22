import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { service, config } = await request.json()

    // In a real app, we would actually test the connection
    // For demo purposes, we'll simulate a successful connection

    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let response = {
      success: true,
      message: `Successfully connected to ${service}`,
    }

    // Simulate different responses based on service
    switch (service) {
      case "paddle":
        if (!config.apiKey) {
          response = {
            success: false,
            message: "API Key is required for Paddle integration",
          }
        }
        break

      case "openai":
        if (!config.apiKey) {
          response = {
            success: false,
            message: "API Key is required for OpenAI integration",
          }
        } else if (!config.apiKey.startsWith("sk-")) {
          response = {
            success: false,
            message: "Invalid OpenAI API Key format",
          }
        }
        break

      case "resend":
        if (!config.apiKey) {
          response = {
            success: false,
            message: "API Key is required for Resend integration",
          }
        } else if (!config.domain) {
          response = {
            success: false,
            message: "Email domain is required",
          }
        }
        break

      case "vehicleApi":
        if (!config.apiKey) {
          response = {
            success: false,
            message: "API Key is required for Vehicle API integration",
          }
        } else if (!config.endpoint) {
          response = {
            success: false,
            message: "API endpoint is required",
          }
        }
        break

      default:
        response = {
          success: false,
          message: `Unknown service: ${service}`,
        }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error testing connection:", error)
    return NextResponse.json({ success: false, message: "Failed to test connection" }, { status: 500 })
  }
}
