// Mock Prisma client
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    batch: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "../config/database";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../services/cart.service";

describe("Cart Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return empty cart when no items", async () => {
      (prisma.cart.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // First call returns null (no cart)
        .mockResolvedValueOnce({ id: "cart-123", items: [] }); // Second call after creation
      (prisma.cart.create as jest.Mock).mockResolvedValue({ id: "cart-123" });

      const result = await getCart("user-123");

      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([]);
      expect(result.data.summary.totalItems).toBe(0);
    });
  });

  describe("addToCart", () => {
    const mockBatch = {
      id: "batch-123",
      status: "VALID",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      remainingQuantity: 100,
      medicine: { name: "Paracetamol" },
    };

    it("should add new item to cart", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(mockBatch);
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.cartItem.create as jest.Mock).mockResolvedValue({
        id: "item-123",
        batchId: "batch-123",
        quantity: 2,
      });

      const result = await addToCart("user-123", "batch-123", 2);

      expect(result.success).toBe(true);
      expect(result.data.message).toContain("Paracetamol");
    });

    it("should update quantity if item already in cart", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(mockBatch);
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: "item-123",
        quantity: 2,
      });
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        id: "item-123",
        quantity: 4,
      });

      const result = await addToCart("user-123", "batch-123", 2);

      expect(result.success).toBe(true);
      expect(prisma.cartItem.update).toHaveBeenCalled();
    });

    it("should reject non-existent batch", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await addToCart("user-123", "invalid-batch", 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Batch not found");
    });

    it("should reject recalled batch", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue({
        ...mockBatch,
        status: "RECALLED",
      });

      const result = await addToCart("user-123", "batch-123", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("recalled");
    });

    it("should reject expired batch", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue({
        ...mockBatch,
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      });

      const result = await addToCart("user-123", "batch-123", 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("should reject if quantity exceeds available", async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue({
        ...mockBatch,
        remainingQuantity: 5,
      });

      const result = await addToCart("user-123", "batch-123", 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain("5 units available");
    });
  });

  describe("updateCartItem", () => {
    it("should update cart item quantity", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: "item-123",
        batch: { remainingQuantity: 100 },
      });
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        id: "item-123",
        quantity: 5,
      });

      const result = await updateCartItem("user-123", "batch-123", 5);

      expect(result.success).toBe(true);
    });

    it("should reject if item not in cart", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await updateCartItem("user-123", "batch-123", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item not found in cart");
    });

    it("should reject if quantity exceeds available", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: "item-123",
        batch: { remainingQuantity: 5 },
      });

      const result = await updateCartItem("user-123", "batch-123", 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain("5 units available");
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue({
        id: "item-123",
      });
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue({});

      const result = await removeFromCart("user-123", "batch-123");

      expect(result.success).toBe(true);
      expect(result.data.message).toBe("Item removed from cart");
    });

    it("should reject if item not found", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await removeFromCart("user-123", "batch-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item not found in cart");
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
      });
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await clearCart("user-123");

      expect(result.success).toBe(true);
      expect(result.data.message).toBe("Cart cleared");
    });
  });

  describe("getCartCount", () => {
    it("should return zero for empty cart", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getCartCount("user-123");

      expect(result.success).toBe(true);
      expect(result.data.itemCount).toBe(0);
      expect(result.data.totalUnits).toBe(0);
    });

    it("should return correct counts", async () => {
      (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
        _count: { items: 3 },
        items: [{ quantity: 2 }, { quantity: 5 }, { quantity: 1 }],
      });

      const result = await getCartCount("user-123");

      expect(result.success).toBe(true);
      expect(result.data.itemCount).toBe(3);
      expect(result.data.totalUnits).toBe(8);
    });
  });
});
