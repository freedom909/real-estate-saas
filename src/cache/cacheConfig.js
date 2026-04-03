// cache/cacheConfig.js - Unified cache configuration

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  // Booking related caches
  BOOKING_DETAILS: 3600, // 1 hour
  BOOKING_LIST: 300,     // 5 minutes
  BOOKING_QUERY: 300,    // 5 minutes
  
  // Listing related caches
  LISTING_DETAILS: 1800, // 30 minutes
  LISTING_PRICE: 3600,    // 1 hour
  LISTING_SEARCH: 300,    // 5 minutes
  
  // User related caches
  USER_PROFILE: 1800,    // 30 minutes
  USER_BOOKINGS: 300,    // 5 minutes
  
  // System caches
  SYSTEM_CONFIG: 86400,  // 24 hours
  ANALYTICS_DATA: 1800,   // 30 minutes
};

// Cache key patterns
export const CACHE_KEYS = {
  // Booking keys
  BOOKING_DETAIL: (bookingId) => `booking:${bookingId}`,
  BOOKING_LIST: (userId, listingId, status) => `bookings:${userId}:${listingId}:${status || 'all'}`,
  BOOKING_QUERY: (queryParams) => `booking_query:${JSON.stringify(queryParams)}`,
  
  // Listing keys
  LISTING_DETAIL: (listingId) => `listing:${listingId}`,
  LISTING_PRICE: (listingId, checkIn, checkOut) => `price:${listingId}:${checkIn}:${checkOut}`,
  LISTING_SEARCH: (searchParams) => `listing_search:${JSON.stringify(searchParams)}`,
  
  // User keys
  USER_PROFILE: (userId) => `user:${userId}`,
  USER_BOOKINGS: (userId) => `user_bookings:${userId}`,
  
  // System keys
  SYSTEM_CONFIG: (configKey) => `config:${configKey}`,
  ANALYTICS_DATA: (analyticsKey) => `analytics:${analyticsKey}`,
};

// Cache invalidation patterns
export const CACHE_INVALIDATION = {
  // When booking is created/updated/deleted
  ON_BOOKING_CHANGE: ['booking:*', 'bookings:*', 'user_bookings:*'],
  
  // When listing is updated
  ON_LISTING_CHANGE: ['listing:*', 'price:*', 'listing_search:*'],
  
  // When user profile is updated
  ON_USER_CHANGE: ['user:*', 'user_bookings:*'],
};

// Cache statistics and monitoring
export const CACHE_MONITORING = {
  ENABLE_STATS: true,
  STATS_INTERVAL: 60000, // 1 minute
  MAX_CACHE_SIZE: 10000, // Maximum cache entries
  WARNING_THRESHOLD: 0.8, // 80% utilization warning
};

export default {
  TTL: CACHE_TTL,
  KEYS: CACHE_KEYS,
  INVALIDATION: CACHE_INVALIDATION,
  MONITORING: CACHE_MONITORING,
};