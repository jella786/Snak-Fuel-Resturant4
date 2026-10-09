import React from 'react';
import { Tag, Sparkles, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Offer, Product } from '../types';
import { useCart } from '../context/CartContext';
import { SafeImage } from '../components/SafeImage';

interface OffersPageProps {
  offers: Offer[];
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ offers, products, onSelectProduct }) => {
  const { addItem } = useCart();
  const activeOffers = offers.filter((o) => o.isActive);

  const handleClaimOffer = (offer: Offer) => {
    // Add deal to cart
    addItem({
      productId: offer.id,
      name: offer.title,
      price: offer.discountPrice,
      quantity: 1,
      selectedSize: 'Combo Pack',
      image: offer.image,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Exclusive Promotions & Family Combos</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
          Active Deals & Fuel Packs
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
          Get more smash burgers, crispy chicken wings, and fries for less. All active deals are managed fresh from our kitchen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activeOffers.map((deal) => {
          const savings = deal.originalPrice - deal.discountPrice;
          return (
            <div
              key={deal.id}
              className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all group"
            >
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                  <SafeImage
                    src={deal.image}
                    alt={deal.title}
                    fallbackType="burger"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-bold text-[11px] uppercase tracking-wider shadow-lg">
                    {deal.badge}
                  </span>
                  {savings > 0 && (
                    <span className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-amber-400 font-mono text-xs font-extrabold">
                      SAVE RS. {savings}
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-8 space-y-3">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {deal.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {deal.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Valid until {deal.endDate || 'Limited Time'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-0 border-t border-neutral-800/80 flex items-center justify-between gap-4 mt-2">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Special Deal Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-extrabold text-amber-400">
                      Rs. {deal.discountPrice}
                    </span>
                    {deal.originalPrice > deal.discountPrice && (
                      <span className="font-mono text-xs text-neutral-500 line-through">
                        Rs. {deal.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleClaimOffer(deal)}
                  className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Deal to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
