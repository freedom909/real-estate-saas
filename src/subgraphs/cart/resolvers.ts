import { CartModel } from "@/core/cart/infrastructure/models/cart.model";
import { CartItemModel } from "@/core/cart/infrastructure/models/cartItem.model";
import { requireAuth } from "@/infrastructure/auth/require.auth";

async function recalculateCartPrice(cartId: string) {
  const items = await CartItemModel.findAll({ where: { cartId } });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await CartModel.update({ price: total }, { where: { id: cartId } });
}

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
    createCart: async (_: any, { input }: any, context: any) => {
      const user = await requireAuth(context);
      const cart = await CartModel.create({
        customerId: input.customerId,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        price: 0,
      });
      return { code: 200, success: true, message: "Cart created", cart };
    },

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

      await recalculateCartPrice(input.cartId);
      const cart = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      return { code: 200, success: true, message: "Item updated", cart };
    },

    removeFromCart: async (_: any, { input }: any) => {
      const item = await CartItemModel.findByPk(input.itemId);
      if (!item) throw new Error("Cart item not found");

      await item.destroy();
      await recalculateCartPrice(input.cartId);
      const cart = await CartModel.findByPk(input.cartId, { include: [CartItemModel] });
      return { code: 200, success: true, message: "Item removed", cart };
    },

    clearCart: async (_: any, { cartId }: { cartId: string }, context: any) => {
      const user = await requireAuth(context);
      const cart = await CartModel.findByPk(cartId);
      if (!cart) throw new Error("Cart not found");

      await CartItemModel.destroy({ where: { cartId } });
      cart.price = 0;
      await cart.save();

      return { code: 200, success: true, message: "Cart cleared", cart };
    },
  },

  Cart: {
    cartItems: async (parent: any) => {
      return CartItemModel.findAll({ where: { cartId: parent.id } });
    },
  },
};
