class GetAdminDashboardUseCase {

constructor(

private bookingClient: BookingClient,

private listingClient: ListingClient,

private reviewClient: ReviewClient

) {}

async execute(userId: string) {

const [bookings, listings, reviews] = await Promise.all([

this.bookingClient.getByUserId(userId),

this.listingClient.getByOwnerId(userId),

this.reviewClient.getByUserId(userId),

]);

return { bookings, listings, reviews };

}

}