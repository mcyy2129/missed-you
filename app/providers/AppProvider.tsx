"use client";

import { ReactNode } from "react";

export default function AppProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
