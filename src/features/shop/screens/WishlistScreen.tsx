import React from 'react';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { ArrowLeft, Trash2, ShoppingBag, Heart, Star } from 'lucide-react';

interface WishlistScreenProps {
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onExploreShop: () => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onBack,
  onSelectProduct,
  onExploreShop,
}) => {
  const { getWishlistProducts, toggleWishlist, clearWishlist } = useWishlistStore();
  const { addProduct } = useCartStore();
  const { showToast } = useUIStore();

  const products = getWishlistProducts();

  const handleAddToCart = (product: (typeof products)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    addProduct(product);
    showToast(`Added ${product.name} to cart.`);
  };

  const handleRemove = (productId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
    showToast(`Removed ${name} from wishlist.`);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-text leading-tight">
              My Wishlist (S20)
            </h1>
            <span className="text-[10px] text-muted">
              {products.length} saved products
            </span>
          </div>
        </div>

        {products.length > 0 && (
          <button
            onClick={() => {
              clearWishlist();
              showToast('Wishlist cleared.');
            }}
            className="text-xs font-semibold text-error hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </header>

      {/* Main List */}
      <main className="p-4 max-w-lg mx-auto w-full">
        {products.length === 0 ? (
          <EmptyState
            icon={<Heart size={32} className="text-accent" />}
            title="Your wishlist is empty"
            helperText="Explore our salon-grade styling clays, beard oils, and grooming tools to save your favorites."
            actionLabel="Explore Shop"
            onAction={onExploreShop}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="bg-surface rounded-card border border-border/80 shadow-level-1 p-3 flex gap-3 cursor-pointer hover:border-primary/40 transition-all relative"
              >
                {/* 80x80 Square Image */}
                <div className="w-20 h-20 rounded-button bg-muted/20 shrink-0 overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between pr-7">
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase">
                      {product.brand}
                    </span>
                    <h3 className="text-xs font-bold text-text truncate mt-0.5">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                      <Star size={11} className="fill-deal text-deal" />
                      <span className="font-bold text-text">{product.rating}</span>
                      <span>({product.reviewCount})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border">
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {formatMoney(product.price)}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => handleRemove(product.id, product.name, e)}
                  className="absolute top-3 right-3 p-1.5 text-muted hover:text-error transition-colors cursor-pointer"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
