import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createLocation, listLocations } from "@/lib/locations";
import type { LocationInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const locations = await listLocations();
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("GET /api/locations", error);
    return NextResponse.json(
      { error: "Failed to load locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as LocationInput;
    const location = await createLocation(body);
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create location";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
