
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExtension = path.extname(file.name);
    const fileName = `logo${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Logo upload failed:", error);
    return NextResponse.json({ error: "Logo upload failed" }, { status: 500 });
  }
}
