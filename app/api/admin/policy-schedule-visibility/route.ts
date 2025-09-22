import { type NextRequest, NextResponse } from "next/server"

// Mock storage for policy schedule visibility setting
let policyScheduleVisible = true

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      visible: policyScheduleVisible,
    })
  } catch (error) {
    console.error("Error getting policy schedule visibility:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get policy schedule visibility",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { visible } = await request.json()

    if (typeof visible !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid visibility value",
        },
        { status: 400 },
      )
    }

    policyScheduleVisible = visible

    return NextResponse.json({
      success: true,
      message: `Policy schedule ${visible ? "enabled" : "disabled"} successfully`,
      visible: policyScheduleVisible,
    })
  } catch (error) {
    console.error("Error updating policy schedule visibility:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update policy schedule visibility",
      },
      { status: 500 },
    )
  }
}
