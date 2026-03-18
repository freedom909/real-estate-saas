// infrastructure/utils/handleError.ts
import { GraphQLError } from 'graphql';

const handleError = (error: GraphQLError, context: any, operation: string) => {
    const { logger } = context;
    const errorDetails = {
      operation,
      code: error.extensions?.code || 'INTERNAL_ERROR',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  
    if (process.env.DEBUG_MODE === 'true') {
      logger.error('GraphQL operation failed', errorDetails);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_ERROR',
        stack: error.stack,
        timestamp: errorDetails.timestamp
      };
    }
  
    return {
      message: 'An error occurred',
      code: 'INTERNAL_ERROR'
    };
  };
  
  export default handleError;
  