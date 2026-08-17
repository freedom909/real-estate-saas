"use client";

import RoleGuard from "../components/shared/RoleGuard";

export default function ModeratorPageWrapper() {
  return (
    <RoleGuard allowedRoles={["MODERATOR", "ADMIN", "SUPER_ADMIN"]}>
      <ModeratorOverview />
    </RoleGuard>
  );
}

function ModeratorOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Moderator Overview</h1>
        <p className="text-sm text-gray-500">Content moderation and user reports</p>
      </div>
      <p className="text-gray-500">Use the sidebar to navigate to Reviews, User Content, or Reports.</p>
    </div>
  );
}
