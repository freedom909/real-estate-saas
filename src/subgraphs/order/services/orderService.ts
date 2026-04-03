// services/orderService.ts
import { inject, injectable } from 'tsyringe';
import OrderRepository from '../repos/orderRepository';

@injectable()
class OrderService {
  constructor(
    @inject("OrderRepository")
    private orderRepository, 
    @inject('sequelize')
    private sequelize ) {
    if (!orderRepository || !sequelize) {
      throw new Error('Invalid dependencies');
    }       
    
    this.orderRepository = orderRepository;
    this.sequelize = sequelize;
  }

  async getOrderById(id) {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrdersByGuest(guestId) {
    try {
      return await this.orderRepository.findAll({ guestId });
    } catch (error) {
      console.error('Error fetching orders by guest:', error);
      throw error;
    }
  }

  async getOrdersByHost(hostId) {
    try {
      // In a real implementation, you'd join with listings table to get host's orders
      // For now, return all orders
      return await this.orderRepository.findAll();
    } catch (error) {
      console.error('Error fetching orders by host:', error);
      throw error;
    }
  }

  async getPendingOrders() {
    try {
      return await this.orderRepository.findAll({ status: 'PENDING' });
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      const newOrder = {
        ...orderData,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.orderRepository.create(newOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      // If confirming order, also update payment status
      if (status === 'CONFIRMED') {
        updateData.status = 'SUCCEEDED';
      }

      await this.orderRepository.update(orderId, updateData);
      return await this.getOrderById(orderId);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'CANCELLED');
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  async confirmOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'CONFIRMED');
    } catch (error) {
      console.error('Error confirming order:', error);
      throw error;
    }
  }
}

export default OrderService;