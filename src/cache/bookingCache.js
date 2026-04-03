// cache/bookingCache.js
import cacheClient from './cacheClient.js';

const CACHE_TTL = 60 * 60; // 1 hour TTL for booking cache

class BookingCache {
  static async getBookingById(bookingId) {
    const cacheKey = `booking_${bookingId}`;
    return await cacheClient.get(cacheKey);
  }

  static async setBooking(bookingId, bookingData) {
    const cacheKey = `booking_${bookingId}`;
    await cacheClient.set(cacheKey, bookingData, CACHE_TTL);
  }

  static async clearBookingCache(bookingId) {
    const cacheKey = `booking_${bookingId}`;
    await cacheClient.del(cacheKey);
  }

  // Clear all booking-related caches when booking status changes
  static async clearBookingRelatedCaches(bookingId, listingId, guestId) {
    const cacheKeys = [
      `booking_${bookingId}`,
      `bookings:${guestId}:*`,
      `bookings:*:${listingId}:*`
    ];
    
    for (const key of cacheKeys) {
      await cacheClient.del(key);
    }
  }
}

export default BookingCache;
