import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getSettings, updateSettings } from "@/lib/settings";
import type { AppSettingsUpdate } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser({ settings: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/settings", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireApiUser({ settings: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as AppSettingsUpdate;
    const settings = await updateSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("PATCH /api/settings", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
