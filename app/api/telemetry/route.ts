import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const observation = await request.json();
  // A collector can consume these structured records from the app runtime.
  // FlightLab intentionally does not persist product or payment data.
  console.info(JSON.stringify({ observedAt: new Date().toISOString(), service: "flightlab", ...observation }));
  return new NextResponse(null, { status: 204 });
}
