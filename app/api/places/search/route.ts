import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { searchGoogleMapsPlaces } from "@/lib/serpapi";

export async function GET(request: Request) {
  const authResult = await requireApiUser({ staff: true, write: true });
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 4) {
    return NextResponse.json({ places: [] });
  }

  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(searchParams.get("lng") ?? "");

  try {
    const places = await searchGoogleMapsPlaces(q, {
      latitude: Number.isFinite(lat) ? lat : undefined,
      longitude: Number.isFinite(lng) ? lng : undefined,
    });
    return NextResponse.json({ places });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Place search failed";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
