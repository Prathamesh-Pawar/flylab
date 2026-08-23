import { NextResponse } from "next/server";
import { getReleaseSha } from "@/lib/runtime-envelope";

export const dynamic = "force-dynamic";

export function GET(_request: Request) {
  return NextResponse.json({ service: "flightlab", releaseSha: getReleaseSha() });
}
