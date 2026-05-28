const resolvers = {
  Query: {
    getCart: async (_, { cartId }, { dataSources }) => {
      return dataSources.cartService.getCart(cartId);
    },
    getCartsByGuest: async (_, { guestId }, { dataSources }) => {
      return dataSources.cartService.getCartsByGuest(guestId);
    },
  },
  Mutation: {
    addToCart: async (_, { input }, { dataSources }) => {
      const cart = await dataSources.cartService.addToCart(input.cartId, input);
      return {
        code: 200,
        success: true,
        message: 'Item added to cart',
        cart,
      };
    },
    updateCartItem: async (_, { input }, { dataSources }) => {
      const cart = await dataSources.cartService.updateCartItem(input.cartId, input);
      return {
        code: 200,
        success: true,
        message: 'Item updated',
        cart,
      };
    },
    removeFromCart: async (_, { input }, { dataSources }) => {
      const cart = await dataSources.cartService.removeFromCart(input.cartId, input.itemId);
      return {
        code: 200,
        success: true,
        message: 'Item removed',
        cart,
      };
    },
  },
};
export default resolvers;
