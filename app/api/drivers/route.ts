import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createDriver, listDrivers } from "@/lib/drivers";
import type { DriverInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const drivers = await listDrivers();
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("GET /api/drivers", error);
    return NextResponse.json(
      { error: "Failed to load drivers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as DriverInput;
    const driver = await createDriver(body);
    return NextResponse.json({ driver }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create driver";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
