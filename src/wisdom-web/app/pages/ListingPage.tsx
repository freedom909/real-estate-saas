// src/wisdom-web/app/pages/ListingPage.ts

import { usePermission } from "../permission/usePermission";
import AdminPanel from "./components/AdminPanel";


function ListingPage() {
  const { can } = usePermission();

  return (
    <div>
      {can("listing:create") && (
        <button>创建房源</button>
      )}

      {can("admin:panel") && (
        <AdminPanel />
      )}
    </div>
  );
}

export default ListingPage;