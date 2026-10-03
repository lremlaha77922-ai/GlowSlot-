import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { productService } from '../services/productService';
import { mockProducts } from '../../../data/mockProducts';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useCartStore } from '../../../store/useCartStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Sparkles,
  Check,
} from 'lucide-react';

interface ProductDetailScreenProps {
  productId: string;
  onBack: () => void;
  onOpenCart: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onBack,
  onOpenCart,
}) => {
  const [product, setProduct] = useState<Product>(
    () => mockProducts.find((p) => p.id === productId) || mockProducts[0]
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { user } = useSessionStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addProduct, getItemQty, updateQty } = useCartStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    const load = async () => {
      const p = await productService.getById(productId);
      if (p) setProduct(p);
    };
    load();
  }, [productId]);

  const isWishlisted = wishlistIds.includes(product.id);
  const qty = getItemQty(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product.id, user?.id);
    showToast(
      added
        ? `Added ${product.name} to wishlist`
        : `Removed ${product.name} from wishlist`
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      showToast('Product link copied to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Floating App Bar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border/80 h-14 px-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="text-xs font-bold text-text truncate max-w-[200px]">
          {product.brand}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleWishlist}
            className="p-2 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart
              size={18}
              className={isWishlisted ? 'fill-accent text-accent' : ''}
            />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </header>

      {/* Product Image Gallery with Dots */}
      <div className="relative w-full aspect-square bg-muted/15 overflow-hidden">
        <img
          src={product.images[activeImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {product.images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activeImageIndex ? 'w-5 bg-primary' : 'w-1.5 bg-black/30'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Details */}
      <main className="p-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {product.brand} • {product.category}
            </span>

            {discountPercent > 0 && (
              <span className="text-[10px] font-bold text-white bg-deal px-2 py-0.5 rounded-chip">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <h1 className="text-base font-bold text-text mt-1 leading-snug">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-deal/15 px-2 py-0.5 rounded-chip text-stone-900 dark:text-deal font-bold text-xs">
              <Star size={12} className="fill-deal text-deal" />
              <span>{product.rating}</span>
            </div>
            <span className="text-xs text-muted">
              ({product.reviewCount} customer reviews)
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xl font-bold text-primary tabular-nums">
              {formatMoney(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted line-through tabular-nums">
                {formatMoney(product.originalPrice)}
              </span>
            )}
            <span className="text-[11px] text-muted">Inclusive of all taxes</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2">
            Key Highlights
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-text">
            {product.features.map((feat) => (
              <div key={feat} className="flex items-center gap-1.5">
                <Check size={14} className="text-success shrink-0" />
                <span className="text-[11px] truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-1.5">
            Product Description
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Delivery & Trust */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-card bg-surface border border-border flex items-center gap-2.5">
            <Truck size={18} className="text-primary shrink-0" />
            <div>
              <span className="font-bold text-text block">Express Delivery</span>
              <span className="text-[10px] text-muted">Same-day in Bengaluru</span>
            </div>
          </div>

          <div className="p-3 rounded-card bg-surface border border-border flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-success shrink-0" />
            <div>
              <span className="font-bold text-text block">100% Genuine</span>
              <span className="text-[10px] text-muted">Direct from salon labs</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar per Design.md 8.10 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 p-3 max-w-lg mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-muted uppercase tracking-wider block">
            Item Price
          </span>
          <span className="text-base font-bold text-primary tabular-nums">
            {formatMoney(product.price)}
          </span>
        </div>

        {qty > 0 ? (
          <div className="flex items-center gap-3">
            <div className="h-10 px-3 rounded-button bg-surface border border-primary flex items-center gap-3 shadow-xs">
              <button
                onClick={() => updateQty(product.id, -1)}
                className="w-5 h-5 flex items-center justify-center text-primary cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold text-primary tabular-nums min-w-[20px] text-center">
                {qty}
              </span>
              <button
                onClick={() => updateQty(product.id, 1)}
                className="w-5 h-5 flex items-center justify-center text-primary cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={onOpenCart}
            >
              View Cart
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="flex-1 max-w-xs"
            onClick={() => {
              addProduct(product);
              showToast(`Added ${product.name} to cart.`);
            }}
          >
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};
