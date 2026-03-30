import { ReactNode } from "react";

export default async function AppAreaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await params;

  return <>{children}</>;
}
