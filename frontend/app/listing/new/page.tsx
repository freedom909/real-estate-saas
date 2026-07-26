"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ListingNewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/listings/new");
  }, [router]);

  return <p className="p-6">Redirecting to admin listing page...</p>;
}
