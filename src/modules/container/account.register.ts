// Account Subgraph — Container Registration
import { container } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";

// Gateways
import { BookingGateway } from "@/core/account/infra/gateways/booking.gateway";
import { ListingGateway } from "@/core/account/infra/gateways/listing.gateway";
import { ReviewGateway } from "@/core/account/infra/gateways/review.gateway";

// ACL Adapters
import { BookingACL } from "@/core/account/infra/booking.acl";
import { ListingACL } from "@/core/account/infra/listing.acl";
import { ReviewACL } from "@/core/account/infra/review.acl";

// Use Cases
import { GetMyDashboardUseCase } from "@/core/account/application/usecase/get-my-dashboard.usecase";
import { GetOwnerDashboardUseCase } from "@/core/account/application/usecase/get-owner-dashboard.usecase";
import { GetAdminDashboardUseCase } from "@/core/account/application/usecase/get-admin-dashboard.usecase";
import { TenantACL } from "@/core/account/infra/tenant.acl";

export default function registerAccountDependencies() {
  // --- Gateways (Apollo Federation communication) ---
  container.register(TOKENS_ACCOUNT.BookingGateway, { useClass: BookingGateway });
  container.register(TOKENS_ACCOUNT.ListingGateway, { useClass: ListingGateway });
  container.register(TOKENS_ACCOUNT.ReviewGateway, { useClass: ReviewGateway });

  // --- ACL Adapters (normalize external data for domain) ---
  container.register(TOKENS_ACCOUNT.BookingACL, { useClass: BookingACL });
  container.register(TOKENS_ACCOUNT.ListingACL, { useClass: ListingACL });
  container.register(TOKENS_ACCOUNT.ReviewACL, { useClass: ReviewACL });
  container.registerSingleton(TOKENS_ACCOUNT.TenantACL, TenantACL);

  // --- Use Cases ---
  container.register(TOKENS_ACCOUNT.GetMyDashboardUseCase, { useClass: GetMyDashboardUseCase });
  container.register(TOKENS_ACCOUNT.GetOwnerDashboardUseCase, { useClass: GetOwnerDashboardUseCase });
  container.register(TOKENS_ACCOUNT.GetAdminDashboardUseCase, { useClass: GetAdminDashboardUseCase });
}
