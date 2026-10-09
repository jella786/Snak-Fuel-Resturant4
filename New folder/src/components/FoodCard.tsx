import React from 'react';
import { Heart, Plus, Star, Clock } from 'lucide-react';
import { Product } from '../types';
import { SafeImage } from './SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface FoodCardProps {
  product: Product;
  categoryName?: string;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  product,
  categoryName,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
}) => {
  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group relative flex flex-col bg-neutral-900/90 rounded-2xl border border-neutral-800/80 overflow-hidden hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-300">
      {/* Visual Slot: Product Image */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/3] w-full bg-neutral-950 overflow-hidden cursor-pointer"
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackType={detectFoodType(product.name)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Subtle Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent pointer-events-none" />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/90 text-white shadow-md shadow-rose-500/30'
              : 'bg-neutral-950/60 text-neutral-300 hover:text-white hover:bg-neutral-900/80'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Unboxed Status Kicker if Best Seller or Hot Deal */}
        {(product.isBestSeller || product.isPopular || hasDiscount) && (
          <div className="absolute bottom-3 left-3 text-[11px] font-bold text-amber-400 tracking-wider uppercase drop-shadow-md">
            {hasDiscount ? `Save Rs. ${product.price - product.discountPrice!}` : product.isBestSeller ? 'Best Seller' : 'Popular'}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5">
        {/* Unboxed Metadata with Typographic Separator */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1.5">
          <span>{categoryName || 'Snack Fuel Special'}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-500" />
            <span>{product.prepTimeMinutes} mins</span>
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono tabular-nums">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
          </span>
        </div>

        {/* Food Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-display text-base font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-neutral-800/80">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-lg font-extrabold text-amber-400">
                Rs. {currentPrice}
              </span>
              {hasDiscount && (
                <span className="font-mono tabular-nums text-xs text-neutral-500 line-through">
                  Rs. {product.price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-500 block">
              {product.availableSizes?.length > 1 ? `${product.availableSizes.length} sizes available` : 'Standard portion'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="py-2 px-3 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-xl transition-colors cursor-pointer"
            >
              Customize
            </button>
            <button
              type="button"
              onClick={() => onQuickAdd(product)}
              className="p-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
              title="Quick Add to Cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
