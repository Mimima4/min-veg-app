import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function hasPlatformAdminAccess(user: {
  app_metadata?: Record<string, unknown>;
} | null) {
  if (!user) {
    return false;
  }

  const role = user.app_metadata?.role;
  const adminAccess = user.app_metadata?.admin_access;
  const accessScope = user.app_metadata?.access_scope;

  return (
    role === "platform_admin" ||
    adminAccess === true ||
    accessScope === "full"
  );
}

export default async function PlatformAdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!hasPlatformAdminAccess(user)) {
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}