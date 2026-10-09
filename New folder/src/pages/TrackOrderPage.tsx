import React, { useState, useEffect } from 'react';
import { Search, Bike, Phone, MessageSquare, Clock, MapPin, CheckCircle, PackageCheck, Flame, ChefHat, Check, Printer, Star } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { RiderChatModal } from '../components/RiderChatModal';
import { ReviewModal } from '../components/ReviewModal';
import { SafeImage } from '../components/SafeImage';

interface TrackOrderPageProps {
  initialOrderId?: string;
  onExploreMenu: () => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialOrderId, onExploreMenu }) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || 'SF-1042');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(id.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdInput) {
      fetchOrder(orderIdInput);
    }
  }, []);

  // Poll for status updates every 6 seconds so changes in admin/rider reflect in real time
  useEffect(() => {
    if (!order?.id) return;
    const interval = setInterval(() => {
      api.getOrder(order.id).then(setOrder).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, [order?.id]);

  const stages = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing in Kitchen', icon: ChefHat },
    { key: 'ready', label: 'Food Ready', icon: PackageCheck },
    { key: 'rider_assigned', label: 'Rider Assigned', icon: Bike },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Flame },
    { key: 'delivered', label: 'Delivered', icon: Check },
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Search bar */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 md:p-8">
        <div className="max-w-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Real-Time Delivery Radar
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            Track Your Food Order
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Enter your Snack Fuel Order ID (e.g. SF-1042) to track preparation and rider GPS progress.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrder(orderIdInput);
            }}
            className="flex gap-2.5 mt-5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                placeholder="Order ID (e.g. SF-1042)"
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono uppercase text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick Track Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-800/80">
            <span className="text-[11px] font-semibold text-neutral-400">Quick Demo Orders:</span>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput('SF-1042');
                fetchOrder('SF-1042');
              }}
              className="py-1 px-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-400 text-[11px] font-mono font-bold text-amber-400 transition-colors cursor-pointer"
            >
              SF-1042 (Live Transit)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput('SF-1039');
                fetchOrder('SF-1039');
              }}
              className="py-1 px-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-400 text-[11px] font-mono font-bold text-neutral-300 transition-colors cursor-pointer"
            >
              SF-1039 (Delivered)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
          <p className="text-xs text-rose-400 font-semibold">{error}</p>
          <p className="text-xs text-neutral-500">
            Tip: Try the demo active order ID: <span className="font-mono text-amber-400 font-bold">SF-1042</span>
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Header Box */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-amber-400">Order #{order.id}</span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs text-neutral-400">
                  Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="font-display text-2xl font-black text-white capitalize">
                {order.status.replace(/_/g, ' ')}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {order.status === 'delivered'
                  ? 'Your food has arrived! Bon appétit!'
                  : order.status === 'out_for_delivery'
                  ? 'Rider is on the road heading to your doorstep!'
                  : 'Kitchen is firing up your meal with fresh ingredients.'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {order.status === 'delivered' ? (
                <button
                  onClick={() => setIsReviewOpen(true)}
                  className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-neutral-950" />
                  <span>Rate Order</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Rider</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print Order Receipt"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Receipt</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">
              Live Preparation & Transit Stepper
            </h3>

            {/* Stepper horizontal line */}
            <div className="relative">
              <div className="hidden md:grid grid-cols-7 gap-2 text-center">
                {stages.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center group">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-400/20 shadow-lg shadow-amber-400/20 scale-110 font-bold'
                            : isDone
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          isCurrent
                            ? 'text-amber-400'
                            : isDone
                            ? 'text-white'
                            : 'text-neutral-500'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-4">
                {stages.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-amber-400 text-neutral-950 font-bold'
                            : isDone
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-amber-400 font-bold' : isDone ? 'text-white' : 'text-neutral-500'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery & Rider Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rider Card */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Assigned Delivery Rider
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                  Thermal Insulated Bag
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Bike className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {order.riderName || 'Farhan Malik'}
                  </h4>
                  <p className="text-xs text-neutral-400">Red Honda CB 150F · LEE-26-8841</p>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9 Star Rating (428 deliveries)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="flex-1 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Send In-App Message</span>
                </button>
                {order.riderPhone && (
                  <a
                    href={`tel:${order.riderPhone}`}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl transition-colors"
                    title="Call Rider"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Delivery Address & Details */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Delivery Location
              </span>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-white">{order.customerName} ({order.customerPhone})</p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.area}, {order.deliveryAddress.city}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-neutral-400 italic">"{order.deliveryAddress.instructions}"</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>Payment Mode: <strong className="text-white uppercase">{order.paymentMethod}</strong></span>
                <span>Payment Status: <strong className="text-emerald-400 uppercase">{order.paymentStatus}</strong></span>
              </div>
            </div>
          </div>

          {/* Itemized Order Receipt */}
          <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Itemized Receipt</h3>
            <div className="divide-y divide-neutral-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fallbackType="burger"
                      className="w-11 h-11 rounded-xl object-cover bg-neutral-950 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white">{item.quantity}× {item.name}</span>
                      {item.selectedSize && (
                        <span className="text-neutral-400 block text-[11px]">{item.selectedSize}</span>
                      )}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <span className="text-neutral-500 block text-[10px]">+ {item.selectedAddOns.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-white">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-neutral-400 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-white">Rs. {order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Discount</span>
                  <span className="font-mono tabular-nums">-Rs. {order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-mono tabular-nums text-white">
                  {order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax & Packaging</span>
                <span className="font-mono tabular-nums text-white">Rs. {order.tax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-800">
                <span>Total Paid</span>
                <span className="font-mono tabular-nums text-amber-400">Rs. {order.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rider Chat Modal */}
      {order && (
        <RiderChatModal
          order={order}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Review Modal */}
      {order && (
        <ReviewModal
          orderId={order.id}
          productId={order.items[0]?.productId}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={() => {
            fetchOrder(order.id);
          }}
        />
      )}
    </div>
  );
};
