// Import the KafkaJS library
import { Kafka } from 'kafkajs';

// Create a new Kafka instance
const kafka = new Kafka({
  clientId: 'my-kafka-producer',
  brokers: ['localhost:9092'], // Update with your Kafka broker's address
});

// Create a producer instance
const producer = kafka.producer();

// Function to initialize the Kafka producer
const initializeProducer = async () => {
  try {
    // Connect the producer to the Kafka brokers
    await producer.connect();
    console.log('Kafka producer connected successfully!');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

// Function to send a login message to Kafka
const sendLoginMessage = async (userId, username) => {
  try {
    // Create a message to send
    const message = {
      userId,
      username,
      timestamp: new Date().toISOString(),
    };

    // Send the message to a Kafka topic named 'login-topic'
    await producer.send({
      topic: 'login-topic',
      messages: [
        { value: JSON.stringify(message) },
      ],
    });

    console.log('Login message sent successfully:', message);
  } catch (error) {
    console.error('Error sending login message to Kafka:', error);
  }
};

// Export the functions to be used in other parts of your application
export default {
  initializeProducer,
  sendLoginMessage,
};
