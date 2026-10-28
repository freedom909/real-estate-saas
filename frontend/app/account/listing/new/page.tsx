//frontend/app/account/listing/new/page.tsx

"use client";

import AccountLayout from "@/app/components/account/AccountLayout";
import RoleGuard from "@/app/components/shared/RoleGuard";
import CreateListingForm from "@/app/components/listing/CreateListingForm";

export default function AccountCreateListingPage() {
  return (
    <AccountLayout>
      <RoleGuard allowedRoles={["HOST", "OWNER", "ADMIN", "SUPER_ADMIN"]} fallback="/account">
        <CreateListingForm redirectAfterCreate="/host/listings" />
      </RoleGuard>
    </AccountLayout>
  );
}
