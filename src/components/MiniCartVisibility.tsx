"use client";

import { usePathname } from "next/navigation";

export default function MiniCartVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (
    pathname === "/carrello" ||
    pathname.startsWith("/admin") ||
    pathname === "/login"
  ) {
    return null;
  }

  return <>{children}</>;
}
