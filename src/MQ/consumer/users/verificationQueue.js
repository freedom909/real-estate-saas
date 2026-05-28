import { Queue } from 'bullmq';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

export const VERIFICATION_QUEUE_NAME = 'myMumberCard-verification';

/**
 * @type {Queue<import('../services/ai/myNumberCardService').VerificationPayload>}
 */
export const verificationQueue = new Queue(VERIFICATION_QUEUE_NAME, {
  connection: REDIS_CONNECTION,
});

export const addVerificationJob = async (payload) => {
  await verificationQueue.add('verify-mynumber', payload);
  console.log(`Added verification job for user ${payload.userId}`);
};