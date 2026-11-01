import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Protege todas as rotas /admin: sem sessão válida → /admin/login. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
