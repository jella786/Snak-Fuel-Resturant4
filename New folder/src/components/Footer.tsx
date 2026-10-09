import React from 'react';
import { Flame, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface FooterProps {
  settings: RestaurantSettings | null;
  setCurrentView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setCurrentView }) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md">
                <Flame className="w-6 h-6 fill-neutral-950" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                SNACK <span className="text-amber-400">FUEL</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {settings?.tagline || 'Fresh, delicious and satisfying food delivered straight to your door.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings?.socialLinks.instagram || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks.facebook || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings?.socialLinks.twitter || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings?.socialLinks.whatsapp?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Menu
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('menu')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Full Food Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('offers')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Deals & Combos
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Our Kitchen Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('contact')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Contact & Locations
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Customer Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  My Profile & Addresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('track')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Order History & Reorders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('support')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Help Desk & Complaints
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('rider')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-neutral-400"
                >
                  Delivery Rider Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Info (Live from DB settings) */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Restaurant Info
            </h4>
            <div className="flex items-start gap-3 text-sm text-neutral-400">
              <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <span>
                {settings?.address || 'Plot 48-C, MM Alam Road'}, {settings?.city || 'Lahore'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`tel:${settings?.phone}`} className="hover:text-white transition-colors">
                {settings?.phone || '+92 42 111-383-500'}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`mailto:${settings?.email}`} className="hover:text-white transition-colors">
                {settings?.email || 'hello@snackfuel.com'}
              </a>
            </div>
            <div className="flex items-start gap-3 text-sm text-neutral-400 pt-1">
              <Clock className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <span className="text-xs">
                {settings?.openingHours || 'Mon - Sun: 11:30 AM – 03:00 AM'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Snack Fuel Restaurant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Fast Food Reinvented</span>
            <span>·</span>
            <span>100% Fresh Meat</span>
            <span>·</span>
            <span>Live Rider Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
