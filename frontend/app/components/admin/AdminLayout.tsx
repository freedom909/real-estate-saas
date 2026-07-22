"use client";

import AdminSidebar from "./AdminSidebar";
import NotificationBell from "./NotificationBell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-3 flex justify-end">
          <NotificationBell />
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
