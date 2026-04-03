import Redis from 'ioredis';

// Initialize Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Use your Redis host
  port: process.env.REDIS_PORT || 6379,        // Use your Redis port
  password: process.env.REDIS_PASSWORD || null // Use password if needed
});

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis!');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Generic functions for caching
const cacheClient = {
  async set(key, value, ttlInSeconds = 3600) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
      console.log(`Cache set for key: ${key}`);
    } catch (error) {
      console.error(`Error setting cache for key: ${key}`, error);
    }
  },

  async get(key) {
    try {
      const value = await redis.get(key);
      if (value) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(value);
      } else {
        console.log(`Cache miss for key: ${key}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting cache for key: ${key}`, error);
      return null;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
      console.log(`Cache deleted for key: ${key}`);
    } catch (error) {
      console.error(`Error deleting cache for key: ${key}`, error);
    }
  },

  // Optional method to flush the entire Redis cache
  async flushAll() {
    try {
      await redis.flushall();
      console.log('All cache cleared');
    } catch (error) {
      console.error('Error flushing cache:', error);
    }
  }
};

export default cacheClient;
