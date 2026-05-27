import type { ReactNode } from "react";

// Auth forms create a Supabase browser client. Skip static prerender at build
// so missing CI env does not fail the whole deployment (runtime still needs env).
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
