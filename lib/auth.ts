import { cookies } from "next/headers";

import type { User } from "@/types/user";

const API_BASE =
  (process.env.NEXT_PUBLIC_NOTEHUB_API ?? "https://notehub-public.goit.study/api").replace(/\/$/, "");

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookieHeader = cookieStore.getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_BASE}/auth/session`, {
      cache: "no-store",
      headers: sessionCookieHeader ? { Cookie: sessionCookieHeader } : {},
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user?: User } | User | null;
    return (data && "user" in data ? data.user : data) ?? null;
  } catch {
    return null;
  }
}
