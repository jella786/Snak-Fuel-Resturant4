import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Phone, MessageSquare, CheckCircle, Navigation, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RiderChatModal } from '../components/RiderChatModal';

export const RiderPortalPage: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  const fetchRiderOrders = async () => {
    try {
      const data = await api.getRiderOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load rider orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderOrders();
    const interval = setInterval(fetchRiderOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateRiderOrderStatus(orderId, newStatus);
      fetchRiderOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  if (user?.role !== 'rider' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Rider Portal Access</h2>
        <p className="text-xs text-neutral-400">
          This portal is reserved for verified Snack Fuel delivery riders.
        </p>
        <button
          onClick={() => quickSwitch('rider')}
          className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
        >
          1-Click Switch to Rider Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Rider Header */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-neutral-950 font-bold">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-white">
                {user.name}
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                ACTIVE SHIFT
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Vehicle: Red Honda CB 150F (LEE-26-8841) · 428 Deliveries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">
            Assigned: <strong className="text-white">{orders.length}</strong>
          </span>
          <button
            onClick={fetchRiderOrders}
            className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-xl"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-4">
          Assigned Deliveries & Live Runs
        </h2>

        {loading ? (
          <p className="text-xs text-neutral-400">Loading delivery queue...</p>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-400">
            <Bike className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
            <h3 className="font-bold text-white text-base">No Active Deliveries Assigned</h3>
            <p className="text-xs text-neutral-500 mt-1">
              New orders confirmed by kitchen will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => {
              const isOut = order.status === 'out_for_delivery';
              const isDelivered = order.status === 'delivered';

              return (
                <div
                  key={order.id}
                  className={`p-6 rounded-3xl bg-neutral-900 border flex flex-col justify-between transition-all ${
                    isOut ? 'border-amber-400/60 ring-2 ring-amber-400/20 shadow-xl' : 'border-neutral-800'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top status */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-amber-400">
                        #{order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isOut
                            ? 'bg-amber-400/20 text-amber-300 animate-pulse'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center gap-1 text-amber-400 font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-neutral-300">
                        <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p>{order.deliveryAddress.street}</p>
                          <p className="text-neutral-400">
                            {order.deliveryAddress.area}, {order.deliveryAddress.city}
                          </p>
                          {order.deliveryAddress.instructions && (
                            <p className="text-[11px] text-amber-300/80 mt-1 italic">
                              Note: "{order.deliveryAddress.instructions}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items brief */}
                    <div className="text-xs text-neutral-400">
                      <p className="font-semibold text-neutral-300 mb-1">Order Items ({order.items.length}):</p>
                      <ul className="space-y-0.5">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="truncate">
                            • {it.quantity}× {it.name}
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-800 font-bold text-white">
                        <span>Collect: {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}</span>
                        <span className="font-mono text-amber-400">Rs. {order.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-5 mt-4 border-t border-neutral-800 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveChatOrder(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Chat with Customer</span>
                      </button>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>

                    {/* Status updater actions */}
                    {!isDelivered && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {order.status !== 'out_for_delivery' ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                            className="col-span-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                          >
                            <Navigation className="w-4 h-4" />
                            <span>Picked Up & Heading to Customer</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="col-span-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark Delivered & Handed Over</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeChatOrder && (
        <RiderChatModal
          order={activeChatOrder}
          isOpen={true}
          onClose={() => setActiveChatOrder(null)}
        />
      )}
    </div>
  );
};
