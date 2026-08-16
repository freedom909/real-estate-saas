"use client";

import AccountSidebar from "./AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AccountSidebar />
      <div className="flex-1">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
