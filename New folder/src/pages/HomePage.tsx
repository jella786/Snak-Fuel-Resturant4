import React from 'react';
import { ArrowRight, Flame, ShieldCheck, Zap, Award, Sparkles, ChevronRight, Star, Clock, MapPin, Phone } from 'lucide-react';
import { Product, Category, Offer, Review, RestaurantSettings } from '../types';
import { FoodCard } from '../components/FoodCard';
import { SafeImage } from '../components/SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  offers: Offer[];
  reviews: Review[];
  settings: RestaurantSettings | null;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
  setCurrentView: (view: string) => void;
  setSelectedCategory: (catId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  offers,
  reviews,
  settings,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
  setCurrentView,
  setSelectedCategory,
}) => {
  const popularProducts = products.filter((p) => p.isPopular).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const activeOffers = offers.filter((o) => o.isActive);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-neutral-950 pt-8 pb-16 lg:py-24 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Special Offer Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>LIMITED RUN · 20% OFF ALL SMASH & ZINGER COMBOS</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] text-balance">
                Fuel Your Hunger with <span className="text-amber-400">Snack Fuel</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed">
                {settings?.tagline || 'Fresh, delicious and satisfying food delivered straight to your door.'} Smashed fresh to order, hand-breaded whole chicken breast, and gourmet sauces.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentView('menu')}
                  className="py-4 px-8 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-extrabold text-sm rounded-2xl flex items-center gap-2.5 shadow-xl shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => {
                    setCurrentView('menu');
                  }}
                  className="py-4 px-7 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 font-display font-bold text-sm rounded-2xl transition-all cursor-pointer"
                >
                  View Full Menu
                </button>
              </div>

              {/* Trust stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-800/80">
                <div>
                  <span className="font-display text-2xl font-extrabold text-white block">
                    25-35<span className="text-amber-400">m</span>
                  </span>
                  <span className="text-xs text-neutral-400">Average Delivery</span>
                </div>
                <div>
                  <span className="font-display text-2xl font-extrabold text-white block">
                    4.9<span className="text-amber-400">★</span>
                  </span>
                  <span className="text-xs text-neutral-400">Verified Rating</span>
                </div>
                <div>
                  <span className="font-display text-2xl font-extrabold text-white block">
                    100<span className="text-amber-400">%</span>
                  </span>
                  <span className="text-xs text-neutral-400">Fresh Prime Meat</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column (5 cols on lg) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow backdrop */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
                
                {/* Hero Product Frame */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-neutral-800/90 shadow-2xl bg-neutral-900 group">
                  <SafeImage
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
                    alt="Snack Fuel Signature Double Smash Burger"
                    fallbackType="hero"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />
                  
                  {/* Floating Highlight Tag */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Signature Masterpiece</span>
                      <p className="font-display font-extrabold text-sm text-white">Fuel Beast Double Smash</p>
                    </div>
                    <button
                      onClick={() => {
                        const target = products.find((p) => p.name.includes('Fuel Beast')) || products[0];
                        if (target) onSelectProduct(target);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Quick Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Fresh From The Kitchen
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Explore Our Categories
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('menu')}
            className="text-xs font-bold text-neutral-300 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See All Food</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentView('menu');
              }}
              className="group cursor-pointer rounded-2xl bg-neutral-900 border border-neutral-800 p-4 hover:border-amber-400/50 hover:bg-neutral-850 transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-3 bg-neutral-950 border border-neutral-800 group-hover:scale-105 transition-transform">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackType={detectFoodType(cat.name)}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-neutral-500 mt-0.5">Explore →</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR ITEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Customer Favorites
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Most Popular Items
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('menu')}
            className="text-xs font-bold text-neutral-300 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularProducts.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            return (
              <FoodCard
                key={p.id}
                product={p}
                categoryName={cat?.name}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            );
          })}
        </div>
      </section>

      {/* 4. ACTIVE OFFERS & DEALS BANNER */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-400/30 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-bold text-[11px] uppercase tracking-wider">
                  {activeOffers[0].badge}
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-black text-white">
                  {activeOffers[0].title}
                </h3>
                <p className="text-sm text-neutral-300 max-w-lg leading-relaxed">
                  {activeOffers[0].description}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="font-mono tabular-nums text-2xl font-black text-amber-400">
                    Rs. {activeOffers[0].discountPrice}
                    <span className="text-sm text-neutral-500 line-through ml-2 font-normal">
                      Rs. {activeOffers[0].originalPrice}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentView('offers')}
                    className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Claim Offer
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
                  <SafeImage
                    src={activeOffers[0].image}
                    alt={activeOffers[0].title}
                    fallbackType="burger"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Top Rated Hits
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('menu')}
            className="text-xs font-bold text-neutral-300 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Browse All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            return (
              <FoodCard
                key={p.id}
                product={p}
                categoryName={cat?.name}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            );
          })}
        </div>
      </section>

      {/* 6. WHY CHOOSE SNACK FUEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            The Snack Fuel Standard
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white">
            Why Foodies Fuel With Us
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            We don't compromise on meat quality, oil freshness, or speed. Here is our promise to you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-bold text-white mb-2">100% Fresh Meat</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Never frozen, hormone-free Angus beef and hand-trimmed whole chicken breast fillets prepared daily.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-bold text-white mb-2">Fast 30-Min Delivery</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dispatched with insulated thermal bags directly by dedicated riders so your food arrives piping hot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-bold text-white mb-2">Secure Payments</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Support for Cash on Delivery, EasyPaisa, JazzCash, and direct online cards with zero hidden charges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Flame className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="font-display text-base font-bold text-white mb-2">Live Rider Chat</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Track your rider in real time and communicate with instant in-app chat for gate instructions.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Social Proof
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              What Customers Are Saying
            </h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.9 / 5.0 Rating</span>
            </div>
            <span className="text-[11px] text-neutral-500">Based on 500+ verified orders</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  "{r.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-neutral-800">
                <img
                  src={r.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={r.userName}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                  }}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/40"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{r.userName}</h4>
                  <span className="text-[10px] text-neutral-500">Verified Customer · {r.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. RESTAURANT INFORMATION & HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Our Location</h4>
              <p className="text-xs text-neutral-300">
                {settings?.address || 'Plot 48-C, MM Alam Road'}, {settings?.city || 'Lahore'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Opening Hours</h4>
              <p className="text-xs text-neutral-300">
                {settings?.openingHours || 'Mon - Sun: 11:30 AM – 03:00 AM (Late Night Fuel)'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Call for Delivery</h4>
              <p className="text-xs text-amber-400 font-bold font-mono">
                {settings?.phone || '+92 42 111-383-500'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
