import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { deleteTrailer, getTrailer, updateTrailer } from "@/lib/trailers";
import type { TrailerUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await context.params;
    const trailer = await getTrailer(id);
    if (!trailer) {
      return NextResponse.json({ error: "Trailer not found" }, { status: 404 });
    }
    return NextResponse.json({ trailer });
  } catch (error) {
    console.error("GET /api/trailers/[id]", error);
    return NextResponse.json(
      { error: "Failed to load trailer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireApiUser({ write: true });
  if (authResult instanceof NextResponse) return authResult;

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
  const authResult = await requireApiUser({ write: true });
  if (authResult instanceof NextResponse) return authResult;

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
