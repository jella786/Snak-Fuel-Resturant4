import React, { useState, useEffect } from 'react';
import {
  Shield,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  Percent,
  Bike,
  Users,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  Category,
  Order,
  Offer,
  Coupon,
  DeliveryRider,
  User,
  RestaurantSettings,
} from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from '../components/SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface AdminDashboardPageProps {
  onRefreshSiteData: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onRefreshSiteData }) => {
  const { user, quickSwitch } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'offers' | 'coupons' | 'riders' | 'customers' | 'settings'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const [loading, setLoading] = useState(true);

  // Product modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Category modal
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Offer modal
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  // Coupon modal
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  // Rider modal
  const [editingRider, setEditingRider] = useState<Partial<DeliveryRider> | null>(null);
  const [riderModalOpen, setRiderModalOpen] = useState(false);

  // Orders filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const loadAllAdminData = async () => {
    try {
      const [
        statsData,
        prodsData,
        catsData,
        ordersData,
        offersData,
        couponsData,
        ridersData,
        usersData,
        settingsData,
      ] = await Promise.all([
        api.getAdminStats(),
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getOffers(),
        api.getCoupons(),
        api.getAdminRiders(),
        api.getAdminUsers(),
        api.getSettings(),
      ]);

      setStats(statsData);
      setProducts(prodsData);
      setCategories(catsData);
      setOrders(ordersData);
      setOffers(offersData);
      setCoupons(couponsData);
      setRiders(ridersData);
      setCustomers(usersData.filter((u) => u.role === 'customer'));
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await api.uploadImage(reader.result as string);
        callback(result.url);
      } catch (err) {
        alert('Image upload failed. Using fallback preview.');
        callback(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guard: if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-neutral-400">
          You must be logged in as a restaurant administrator to view and modify food menus, pricing, and orders.
        </p>
        <button
          onClick={() => quickSwitch('admin')}
          className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
        >
          1-Click Switch to Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-neutral-950 font-black">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white">Snack Fuel Restaurant Command Center</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live Product Pricing · Real-Time Order Dispatch · Delivery Fleet · Customer Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadAllAdminData();
              onRefreshSiteData();
            }}
            className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Sync Live Site Data
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800 no-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard Stats', icon: TrendingUp },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'offers', label: `Deals & Offers (${offers.length})`, icon: Tag },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Percent },
          { id: 'riders', label: `Delivery Riders (${riders.length})`, icon: Bike },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'settings', label: 'Restaurant Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. OVERVIEW STATS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Today's Revenue</span>
              <div className="font-mono text-2xl font-black text-amber-400">
                Rs. {stats.metrics.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block">▲ +14% vs yesterday</span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Total Orders</span>
              <div className="font-mono text-2xl font-black text-white">
                {stats.metrics.totalOrders}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {stats.metrics.pendingOrders} pending kitchen review
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Active Deliveries</span>
              <div className="font-mono text-2xl font-black text-emerald-400">
                {stats.metrics.activeOrders}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                {stats.metrics.activeRiders} riders on the road
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-semibold block mb-1">Total Customers</span>
              <div className="font-mono text-2xl font-black text-white">
                {stats.metrics.totalCustomers}
              </div>
              <span className="text-[10px] text-amber-400 mt-1 block">4.9 Star satisfaction rate</span>
            </div>
          </div>

          {/* Sales Breakdown chart */}
          <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Weekly Fuel Sales Performance</h3>
                <p className="text-xs text-neutral-400">Daily gross turnover in PKR</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">Week 14 · Active</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-6 items-end h-52 border-b border-neutral-800 pb-2">
              {stats.dailySales.map((item: any) => {
                const heightPercent = Math.min(100, Math.round((item.sales / 50000) * 100));
                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Rs. {item.sales}
                    </span>
                    <div
                      className="w-full max-w-[42px] bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all group-hover:bg-amber-200"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-bold text-neutral-400">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. PRODUCT MANAGEMENT TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Food Menu Products</h2>
              <p className="text-xs text-neutral-400">
                Add, edit prices, toggle stock availability, and upload product photos without editing source code.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  name: '',
                  description: '',
                  categoryId: categories[0]?.id || 'cat_burgers',
                  price: 750,
                  ingredients: ['Beef Patty', 'Brioche Bun'],
                  availableSizes: [{ name: 'Regular', price: 750 }],
                  addOns: [{ name: 'Extra Cheddar', price: 90 }],
                  prepTimeMinutes: 15,
                  isAvailable: true,
                  isPopular: false,
                  isBestSeller: false,
                  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
                });
                setProductModalOpen(true);
              }}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Food</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <div
                  key={p.id}
                  className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full bg-neutral-950">
                      <SafeImage
                        src={p.image}
                        alt={p.name}
                        fallbackType={detectFoodType(p.name)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                          onClick={async () => {
                            await api.updateProduct(p.id, { isAvailable: !p.isAvailable });
                            loadAllAdminData();
                            onRefreshSiteData();
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.isAvailable
                              ? 'bg-emerald-500 text-neutral-950'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {p.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span>{cat?.name || 'Category'}</span>
                        <span className="font-mono text-amber-400 font-bold">
                          Rs. {p.discountPrice || p.price}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate">{p.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-neutral-800/80 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setProductModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Food</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                          await api.deleteProduct(p.id);
                          loadAllAdminData();
                          onRefreshSiteData();
                        }
                      }}
                      className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. CATEGORY MANAGEMENT TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Food Categories</h2>
              <p className="text-xs text-neutral-400">
                Organize menu tabs. Adding or renaming a category immediately reflects on the customer menu.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory({
                  name: '',
                  description: '',
                  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
                  isActive: true,
                });
                setCategoryModalOpen(true);
              }}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <SafeImage
                    src={c.image}
                    alt={c.name}
                    fallbackType={detectFoodType(c.name)}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{c.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-1">{c.description}</p>
                    <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                      Slug: /{c.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCategory(c);
                      setCategoryModalOpen(true);
                    }}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete category ${c.name}?`)) {
                        await api.deleteCategory(c.id);
                        loadAllAdminData();
                        onRefreshSiteData();
                      }
                    }}
                    className="p-2 text-neutral-500 hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. ORDER MANAGEMENT TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Live Kitchen & Order Dispatch</h2>
              <p className="text-xs text-neutral-400">
                Track status updates and assign delivery riders. Status changes immediately update the customer radar.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 rounded-xl px-3 py-2"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {orders
              .filter((o) => (orderStatusFilter === 'all' ? true : o.status === orderStatusFilter))
              .map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-amber-400">
                          #{order.id}
                        </span>
                        <span className="text-xs text-white font-bold">{order.customerName}</span>
                        <span className="text-xs text-neutral-500 font-mono">({order.customerPhone})</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-amber-400 block">
                          Rs. {order.total}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase">
                          {order.paymentMethod} · {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items brief */}
                  <div className="text-xs text-neutral-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60">
                        <span className="font-bold text-white">{it.quantity}× {it.name}</span>
                        {it.selectedSize && <span className="text-[10px] text-neutral-400 block">{it.selectedSize}</span>}
                        {it.specialInstructions && (
                          <span className="text-[10px] text-amber-300 italic block">"{it.specialInstructions}"</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order controls */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Status:</span>
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          await api.updateOrderStatus(order.id, e.target.value);
                          loadAllAdminData();
                          onRefreshSiteData();
                        }}
                        className="bg-neutral-950 border border-neutral-700 text-xs text-amber-400 font-bold rounded-xl px-3 py-1.5 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="rider_assigned">Rider Assigned</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Rider Assign */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">Rider:</span>
                      <select
                        value={order.riderId || ''}
                        onChange={async (e) => {
                          if (e.target.value) {
                            await api.assignRider(order.id, e.target.value);
                            loadAllAdminData();
                            onRefreshSiteData();
                          }
                        }}
                        className="bg-neutral-950 border border-neutral-700 text-xs text-neutral-200 rounded-xl px-3 py-1.5 focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {riders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.vehicle} - {r.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. OFFERS & DEALS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'offers' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Promotional Deals & Banners</h2>
              <p className="text-xs text-neutral-400">
                Create weekend specials and combo packs. Active deals automatically show up on the customer homepage.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOffer({
                  title: '',
                  description: '',
                  image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
                  originalPrice: 1200,
                  discountPrice: 950,
                  discountPercentage: 20,
                  badge: 'HOT DEAL',
                  isActive: true,
                });
                setOfferModalOpen(true);
              }}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Deal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((off) => (
              <div
                key={off.id}
                className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full">
                    <SafeImage src={off.image} alt={off.title} fallbackType="burger" className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold uppercase">
                      {off.badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white text-base">{off.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{off.description}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-amber-400">
                        Rs. {off.discountPrice}
                      </span>
                      <span className="font-mono text-xs text-neutral-500 line-through">
                        Rs. {off.originalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingOffer(off);
                      setOfferModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Deal</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete offer?')) {
                        await api.deleteOffer(off.id);
                        loadAllAdminData();
                        onRefreshSiteData();
                      }
                    }}
                    className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. COUPONS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Coupons & Promo Codes</h2>
              <p className="text-xs text-neutral-400">
                Customers enter these discount codes at checkout. Validated automatically by the system.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCoupon({
                  code: 'FUEL25',
                  discountPercent: 25,
                  fixedDiscount: 0,
                  minOrder: 800,
                  maxDiscount: 500,
                  usageLimit: 200,
                  isActive: true,
                });
                setCouponModalOpen(true);
              }}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                      {c.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 mt-2 font-semibold">
                    {c.discountPercent > 0 ? `${c.discountPercent}% OFF Order` : `Rs. ${c.fixedDiscount} Flat Discount`}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Min Order: Rs. {c.minOrder} · Max Cap: Rs. {c.maxDiscount || 'None'}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Used: {c.usedCount} of {c.usageLimit} limit
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setEditingCoupon(c);
                      setCouponModalOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete coupon?')) {
                        await api.deleteCoupon(c.id);
                        loadAllAdminData();
                      }
                    }}
                    className="p-1.5 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. RIDERS FLEET MANAGEMENT TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'riders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Delivery Fleet Management</h2>
              <p className="text-xs text-neutral-400">
                Register delivery riders, assign motorcycles, and track active shifts and ratings.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRider({
                  name: '',
                  phone: '+92 300 0000000',
                  email: '',
                  vehicle: 'Honda CB 150F',
                  plateNumber: 'LHR-26-XXXX',
                  status: 'available',
                });
                setRiderModalOpen(true);
              }}
              className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Register New Rider</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riders.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{r.name}</h3>
                    <p className="text-xs text-neutral-400">{r.phone}</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">
                      {r.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
                  <p>Vehicle: <strong className="text-white">{r.vehicle}</strong> ({r.plateNumber})</p>
                  <p>Completed Deliveries: <strong className="text-amber-400 font-mono">{r.completedDeliveries}</strong></p>
                  <p>Rating: <strong className="text-white">★ {r.rating}</strong></p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      setEditingRider(r);
                      setRiderModalOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Remove rider ${r.name}?`)) {
                        await api.deleteRider(r.id);
                        loadAllAdminData();
                      }
                    }}
                    className="p-1.5 text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 8. CUSTOMERS DATABASE TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Registered Customer Database</h2>
            <p className="text-xs text-neutral-400">
              View customer profiles, contact info, order counts, and manage account statuses.
            </p>
          </div>

          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {customers.map((c) => {
                    const userOrdersCount = orders.filter((o) => o.userId === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-neutral-850/50">
                        <td className="p-4">
                          <p className="font-bold text-white">{c.name}</p>
                          <p className="text-neutral-500 text-[11px]">{c.email}</p>
                        </td>
                        <td className="p-4 font-mono">{c.phone || 'N/A'}</td>
                        <td className="p-4 text-neutral-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-mono font-bold text-amber-400">{userOrdersCount}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {c.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={async () => {
                              await api.toggleUserActive(c.id);
                              loadAllAdminData();
                            }}
                            className="text-xs text-amber-400 hover:underline cursor-pointer"
                          >
                            {c.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 9. RESTAURANT SETTINGS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'settings' && settings && (
        <div className="max-w-3xl space-y-6 animate-fadeIn">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Live Restaurant Settings</h2>
            <p className="text-xs text-neutral-400">
              Any updates to restaurant name, address, phone, opening hours, or delivery fees update the public website instantly!
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await api.updateSettings(settings);
              alert('Restaurant settings saved! Public website updated.');
              loadAllAdminData();
              onRefreshSiteData();
            }}
            className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Restaurant Brand Name
                </label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Tagline / Hero Headline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Delivery Fee (PKR)</label>
                <input
                  type="number"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Free Delivery Order Min</label>
                <input
                  type="number"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Sales Tax (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Restaurant Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Kitchen Operating Hours</label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isAcceptingOrders}
                  onChange={(e) => setSettings({ ...settings, isAcceptingOrders: e.target.checked })}
                  className="w-4 h-4 accent-amber-400"
                />
                <span className="text-xs font-bold text-white">
                  Kitchen is Active & Accepting Orders
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
            >
              Save Restaurant Settings
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD / EDIT PRODUCT MODAL WITH IMAGE UPLOAD */}
      {/* ---------------------------------------------------- */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white">
                {editingProduct.id ? 'Edit Food Product' : 'Add New Food Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (editingProduct.id) {
                    await api.updateProduct(editingProduct.id, editingProduct);
                  } else {
                    await api.createProduct(editingProduct);
                  }
                  setProductModalOpen(false);
                  loadAllAdminData();
                  onRefreshSiteData();
                } catch (err: any) {
                  alert(err.message || 'Failed to save product');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Food Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Zinger Burger"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId || categories[0]?.id}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 620"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Prep Time (Minutes)</label>
                  <input
                    type="number"
                    value={editingProduct.prepTimeMinutes || 15}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, prepTimeMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Direct image upload from computer / phone */}
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Food Image Upload</label>
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={editingProduct.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'}
                    alt="Preview"
                    fallbackType={detectFoodType(editingProduct.name)}
                    className="w-14 h-14 rounded-xl object-cover bg-neutral-950 shrink-0"
                  />
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 p-2.5 bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 rounded-xl cursor-pointer transition-colors text-neutral-300">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Choose image file from computer / mobile</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setEditingProduct({ ...editingProduct, image: url })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Describe the mouthwatering taste, patty smashing, sauce blend..."
                  className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">
                  Ingredients (Comma separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingProduct.ingredients)
                      ? editingProduct.ingredients.join(', ')
                      : editingProduct.ingredients || ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      ingredients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Beef Patty, Brioche Bun, Melted Cheddar, Fire Mayo"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isAvailable !== false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })
                    }
                    className="accent-amber-400"
                  />
                  <span className="text-neutral-300">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isPopular}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isPopular: e.target.checked })
                    }
                    className="accent-amber-400"
                  />
                  <span className="text-neutral-300">Popular Hit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.isBestSeller}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                    }
                    className="accent-amber-400"
                  />
                  <span className="text-neutral-300">Best Seller</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="py-2.5 px-4 bg-neutral-800 text-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl shadow-md"
                >
                  Save Food Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CATEGORY MODAL */}
      {/* ---------------------------------------------------- */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {editingCategory.id ? 'Edit Category' : 'Add Category'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingCategory.id) {
                  await api.updateCategory(editingCategory.id, editingCategory);
                } else {
                  await api.createCategory(editingCategory);
                }
                setCategoryModalOpen(false);
                loadAllAdminData();
                onRefreshSiteData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Smash Burgers"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Category Image File</label>
                <label className="flex items-center gap-2 p-2 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl cursor-pointer">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload category icon/image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, (url) => setEditingCategory({ ...editingCategory, image: url }))
                    }
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="py-2 px-3 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 text-neutral-950 font-bold rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* OFFER MODAL */}
      {/* ---------------------------------------------------- */}
      {offerModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {editingOffer.id ? 'Edit Deal' : 'Add New Deal'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingOffer.id) {
                  await api.updateOffer(editingOffer.id, editingOffer);
                } else {
                  await api.createOffer(editingOffer);
                }
                setOfferModalOpen(false);
                loadAllAdminData();
                onRefreshSiteData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  placeholder="e.g. Buy 1 Get 1 Zinger Fest"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={editingOffer.originalPrice || 0}
                    onChange={(e) => setEditingOffer({ ...editingOffer, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Deal Price (PKR)</label>
                  <input
                    type="number"
                    value={editingOffer.discountPrice || 0}
                    onChange={(e) => setEditingOffer({ ...editingOffer, discountPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingOffer.badge || 'SPECIAL DEAL'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingOffer.description || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="py-2 px-3 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 text-neutral-950 font-bold rounded-lg"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* COUPON MODAL */}
      {/* ---------------------------------------------------- */}
      {couponModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingCoupon.id) {
                  await api.updateCoupon(editingCoupon.id, editingCoupon);
                } else {
                  await api.createCoupon(editingCoupon);
                }
                setCouponModalOpen(false);
                loadAllAdminData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FUEL30"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={editingCoupon.discountPercent || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Fixed Discount (PKR)</label>
                  <input
                    type="number"
                    value={editingCoupon.fixedDiscount || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, fixedDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Min Order (PKR)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrder || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Max Discount Cap</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="py-2 px-3 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 text-neutral-950 font-bold rounded-lg"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* RIDER MODAL */}
      {/* ---------------------------------------------------- */}
      {riderModalOpen && editingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              {editingRider.id ? 'Edit Rider' : 'Register New Rider'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingRider.id) {
                  await api.updateRider(editingRider.id, editingRider);
                } else {
                  await api.createRider(editingRider);
                }
                setRiderModalOpen(false);
                loadAllAdminData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-neutral-400 mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingRider.name || ''}
                  onChange={(e) => setEditingRider({ ...editingRider, name: e.target.value })}
                  placeholder="e.g. Farhan Malik"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={editingRider.phone || ''}
                  onChange={(e) => setEditingRider({ ...editingRider, phone: e.target.value })}
                  placeholder="+92 301 5551234"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Vehicle</label>
                  <input
                    type="text"
                    value={editingRider.vehicle || ''}
                    onChange={(e) => setEditingRider({ ...editingRider, vehicle: e.target.value })}
                    placeholder="Honda 150F"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Number Plate</label>
                  <input
                    type="text"
                    value={editingRider.plateNumber || ''}
                    onChange={(e) => setEditingRider({ ...editingRider, plateNumber: e.target.value })}
                    placeholder="LEE-26-8841"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRiderModalOpen(false)}
                  className="py-2 px-3 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 text-neutral-950 font-bold rounded-lg"
                >
                  Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
