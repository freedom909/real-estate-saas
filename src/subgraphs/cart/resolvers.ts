import { CartModel } from "@/core/cart/infrastructure/models/cart.model";
import { CartItemModel } from "@/core/cart/infrastructure/models/cartItem.model";
import { requireAuth } from "@/infrastructure/auth/require.auth";

export const resolvers = {
  Query: {
    getCart: async (_: any, { cartId }: { cartId: string }) => {
      return CartModel.findByPk(cartId, { include: [CartItemModel] });
    },
    getCartsByCustomer: async (_: any, { customerId }: { customerId: string }) => {
      return CartModel.findAll({
        where: { customerId },
        include: [CartItemModel],
      });
    },
  },

  Mutation: {
    addToCart: async (_: any, { input }: any, context: any) => {
      const user = await requireAuth(context);
      const cart = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      if (!cart) throw new Error("Cart not found");

      const existingItem = await CartItemModel.findOne({
        where: { cartId: input.cartId, listingId: input.listingId },
      });

      if (existingItem) {
        existingItem.quantity += input.quantity || 1;
        existingItem.price = input.price ?? existingItem.price;
        await existingItem.save();
      } else {
        await CartItemModel.create({
          cartId: input.cartId,
          listingId: input.listingId,
          quantity: input.quantity || 1,
          price: input.price || 0,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
        });
      }

      const updated = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      return { code: 200, success: true, message: "Item added to cart", cart: updated };
    },

    updateCartItem: async (_: any, { input }: any) => {
      const item = await CartItemModel.findByPk(input.itemId);
      if (!item) throw new Error("Cart item not found");

      if (input.quantity !== undefined) item.quantity = input.quantity;
      if (input.price !== undefined) item.price = input.price;
      await item.save();

      const cart = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      return { code: 200, success: true, message: "Item updated", cart };
    },

    removeFromCart: async (_: any, { input }: any) => {
      const item = await CartItemModel.findByPk(input.itemId);
      if (!item) throw new Error("Cart item not found");

      await item.destroy();
      const cart = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      return { code: 200, success: true, message: "Item removed", cart };
    },
  },

  Cart: {
    cartItems: async (parent: any) => {
      return CartItemModel.findAll({ where: { cartId: parent.id } });
    },
  },
};
