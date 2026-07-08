// src/wisdom-web/app/pages/listing.ts

import { listingService } from "../services/listing.service";
import { usePermission } from "../permission/usePermission";

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