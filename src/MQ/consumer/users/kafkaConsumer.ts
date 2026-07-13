
import userService from '@/subgraphs/user/services/user.service';
import { validateMessage } from '../../validateMessage';
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
 * Registers a hoost user.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @param {string} nickname - User's nickname
 * @param {string} inviteCode - Invitation code
 * @param {string} picture - User's picture
 * @returns {Object} - Status object indicating success or failure
 */
async function registerTenant(email, password, name, nickname, inviteCode, picture) {
  try {
    const isValidInviteCode = await validateInviteCode(inviteCode);
    if (!isValidInviteCode) {
      return { success: false, message: 'Invalid invite code' };
    }

    const result = await userService.register({ email, password, name, nickname, role: 'OWNER', picture });
    const { userId, username } = result.data;

    // Store user data in the repository
    await userRepository.insertUser({ email, name, nickname, role: 'OWNER', picture, _id: userId });

    await sendRegisterMessage(userId, username);
    return { success: true, message: 'Tenant registered successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Registers a customer user.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's name
 * @param {string} nickname - User's nickname
 * @param {string} picture - User's picture
 * @returns {Object} - Status object indicating success or failure
 */
async function registerCustomer(email, password, name, nickname, picture) {
  try {
    const result = await userService.register({ email, password, name, nickname, role: 'CUSTOMER', picture });
    const { userId, username } = result.data;

    // Store user data in the repository
    await userRepository.insertUser({ email, name, nickname, role: 'CUSTOMER', picture, _id: userId });

    await sendRegisterMessage(userId, username);
    return { success: true, message: 'Customer registered successfully' };
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
    consumer.send(payloads, (err, data) => {
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

export { registerTenant, registerCustomer, getUserById };
