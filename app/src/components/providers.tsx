"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext, type ReactNode } from "react";
import { ToastProvider } from "./toast";

const MockContext = createContext(true);
/** True when the app runs on in-memory mock data (USE_MOCKS). */
export const useMockMode = () => useContext(MockContext);

export function Providers({ mock, children }: { mock: boolean; children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MockContext.Provider value={mock}>
        <ToastProvider>{children}</ToastProvider>
      </MockContext.Provider>
    </ThemeProvider>
  );
}
