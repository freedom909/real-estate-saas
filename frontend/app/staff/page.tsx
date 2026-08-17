"use client";

import RoleGuard from "../components/shared/RoleGuard";

export default function StaffPageWrapper() {
  return (
    <RoleGuard allowedRoles={["STAFF", "ADMIN", "SUPER_ADMIN"]}>
      <StaffOverview />
    </RoleGuard>
  );
}

function StaffOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Overview</h1>
        <p className="text-sm text-gray-500">Basic operations and management</p>
      </div>
      <p className="text-gray-500">Use the sidebar to navigate to Bookings, Listings, or Operations.</p>
    </div>
  );
}
