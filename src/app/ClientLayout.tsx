'use client';

import { ThemeProvider, moonDesignLight } from "@heathmont/moon-themes";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={moonDesignLight}>
      {children}
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: "#1f2937", // bg-gray-800
            color: "#fff",
            borderRadius: "0.5rem",
            padding: "12px 16px",
            fontSize: "14px",
          },
        }}
      />
    </ThemeProvider>
  );
}
