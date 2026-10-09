import React from 'react';
import { Flame, ShieldCheck, Award, Heart, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { SafeImage } from '../components/SafeImage';

interface AboutPageProps {
  settings: RestaurantSettings | null;
  onExploreMenu: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onExploreMenu }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Brand Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>The Snack Fuel Philosophy</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-tight">
          Obsessed With Quality. <span className="text-amber-400">Fueled by Flavor.</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
          {settings?.tagline || 'Fresh, delicious and satisfying food delivered straight to your door.'}
        </p>
      </div>

      {/* Story & Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Our Kitchen Story
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {settings?.aboutStory ||
              'Snack Fuel was born out of one obsession: crafting the crispiest, juiciest, most uncompromising fast food without culinary shortcuts.'}
          </p>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {settings?.aboutMission ||
              'Our mission is simple: provide lightning-fast, restaurant-quality comfort fuel right to your doorstep, backed by modern technology, transparent live tracking, and obsession with customer delight.'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="font-display text-2xl font-black text-amber-400 block">100%</span>
              <span className="text-xs text-neutral-400">Fresh Prime Angus Beef</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="font-display text-2xl font-black text-amber-400 block">&lt; 30m</span>
              <span className="text-xs text-neutral-400">Insulated Delivery</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900">
            <SafeImage
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
              alt="Snack Fuel Kitchen standard"
              fallbackType="hero"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Award className="w-8 h-8 text-amber-400" />
          <h3 className="font-display font-bold text-lg text-white">Culinary Standards</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            We don't use reconstituted meat or artificial binders. Every burger patty is 100% coarse ground beef smashed directly on hot griddles to lock in juices.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
          <h3 className="font-display font-bold text-lg text-white">Hygiene & Safety</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Our prep lines follow strict international food safety protocols. Fresh cooking oils are tested daily and high-grade food seals protect your delivery bag.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
          <Users className="w-8 h-8 text-amber-400" />
          <h3 className="font-display font-bold text-lg text-white">Customer First</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Real live support agents, instant direct rider chat, and no-questions-asked food satisfaction credits ensure peace of mind with every bite.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-400/30 text-center space-y-4">
        <h3 className="font-display text-2xl sm:text-3xl font-black text-white">
          Ready to Experience Real Fast Food?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Explore our burgers, loaded fries, and pizzas crafted fresh for delivery right now.
        </p>
        <button
          onClick={onExploreMenu}
          className="py-3 px-8 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-400/20"
        >
          <span>Order From Snack Fuel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
