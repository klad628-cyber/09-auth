import { NextResponse, type NextRequest } from "next/server";

const API_BASE =
  (process.env.NEXT_PUBLIC_NOTEHUB_API ?? "https://notehub-public.goit.study/api").replace(/\/$/, "");

export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_BASE}${cleanEndpoint}`;

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (!["host", "content-length"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.text();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseText = await upstreamResponse.text();
  const nextResponse = new NextResponse(responseText, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  });

  upstreamResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "content-length") {
      nextResponse.headers.set(key, value);
    }
  });

  return nextResponse;
}
