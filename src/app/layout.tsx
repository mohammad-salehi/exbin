'use client';

import { ThemeProvider, moonDesignLight } from "@heathmont/moon-themes";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-bgColor dark:bg-bgColor-dark">
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
      </body>
    </html>
  );
}