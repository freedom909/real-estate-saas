export const resolvers = {
    Query: {
        User: {

            myBookings: async (user, _, { bookingService }) => {

                return bookingService.getBookingsByCustomer(user.id);

            },

            myListings: async (user, _, { listingService }) => {

                return listingService.getListingsByOwner(user.id);

            },

            myReviews: async (user, _, { reviewService }) => {

                return reviewService.getReviewsByUser(user.id);

            },

        }
    } 
}