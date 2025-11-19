'use client';

import { SessionProvider } from "next-auth/react";
import { CafeProvider } from "@/context/CafeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CafeProvider>
        {children}
      </CafeProvider>
    </SessionProvider>
  );
}
