import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability-data";

// GET /api/availability?date=YYYY-MM-DD&service=<uuid>
// Returns only free slots (no customer data).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const service = searchParams.get("service");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !service) {
    return NextResponse.json(
      { error: "Missing or invalid 'date' (YYYY-MM-DD) or 'service'." },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(date, service);
  return NextResponse.json({ slots });
}
