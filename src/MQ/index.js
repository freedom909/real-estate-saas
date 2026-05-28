// MQ/index.js - Main MQ system entry point
import bookingConsumer from './consumer/bookingConsumer.js';

// Start all MQ consumers
const startMQSystem = async () => {
  try {
    console.log('🚀 Starting MQ System...');
    
    // Start booking consumer
    await bookingConsumer.startConsuming();
    
    console.log('✅ MQ System started successfully');
    console.log('📥 Listening for booking events...');
    
  } catch (error) {
    console.error('❌ Failed to start MQ System:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('🛑 Shutting down MQ System...');
  process.exit(0);
};

// Handle process signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the MQ system
if (import.meta.url === `file://${process.argv[1]}`) {
  startMQSystem();
}

export default {
  startMQSystem,
  shutdown
};