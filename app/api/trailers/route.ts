import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createTrailer, listTrailers } from "@/lib/trailers";
import type { TrailerInput } from "@/lib/types";

export async function GET() {
  const authResult = await requireApiUser();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const trailers = await listTrailers();
    return NextResponse.json({ trailers });
  } catch (error) {
    console.error("GET /api/trailers", error);
    return NextResponse.json(
      { error: "Failed to load trailers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireApiUser({ write: true });
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as TrailerInput;
    const trailer = await createTrailer(body);
    return NextResponse.json({ trailer }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create trailer";
    const status = message.includes("required") || message.includes("Invalid")
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
