import { NextResponse } from "next/server";
import { createTrailer, listTrailers } from "@/lib/trailers";
import type { TrailerInput } from "@/lib/types";

export async function GET() {
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
