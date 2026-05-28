import validateInviteCode from '../../infrastructure/helpers/validateInvitecode.js';
import { userService } from '../../../services/users/datasources/userService.js';
import { Kafka } from 'kafkajs';
import UserRepository from '../../infrastructure/UserRepository.js';
import { MongoClient } from 'mongodb';
import { validateMessage } from '../../validateMessage.js';
import dotenv from 'dotenv';
dotenv.config();

// Database connection
const dbClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
await dbClient.connect();
const db = dbClient.db(process.env.DB_NAME);

// Create an instance of UserRepository
const userRepository = new UserRepository(db);

// Create a new Kafka instance
const kafka = new Kafka({
  clientId: 'my-kafka-consumer',
  brokers: ['localhost:9092'], // Update with your Kafka broker's address
});

// Create a consumer instance
const consumer = kafka.consumer({ groupId: 'my-group' });

/**
 * Registers a host user.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @param {string} nickname - User's nickname
 * @param {string} inviteCode - Invitation code
 * @param {string} picture - User's picture
 * @returns {Object} - Status object indicating success or failure
 */
async function registerHost(email, password, name, nickname, inviteCode, picture) {
  try {
    const isValidInviteCode = await validateInviteCode(inviteCode);
    if (!isValidInviteCode) {
      return { success: false, message: 'Invalid invite code' };
    }

    const result = await userService.register({ email, password, name, nickname, role: 'HOST', picture });
    const { userId, username } = result.data;

    // Store user data in the repository
    await userRepository.insertUser({ email, name, nickname, role: 'HOST', picture, _id: userId });

    await sendRegisterMessage(userId, username);
    return { success: true, message: 'Host registered successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Registers a guest user.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @param {string} nickname - User's nickname
 * @param {string} picture - User's picture
 * @returns {Object} - Status object indicating success or failure
 */
async function registerGuest(email, password, name, nickname, picture) {
  try {
    const result = await userService.register({ email, password, name, nickname, role: 'GUEST', picture });
    const { userId, username } = result.data;

    // Store user data in the repository
    await userRepository.insertUser({ email, name, nickname, role: 'GUEST', picture, _id: userId });

    await sendRegisterMessage(userId, username);
    return { success: true, message: 'Guest registered successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Sends a registration message to Kafka.
 * @param {string} userId - User ID
 * @param {string} username - Username
 */
const sendRegisterMessage = async (userId, username) => {
  try {
    // Create a message to send
    const message = {
      userId,
      username,
      timestamp: new Date().toISOString(),
    };

    // Validate the message
    const isValid = validateMessage(message);
    if (!isValid) {
      console.error('Invalid message:', message);
      return;
    }

    // Prepare the Kafka message
    const kafkaMessage = JSON.stringify(message);
    const payloads = [
      {
        topic: 'register-topic',
        messages: kafkaMessage,
        partition: 0, // Optional: specify the partition
      },
    ];

    // Send the message to a Kafka topic named 'register-topic'
    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Error sending registration message to Kafka:', err);
      } else {
        console.log('Registration message sent successfully:', data);
      }
    });
  } catch (error) {
    console.error('Error sending registration message to Kafka:', error);
  }
};


/**
 * Retrieves user data by userId using UserRepository.
 * @param {string} userId - User ID
 * @returns {Object} - User data or null if not found
 */
async function getUserById(userId) {
  const userFromDb = await userRepository.getUserFromDb(userId);
  if (userFromDb) {
    return userFromDb;
  }

  const userFromApi = await userRepository.getUserByIdFromApi(userId);
  return userFromApi;
}

export { registerHost, registerGuest, getUserById };
