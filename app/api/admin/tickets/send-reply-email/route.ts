import { NextResponse } from "next/server";
import { sendTicketReplyEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
   const formData = await req.formData();

    // Extract required fields
    const to = formData.get("to") as string;
    const name = formData.get("name") as string;
    const ticketId = formData.get("ticketId") as string;
    const message = formData.get("message") as string;

    if (!to || !name || !ticketId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Process attachments
    const attachments: any[] = [];
    for (const file of formData.getAll("attachments")) {
      if (file instanceof File) {
        const chunks = [];
        for await (const chunk of file.stream()) {
          chunks.push(chunk);
        }
        attachments.push({
          filename: file.name,
          content: Buffer.concat(chunks),
        });
      }
    }

    // Send the email
    const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ticket/${ticketId}`;
    await sendTicketReplyEmail({
      to,
      subject: `Reply to Ticket #${ticketId}`,
      name,
      ticketId,
      message,
      attachments,
      ticketUrl,
    });

    return NextResponse.json({ message: "Reply email sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending reply email:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
