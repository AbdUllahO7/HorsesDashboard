import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Horses Admin Dashboard BFF API",
    timestamp: new Date().toISOString(),
  });
}
