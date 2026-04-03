import pkg from 'ioredis';
const { createClient } = pkg;
const redisClient = createClient();

// A helper function to publish messages to Redis
function broadcast(topic, message) {
    redisClient.publish(topic, JSON.stringify(message));
}

const subscriptionTopics = {
    BOOKING_CREATED: 'bookingCreated',
    BOOKING_CANCELLED: 'bookingCancelled',
    BOOKING_CONFIRMED: 'bookingConfirmed',
};


export { broadcast, redisClient, subscriptionTopics };