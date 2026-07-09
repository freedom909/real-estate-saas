// src/wisdom-web/app/pages/ListingPage.ts
"use client";
import { usePermission } from "../permission/usePermission";
import {listingService }from "app/services/listing.service";


export default function ListingPage() {
    const { can } = usePermission();

    if (!can("listing:create")) {
        return null;
    }

    const handleCreate = async () => {
        const data = await listingService.getAll();
        console.log(data);
    };

    return (
        <button onClick={handleCreate}>
            创建房源
        </button>
    );
}

