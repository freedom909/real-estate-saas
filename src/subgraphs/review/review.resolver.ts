

import { v4 as uuidv4 } from 'uuid';

const { bookingsWithPermission } = permissions;
const resolvers = {

  Query: {
    bookingsByOrder: requireAuth(async (_, { orderId }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view bookings');
      }
      
      try {
        // In a real implementation, you'd query bookings by orderId
        // For now, return all bookings for the authenticated user
        const bookings = await dataSources.bookingService.getBookingsForGuest(user.id);
        return bookings.filter(booking => booking.orderId === orderId);
      } catch (error) {
        console.error('Error fetching bookings by order:', error);
        throw new AuthenticationError('Failed to fetch bookings');
      }
    }),

    booking: requireAuth(async (_, { id }, { dataSources, user }) => {
      if (!listingId && !guestId) {
        throw new ForbiddenError('No such booking', { extensions: { code: 'FORBIDDEN' } });
      }
      if (bookingsWithPermission) {
        const existingListing = await Listing.findOne({
          where: { id: listingId },
        });
        if (!existingListing) {
          throw new ForbiddenError('Listing not found', { extensions: { code: 'FORBIDDEN' } });
        }
      }
      const cacheKey = `booking_${id}`;

      // Try to get the booking from cache
      let booking = await cacheClient.get(cacheKey);
      if (booking) {
        booking = JSON.parse(booking); // Parse the cached string
      } else {
        // Cache miss: Fetch from DB or other data source
        booking = await dataSources.bookingService.getBookingById(id);

        // Set cache for future requests (serialize before storing)
        await cacheClient.set(cacheKey, JSON.stringify(booking), 3600); // Cache for 1 hour
      }

      return booking;
    }),
    bookingsForGuest: requireAuth(async (_, { userId }, { dataSources, context }) => {
      if (!userId) {
        throw new AuthenticationError('You need to be logged in to view bookings');
      }
      const existingUser = await User.findOne({ where: { id: userId } });
      if (!existingUser) {
        throw new ForbiddenError('User not found', { extensions: { code: 'FORBIDDEN' } });
      }
      if (existingUser.role === 'GUEST') {
        return Booking.findAll({ where: { guestId: context.userId } });
      }
      return dataSources.bookingService.getBookingsForGuest(userId);
    }),

    bookingsForHost: requireRole('HOST', async (_, { listingId, status }, { dataSources, userId }) => {
      if (!listingId) {
        throw new UserInputError('Listing ID is required', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      if (!userId) {
        throw new AuthenticationError('User ID is missing', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const cacheKey = `bookings:${userId}:${listingId}:${status || 'all'}`;
      // Try to retrieve from cache first
      const cachedData = await cacheClient.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      const existingUser = await User.findOne({ where: { id: userId } });
      if (!existingUser) {
        throw new ForbiddenError('User not found', { extensions: { code: 'FORBIDDEN' } });
      }

      // No need to check `existingUser.role === 'HOST'` if `requireRole` does that

      // Fetch bookings with optional status filter
      const whereClause = { listingId };
      if (status) {
        whereClause.status = status;
      }
      const bookings = Booking.findAll({ where: whereClause });
      // Cache the result before returning it (with a TTL, e.g., 5 minutes)
      await cacheClient.set(cacheKey, bookings, 300); // Cache for 5 minutes
      return bookings;
    }),

    currentGuestBooking: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getCurrentGuestBooking(userId);
    }),
    guestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId);
    }),
    pastGuestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId, 'COMPLETED');
    }),
    upcomingGuestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId, 'UPCOMING');
    }),
  },

  Mutation: {
    createBooking: requireAuth(async (_, { input }, { dataSources, user }) => {
      const { checkInDate, checkOutDate, listingId, orderId } = input;
      
      // Validate input data
      if (!listingId || !checkInDate || !checkOutDate || new Date(checkInDate) > new Date(checkOutDate)) {
        throw new UserInputError('All booking details must be provided and check-out date must be after check-in date.');
      }
      
      const { listingService, bookingService } = dataSources;

      if (!listingService || !bookingService) {
        throw new Error('Data sources are not available.');
      }

      // Use authenticated user's ID as guestId
      const guestId = user?.id;
      if (!guestId) {
        throw new AuthenticationError('You must be logged in to create a booking');
      }

      try {
        // Fetch total cost from the listing service
        const { totalCost } = await listingService.getTotalCost({ 
          id: listingId, 
          checkInDate, 
          checkOutDate 
        });

        // Create booking with order reference if provided
        const bookingData = {
          id: uuidv4(),
          listingId,
          checkInDate,
          checkOutDate,
          totalCost,
          guestId,
          status: 'UPCOMING',
        };

        // Add order reference if provided
        if (orderId) {
          bookingData.orderId = orderId;
        }

        const booking = await bookingService.createBooking(bookingData);
        
        // Send MQ notification for booking creation
        await bookingMQService.notifyBookingCreated(booking);
        
        // Schedule booking reminders
        await bookingMQService.scheduleBookingReminders(booking);
        
        // Broadcast booking creation to subscribers
        broadcast(subscriptionTopics.BOOKING_CREATED, booking);
        
        return {
          code: 200,
          success: true,
          message: 'Your booking has been successfully created',
          booking,
        };
      } catch (error) {
        console.error('Booking Error:', error);
        throw new ForbiddenError('Unable to create booking at this time', { extensions: { code: 'FORBIDDEN' } });
      }
    }),

   cancelBooking: requireAuth(async (_, { id }, { dataSources, user }) => {
  const { listingService, bookingService } = dataSources;
  const guestId = user?.id;

  if (!guestId) {
    throw new AuthenticationError('You need to be logged in as a guest to cancel a booking'); 
  }
  if (!listingService || !bookingService) {
    throw new Error('Data sources are not available.');
  }

  // First, get the booking
  const booking = await bookingService.getBookingById(id);
  if (!booking) {
    throw new ForbiddenError('Booking not found', { extensions: { code: 'NOT_FOUND' } });
  }

  // Ensure the logged-in guest is the owner
  if (booking.guestId !== guestId) {
    throw new ForbiddenError('Insufficient permissions', { extensions: { code: 'FORBIDDEN' } });
  } 

  // Check booking status
  if (booking.status !== 'UPCOMING') {
    throw new ForbiddenError('Only upcoming bookings can be cancelled', { extensions: { code: 'FORBIDDEN' } });
  }

  // Ensure cancellation happens before check-in
  const checkInTime = new Date(booking.checkInDate).getTime();
  if (checkInTime < Date.now()) {
    throw new ForbiddenError('Booking cannot be cancelled after the check-in time', { extensions: { code: 'FORBIDDEN' } });
  }

  try {
    await bookingService.updateBookingStatus({
      id,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });

    // Send MQ notification for booking cancellation
    await bookingMQService.notifyBookingCancelled(booking);

    // Notify subscribers
    broadcast(subscriptionTopics.BOOKING_CANCELLED, booking);

    // Release listing availability
    await listingService.releaseListing({
      id: booking.listingId,
      availability: true,
    });

    return {
      code: 200,
      success: true,
      message: 'Booking cancelled',
    };
  } catch (error) {
    throw new ForbiddenError('Unable to cancel booking', { extensions: { code: 'FORBIDDEN' } });
  }
}),

    confirmBooking: requireAuth(async (_, { id }, { dataSources, user }) => {
      const { bookingService } = dataSources
      const guestId = user?.id;
      if (!guestId) {
        throw new AuthenticationError('You need to be logged in as a guest to create a booking');
      }

      // Fetch the booking details from the database using the booking ID (id)
      const booking = await bookingService.getBookingById(id);

      if (!booking) {
        throw new ForbiddenError('Booking not found', { extensions: { code: 'NOT_FOUND' } });
      }

      // Check if the guestId in the booking matches the logged-in user's guestId
      if (booking.guestId !== guestId) {
        throw new ForbiddenError('Insufficient permissions', { extensions: { code: 'FORBIDDEN' } });
      }

      try {
        // Update the booking status to 'CONFIRMED'
        const updatedBooking = await bookingService.updateBookingStatus({
          id,
          status: 'CONFIRMED',
          confirmedAt: new Date().toISOString(),
        });

        // Send MQ notification for booking confirmation
        await bookingMQService.notifyBookingConfirmed(updatedBooking);

        // Broadcast the booking confirmation event
        broadcast(subscriptionTopics.BOOKING_CONFIRMED, updatedBooking);

        return {
          code: 200,
          success: true,
          message: 'Booking confirmed',
          booking: updatedBooking,
        };
      } catch (error) {
        throw new ForbiddenError('Unable to confirm booking', { extensions: { code: 'FORBIDDEN' } });
      }
    }),


  },
  Reviews: {
    booking: async ({ bookingId }, _, { dataSources }) => {
      return dataSources.bookingService.getBooking(bookingId);
    },
    author: async ({ authorId }, _, { dataSources }) => {
      return dataSources.userService.getUser(authorId);
    },
    createdAt: ({ createdAt }) => new Date(createdAt).toISOString(),

    // Resolve reference for federated queries
    __resolveReference: async (review, { dataSources }) => {
      return dataSources.reviewService.getReview(review.id);
    },
  },

  Booking: {
    listing: async ({ listingId }, _, { dataSources }) => {
      return dataSources.listingService.getListing(listingId);
    },
    guest: async ({ guestId }, _, { dataSources }) => {
      return dataSources.userService.getUser(guestId);
    },
    checkInDate: ({ checkInDate }) => new Date(checkInDate).toISOString(),
    checkOutDate: ({ checkOutDate }) => new Date(checkOutDate).toISOString(),
    status: async ({ id }, _, { dataSources }) => {
      const booking = await dataSources.bookingService.getBooking(id);
      return booking.status;
    },
    confirmedAt: ({ confirmedAt }) => confirmedAt ? new Date(confirmedAt).toISOString() : null,
    cancelledAt: ({ cancelledAt }) => cancelledAt ? new Date(cancelledAt).toISOString() : null,
    totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
      const { totalCost } = await dataSources.listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });
      return totalCost;
    },
    __resolveReference: async (booking, { dataSources }) => {
      return dataSources.bookingService.getBooking(booking.id);
    },
  },

  Guest: {
    __resolveReference: async (user, { dataSources }) => {
      return dataSources.userService.getUser(user.id);
    },
  },

  Listing: {
    bookings: async ({ id }, _, { dataSources }) => {
      return dataSources.bookingService.getBookingsForListing(id);
    },
    __resolveReference: async (listing, { dataSources }) => {
      return dataSources.listingService.getListing(listing.id);
    },
 
  },
  Subscription: {
    Subscription: {
      bookingCreated: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingCreated' };
          return { id };
        },
      },
      bookingConfirmed: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingConfirmed' };
          return { id };
        },
      },
      bookingCancelled: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingCancelled' };
          return { id };
        },
      },
    },
  },
};

export default resolvers;