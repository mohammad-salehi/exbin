'use client';

import { ThemeProvider, moonDesignLight } from "@heathmont/moon-themes";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ThemeProvider theme={moonDesignLight}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}