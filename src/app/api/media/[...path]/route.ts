import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy route — forwards requests to api.horses.market/img/
 * so that ad-blocker extensions don't block URLs containing "Ads" in the path.
 *
 * Usage: /api/media/AdsImages/xxx.webp
 *   → proxies → https://api.horses.market/img/AdsImages/xxx.webp
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join("/");
  const targetUrl = `https://api.horses.market/img/${imagePath}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/webp,image/avif,image/*,*/*",
      },
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/webp";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
