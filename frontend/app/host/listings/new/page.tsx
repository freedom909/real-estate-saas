//src/app/host/listings/new/page.tsx

"use client";

import RoleGuard from "@/app/components/shared/RoleGuard";
import CreateListingForm from "@/app/components/listing/CreateListingForm";

export default function HostCreateListingPage() {
  return (
    <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]}>
      <CreateListingForm />
    </RoleGuard>
  );
}
