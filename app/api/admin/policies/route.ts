import { NextResponse } from "next/server";
import { getAllPolicies, createPolicy, updatePolicy, deletePolicy } from "@/lib/policy-server";

export async function GET() {
  try {
    const policies = await getAllPolicies();
    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const policyData = await request.json();
    const newPolicy = await createPolicy(policyData);
    return NextResponse.json(newPolicy);
  } catch (error) {
    console.error("Error creating policy:", error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { policyId, policyData } = await request.json();
    const updatedPolicy = await updatePolicy(policyId, policyData);
    return NextResponse.json(updatedPolicy);
  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { policyId } = await request.json();
    const deletedPolicy = await deletePolicy(policyId);
    return NextResponse.json(deletedPolicy);
  } catch (error) {
    console.error("Error deleting policy:", error);
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
  }
}