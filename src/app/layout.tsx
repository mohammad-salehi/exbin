import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "CedPortal",
    template: "%s | CedPortal",
  },
  description: "سامانه تحلیل، نظارت و مدیریت کارگزاری‌های رمزارزی",
  icons: {
    icon: "/images/pantaLogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-bgColor dark:bg-bgColor-dark">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
