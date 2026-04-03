// subgraph-orders/resolvers.js
import { AuthenticationError } from '../infrastructure/utils/errors.js';
import { requireAuth } from '../infrastructure/auth/authAndRole.js';

const resolvers = {
  Query: {
    order: async (_, { id }, { userId, dataSources }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      try {
        const order = await dataSources.orderService.getOrderById(id);
        return order;
      } catch (error) {
        console.error('Error fetching order:', error);
        throw new AuthenticationError('Failed to fetch order');
      }
    },
    
    ordersByGuest: async (_, { guestId }, { userId, dataSources }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      try {
        const orders = await dataSources.orderService.getOrdersByGuest(guestId);
        return orders;
      } catch (error) {
        console.error('Error fetching orders by guest:', error);
        throw new AuthenticationError('Failed to fetch orders');
      }
    },
    
    ordersByHost: async (_, { hostId }, { userId, dataSources }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      try {
        const orders = await dataSources.orderService.getOrdersByHost(hostId);
        return orders;
      } catch (error) {
        console.error('Error fetching orders by host:', error);
        throw new AuthenticationError('Failed to fetch orders');
      }
    },
    
    pendingOrders: async (_, __, { userId, dataSources }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view orders');
      }
      try {
        const orders = await dataSources.orderService.getPendingOrders();
        return orders;
      } catch (error) {
        console.error('Error fetching pending orders:', error);
        throw new AuthenticationError('Failed to fetch pending orders');
      }
    },
  },
  
  Mutation: {
    createOrder: requireAuth(async (_, { input }, { userId, dataSources }) => {
      try {
        const newOrder = await dataSources.orderService.createOrder({
          ...input,
          guestId: userId // Use authenticated user's ID as guestId
        });
        
        return {
          code: 201,
          success: true,
          message: 'Order created successfully',
          order: newOrder
        };
      } catch (error) {
        console.error('Error creating order:', error);
        return {
          code: 400,
          success: false,
          message: error.message || 'Failed to create order',
          order: null
        };
      }
    }),
    
    updateOrderStatus: requireAuth(async (_, { input }, { userId, dataSources }) => {
      try {
        const order = await dataSources.orderService.updateOrderStatus(input.orderId, input.status);
        
        return {
          code: 200,
          success: true,
          message: 'Order status updated successfully',
          order
        };
      } catch (error) {
        console.error('Error updating order status:', error);
        return {
          code: 400,
          success: false,
          message: error.message || 'Failed to update order status',
          order: null
        };
      }
    }),
    
    cancelOrder: requireAuth(async (_, { orderId }, { userId, dataSources }) => {
      try {
        const order = await dataSources.orderService.cancelOrder(orderId);
        
        return {
          code: 200,
          success: true,
          message: 'Order cancelled successfully',
          order
        };
      } catch (error) {
        console.error('Error cancelling order:', error);
        return {
          code: 400,
          success: false,
          message: error.message || 'Failed to cancel order',
          order: null
        };
      }
    }),
    
    confirmOrder: requireAuth(async (_, { orderId }, { userId, dataSources }) => {
      try {
        const order = await dataSources.orderService.confirmOrder(orderId);
        
        return {
          code: 200,
          success: true,
          message: 'Order confirmed successfully',
          order
        };
      } catch (error) {
        console.error('Error confirming order:', error);
        return {
          code: 400,
          success: false,
          message: error.message || 'Failed to confirm order',
          order: null
        };
      }
    }),
  },
  
  Order: {
    __resolveReference: async (reference, { dataSources }) => {
      try {
        return await dataSources.orderService.getOrderById(reference.id);
      } catch (error) {
        console.error('Error resolving order reference:', error);
        return null;
      }
    },
    
    guest: (order) => ({ id: order.guestId }),
    listing: (order) => ({ id: order.listingId })
  }
};

export default resolvers;