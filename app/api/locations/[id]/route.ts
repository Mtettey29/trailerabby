import { NextResponse } from "next/server";
import { deleteLocation, updateLocation } from "@/lib/locations";
import type { LocationUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as LocationUpdate;
    const location = await updateLocation(id, body);
    return NextResponse.json({ location });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update location";
    const status =
      message === "Location not found"
        ? 404
        : message.includes("Invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteLocation(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete location";
    const status = message === "Location not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
