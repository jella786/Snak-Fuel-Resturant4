import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api';
import { Category, Product, Offer, Review, RestaurantSettings } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_OFFERS,
  INITIAL_REVIEWS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { FoodDetailsModal } from './components/FoodDetailsModal';

// Pages
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OffersPage } from './pages/OffersPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SupportCenterPage } from './pages/SupportCenterPage';
import { SupportAgentPortalPage } from './pages/SupportAgentPortalPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { RiderPortalPage } from './pages/RiderPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

function SnackFuelApp() {
  const { user } = useAuth();
  const { addItem, refreshSettings, settings } = useCart();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTrackOrderId, setActiveTrackOrderId] = useState<string>('SF-1042');

  // DB Data - pre-initialized with genuine high-res food assets so pages are 100% visible instantly
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      const [catsData, prodsData, offersData, revsData] = await Promise.all([
        api.getCategories().catch(() => INITIAL_CATEGORIES),
        api.getProducts().catch(() => INITIAL_PRODUCTS),
        api.getOffers().catch(() => INITIAL_OFFERS),
        api.getReviews().catch(() => INITIAL_REVIEWS),
      ]);
      if (catsData?.length) setCategories(catsData);
      if (prodsData?.length) setProducts(prodsData);
      if (offersData?.length) setOffers(offersData);
      if (revsData?.length) setReviews(revsData);
      refreshSettings().catch(() => {});

      if (user) {
        try {
          const favs = await api.getFavorites();
          if (favs?.ids) setFavorites(favs.ids);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to load initial site data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleFavorite = async (productId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(productId);
      setFavorites(res.ids);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleQuickAdd = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      selectedSize: product.availableSizes?.[0]?.name || 'Regular',
      image: product.image,
    });
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackOrderId(orderId);
    setCurrentView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Navbar with 3-zone contract */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {dataLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center animate-spin">
              <span className="w-4 h-4 bg-amber-400 rounded-full" />
            </div>
            <p className="text-xs font-semibold text-neutral-400">Firing up Snack Fuel kitchen...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomePage
                categories={categories}
                products={products}
                offers={offers}
                reviews={reviews}
                settings={settings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={setSelectedProductModal}
                onQuickAdd={handleQuickAdd}
                setCurrentView={setCurrentView}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {currentView === 'menu' && (
              <MenuPage
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={setSelectedProductModal}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {currentView === 'offers' && (
              <OffersPage
                offers={offers}
                products={products}
                onSelectProduct={setSelectedProductModal}
              />
            )}

            {currentView === 'track' && (
              <TrackOrderPage
                initialOrderId={activeTrackOrderId}
                onExploreMenu={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutPage
                onOrderSuccess={handleOrderSuccess}
                onBackToMenu={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'support' && <SupportCenterPage />}

            {currentView === 'support-agent' && <SupportAgentPortalPage />}

            {currentView === 'account' && (
              <CustomerAccountPage
                onTrackOrder={(id) => {
                  setActiveTrackOrderId(id);
                  setCurrentView('track');
                }}
                onExploreMenu={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'rider' && <RiderPortalPage />}

            {currentView === 'admin' && (
              <AdminDashboardPage onRefreshSiteData={loadData} />
            )}

            {currentView === 'about' && (
              <AboutPage
                settings={settings}
                onExploreMenu={() => setCurrentView('menu')}
              />
            )}

            {currentView === 'contact' && <ContactPage settings={settings} />}
          </>
        )}
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Product Details Customization Modal */}
      <FoodDetailsModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Global Footer */}
      <Footer
        settings={settings}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SnackFuelApp />
      </CartProvider>
    </AuthProvider>
  );
}
