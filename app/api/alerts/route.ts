import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createAlert, listAlerts, resolveAllOpenAlerts } from "@/lib/alerts";
import type { SystemAlertInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const alerts = await listAlerts();
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("GET /api/alerts", error);
    return NextResponse.json(
      { error: "Failed to load alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as SystemAlertInput & {
      action?: string;
    };

    if (body.action === "resolve_all") {
      const count = await resolveAllOpenAlerts();
      const alerts = await listAlerts();
      return NextResponse.json({ alerts, resolved: count });
    }

    const alert = await createAlert(body);
    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create alert";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
