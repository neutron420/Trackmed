"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus (prevents duplicate calls)
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
