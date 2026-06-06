import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import {
  createMaintenanceService,
  listMaintenanceServices,
} from "@/lib/maintenance";
import type { MaintenanceServiceInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const services = await listMaintenanceServices();
    return NextResponse.json({ services });
  } catch (error) {
    console.error("GET /api/maintenance", error);
    return NextResponse.json(
      { error: "Failed to load maintenance services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as MaintenanceServiceInput;
    const service = await createMaintenanceService(body);
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create service";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
