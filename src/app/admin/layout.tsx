import AdminLayout from "@/components/admin/admin-layout";
import type React from "react";
import "../admin.css";
import { SessionProvider } from "next-auth/react";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  );
}
