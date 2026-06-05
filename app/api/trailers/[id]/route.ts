import { NextResponse } from "next/server";
import { deleteTrailer, updateTrailer } from "@/lib/trailers";
import type { TrailerUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as TrailerUpdate;
    const trailer = await updateTrailer(id, body);
    return NextResponse.json({ trailer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update trailer";
    const status =
      message === "Trailer not found"
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
    await deleteTrailer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete trailer";
    const status = message === "Trailer not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
