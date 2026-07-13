// src/modules/container/account.register.ts

import { container } from "@/modules/container";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { BookingClient } from "@/core/account/application/adapter/booking.client";
import { ListingClient } from "@/core/account/application/adapter/listing.client";
import { ReviewClient } from "@/core/account/application/adapter/review.client";
import { GetOwnerDashboardUseCase } from "@/core/account/application/usecase/getOwnerDashboard.usecase";
import { BookingGateway } from "@/core/booking/bookingGateway";
import { ListingGateway } from "@/core/listing/listingGateway";
import { ReviewGateway } from "@/core/review/reviewGateway";

export function accountRegister() {
    container.register(TOKENS_ACCOUNT.BookingClient, BookingClient);
container.register(TOKENS_ACCOUNT.ListingClient, ListingClient);
container.register(TOKENS_ACCOUNT.ReviewClient, ReviewClient);
container.register(TOKENS_ACCOUNT.GetOwnerDashboardUseCase, GetOwnerDashboardUseCase);
container.register(TOKENS_ACCOUNT.BookingGateway, BookingGateway);
container.register(TOKENS_ACCOUNT.ListingGateway, ListingGateway);
container.register(TOKENS_ACCOUNT.ReviewGateway, ReviewGateway);
}
