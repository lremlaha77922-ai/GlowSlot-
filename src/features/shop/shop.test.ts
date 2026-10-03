import { describe, it, expect, beforeEach } from 'vitest';
import { mockProducts } from '../../data/mockProducts';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

describe('Shop & Wishlist (Phase 4B)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();
  });

  it('contains exactly 12 mock products across 4 categories', () => {
    expect(mockProducts.length).toBe(12);

    const categories = ['Hair', 'Beard', 'Skin', 'Tools'];
    categories.forEach((cat) => {
      const items = mockProducts.filter((p) => p.category === cat);
      expect(items.length).toBe(3);
    });
  });

  it('adds a product to cart and increments subtotal', () => {
    const product = mockProducts[0]; // Rs.399 (39900 paise)
    useCartStore.getState().addProduct(product);

    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].name).toBe(product.name);
    expect(items[0].type).toBe('product');
    expect(items[0].qty).toBe(1);
    expect(useCartStore.getState().getSubtotalPaise()).toBe(39900);

    // Adding same product again increments qty
    useCartStore.getState().addProduct(product);
    expect(useCartStore.getState().items[0].qty).toBe(2);
    expect(useCartStore.getState().getSubtotalPaise()).toBe(79800);
  });

  it('toggles wishlist items correctly', () => {
    const product = mockProducts[1];
    expect(useWishlistStore.getState().isInWishlist(product.id)).toBe(false);

    // Add to wishlist
    const added = useWishlistStore.getState().toggleWishlist(product.id);
    expect(added).toBe(true);
    expect(useWishlistStore.getState().isInWishlist(product.id)).toBe(true);
    expect(useWishlistStore.getState().getWishlistProducts().length).toBe(1);

    // Remove from wishlist
    const removed = useWishlistStore.getState().toggleWishlist(product.id);
    expect(removed).toBe(false);
    expect(useWishlistStore.getState().isInWishlist(product.id)).toBe(false);
  });
});
