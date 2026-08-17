"use client";

import RoleGuard from "../components/shared/RoleGuard";

export default function AgentPageWrapper() {
  return (
    <RoleGuard allowedRoles={["AGENT", "ADMIN", "SUPER_ADMIN"]}>
      <AgentOverview />
    </RoleGuard>
  );
}

function AgentOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agent Overview</h1>
        <p className="text-sm text-gray-500">Customer support and booking assistance</p>
      </div>
      <p className="text-gray-500">Use the sidebar to navigate to Customers, Bookings, or Listings.</p>
    </div>
  );
}
