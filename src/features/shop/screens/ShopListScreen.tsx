import React, { useState } from 'react';
import { Product, ProductCategory } from '../../../types';
import { mockProducts } from '../../../data/mockProducts';
import { formatMoney } from '../../../utils/money';
import { Chip } from '../../../components/Chip';
import { Button } from '../../../components/Button';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { Star, Heart, Plus, Minus, ShoppingBag } from 'lucide-react';

const CATEGORIES: ('All' | ProductCategory)[] = ['All', 'Hair', 'Beard', 'Skin', 'Tools'];

interface ShopListScreenProps {
  onSelectProduct: (productId: string) => void;
  onOpenWishlist: () => void;
}

export const ShopListScreen: React.FC<ShopListScreenProps> = ({
  onSelectProduct,
  onOpenWishlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { addProduct, getItemQty, updateQty } = useCartStore();
  const { showToast } = useUIStore();

  const filteredProducts = mockProducts.filter((p) =>
    selectedCategory === 'All' ? true : p.category === selectedCategory
  );

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast(
      added
        ? `Added ${product.name} to wishlist`
        : `Removed ${product.name} from wishlist`
    );
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addProduct(product);
    showToast(`Added ${product.name} to cart.`);
  };

  return (
    <div className="flex-1 pb-24 bg-bg text-text">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h1 className="text-base font-bold text-text">Grooming Shop (S18)</h1>
            <p className="text-[11px] text-muted">Salon-grade formulas delivered home</p>
          </div>

          {/* Wishlist Shortcut Button with Badge */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 rounded-full bg-surface border border-border text-muted hover:text-accent transition-colors cursor-pointer"
            aria-label={`Open Wishlist (${wishlistIds.length} items)`}
          >
            <Heart
              size={18}
              className={wishlistIds.length > 0 ? 'fill-accent text-accent' : ''}
            />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {wishlistIds.length}
              </span>
            )}
          </button>
        </div>

        {/* Category Chips (Hair, Beard, Skin, Tools) per Design.md 8.10 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>
      </header>

      {/* 2-Column Product Grid per Design.md 8.10 */}
      <main className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const qty = getItemQty(product.id);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="bg-surface rounded-card border border-border/80 shadow-level-1 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all relative"
              >
                {/* Wishlist Heart Button top-right per Design.md 8.10 */}
                <button
                  onClick={(e) => handleToggleWishlist(product, e)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-xs text-white hover:text-accent transition-colors cursor-pointer"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={15}
                    className={isWishlisted ? 'fill-accent text-accent' : ''}
                  />
                </button>

                {/* Square Product Image */}
                <div className="w-full aspect-square bg-muted/20 overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                      {product.brand}
                    </span>
                    <h3 className="text-xs font-bold text-text line-clamp-2 mt-0.5" title={product.name}>
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2.5">
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-[11px] mb-1.5">
                      <div className="flex items-center gap-0.5 font-bold text-text">
                        <Star size={11} className="fill-deal text-deal" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-muted text-[10px]">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Price & Stepper / ADD */}
                    <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-border">
                      <div>
                        <span className="text-xs font-bold text-primary tabular-nums block">
                          {formatMoney(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-muted line-through tabular-nums block -mt-0.5">
                            {formatMoney(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {qty > 0 ? (
                        <div
                          className="h-7 px-1.5 rounded-button bg-surface border border-primary flex items-center gap-1.5 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => updateQty(product.id, -1)}
                            className="w-4 h-4 flex items-center justify-center text-primary cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold text-primary tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(product.id, 1)}
                            className="w-4 h-4 flex items-center justify-center text-primary cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="h-7 px-2.5 rounded-button bg-primary text-white text-xs font-bold hover:brightness-105 transition-all cursor-pointer shadow-2xs"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
