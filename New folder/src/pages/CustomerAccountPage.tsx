import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, Heart, MapPin, Headphones, RotateCcw, Star, ChevronRight, Check, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Order, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';
import { SafeImage } from '../components/SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface CustomerAccountPageProps {
  onTrackOrder: (orderId: string) => void;
  onExploreMenu: () => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onTrackOrder,
  onExploreMenu,
}) => {
  const { user, updateProfile, quickSwitch } = useAuth();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Address
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('Gulberg III');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, favsData] = await Promise.all([
        api.getOrders(),
        api.getFavorites(),
      ]);
      setOrders(ordersData);
      setFavorites(favsData.products);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedAddOns: item.selectedAddOns,
        specialInstructions: item.specialInstructions,
        image: item.image,
      });
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    const currentAddresses = user?.addresses || [];
    const newAddr = {
      id: `addr_${Date.now()}`,
      label: newLabel,
      city: 'Lahore',
      area: newArea,
      street: newStreet.trim(),
      details: '',
      isDefault: currentAddresses.length === 0,
    };

    await updateProfile({ addresses: [...currentAddresses, newAddr] });
    setIsAddingAddress(false);
    setNewStreet('');
  };

  const handleDeleteAddress = async (addrId: string) => {
    const updated = (user?.addresses || []).filter((a) => a.id !== addrId);
    await updateProfile({ addresses: updated });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Sign In to Your Account</h2>
        <p className="text-xs text-neutral-400">
          Access your personalized order history, saved addresses and favorite foods.
        </p>
        <button
          onClick={() => quickSwitch('customer')}
          className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
        >
          1-Click Demo Customer Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
            }}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-black text-white">{user.name}</h1>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email} · {user.phone || 'No phone set'}</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'favorites' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favorites ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'addresses' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white">Previous Orders</h2>
          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <h3 className="font-bold text-white text-base">No Orders Yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                You haven't placed an order yet. Browse our delicious smash burgers and wings!
              </p>
              <button
                onClick={onExploreMenu}
                className="mt-5 py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl"
              >
                Order Food Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div>
                        <span className="font-mono text-sm font-bold text-amber-400">#{o.id}</span>
                        <p className="text-[11px] text-neutral-500">
                          {new Date(o.createdAt).toLocaleDateString()} at{' '}
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-200">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Item list */}
                    <div className="py-3 text-xs space-y-1">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-neutral-300">
                          <span className="truncate">
                            {it.quantity}× {it.name}
                          </span>
                          <span className="font-mono tabular-nums text-neutral-400">
                            Rs. {it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
                      <span className="text-neutral-400">
                        Total ({o.paymentMethod.toUpperCase()})
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        Rs. {o.total}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-3 border-t border-neutral-800">
                    <button
                      onClick={() => onTrackOrder(o.id)}
                      className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(o)}
                      className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                    {o.status === 'delivered' && (
                      <button
                        onClick={() => setReviewOrder(o)}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl text-xs font-semibold"
                        title="Rate order"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-white">Your Saved Favorites</h2>
          {favorites.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-500" />
              <h3 className="font-bold text-white text-base">No Favorite Items Saved</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Click the heart icon on any burger, pizza, or shake to save it here for fast reordering!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 flex gap-4 items-center justify-between"
                >
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fallbackType={detectFoodType(p.name)}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <span className="font-mono tabular-nums text-xs text-amber-400 font-bold">
                      Rs. {p.discountPrice || p.price}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      addItem({
                        productId: p.id,
                        name: p.name,
                        price: p.discountPrice || p.price,
                        quantity: 1,
                        image: p.image,
                      })
                    }
                    className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Saved Delivery Addresses</h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">New Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Label</label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="University">University</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Area</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">House / Street Address *</label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="e.g. House 42-B, Street 14"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="py-2 px-3 text-xs text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(user.addresses || []).map((addr) => (
              <div
                key={addr.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start justify-between"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{addr.label}</h4>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">{addr.street}</p>
                    <p className="text-xs text-neutral-400">{addr.area}, {addr.city}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-xl space-y-4">
          <h2 className="font-display text-xl font-bold text-white">Edit Profile Details</h2>
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            {saveSuccess && (
              <div className="p-3 text-xs bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          orderId={reviewOrder.id}
          productId={reviewOrder.items[0]?.productId}
          isOpen={true}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => {
            setReviewOrder(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
