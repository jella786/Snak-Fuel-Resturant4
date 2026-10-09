import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Banknote, Smartphone, Building, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CheckoutPageProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToMenu: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onBackToMenu }) => {
  const { items, subtotal, deliveryFee, tax, total, couponDiscount, couponCode, clearCart, settings } = useCart();
  const { user } = useAuth();

  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('delivery');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(settings?.city || 'Lahore');
  const [area, setArea] = useState('Gulberg III');
  const [street, setStreet] = useState('');
  const [details, setDetails] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'easypaisa' | 'jazzcash' | 'bank_transfer'>('cod');
  
  // Card details state for simulated secure gateway
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [mobileWalletNumber, setMobileWalletNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToMenu}
          className="mt-6 py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all"
        >
          Explore Food Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and contact phone number');
      return;
    }

    if (orderType === 'delivery' && !street.trim()) {
      setError('Please provide your delivery street/house address');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || 'customer@snackfuel.com',
        deliveryAddress: {
          city,
          area,
          street: street.trim() || 'Dine-in / Takeaway Pickup',
          details: details.trim(),
          instructions: instructions.trim(),
        },
        orderType,
        items,
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder.id);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <button
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Menu</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="font-display text-3xl font-black text-white">Checkout</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Complete your information to confirm the order.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8">
            {/* 1. Order Type Selection */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-3">
                1. Select Order Type
              </label>
              <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                {[
                  { id: 'delivery', label: 'Home Delivery' },
                  { id: 'takeaway', label: 'Self Takeaway' },
                  { id: 'dine-in', label: 'Dine-In' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrderType(t.id as any)}
                    className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                      orderType === t.id
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md shadow-amber-400/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Customer Contact Info */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                2. Contact Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zain Basra"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* 3. Delivery Address (if Delivery) */}
            {orderType === 'delivery' && (
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                  3. Delivery Location
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">Area / Sector</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Gulberg III, DHA Phase 5, Bahria Town"
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">House / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. House 42-B, Street 7, Block K"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Landmark / Floor Details</label>
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g. Near Siddique Trade Center, 2nd floor flat 4"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Instructions for Rider</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Leave with security guard, don't ring bell"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* 4. Payment Method Selection */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                {orderType === 'delivery' ? '4.' : '3.'} Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'cod', label: 'Cash on Delivery (COD)', icon: Banknote },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'easypaisa', label: 'EasyPaisa Wallet', icon: Smartphone },
                  { id: 'jazzcash', label: 'JazzCash Wallet', icon: Smartphone },
                  { id: 'bank_transfer', label: 'Direct Bank Transfer', icon: Building },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secure Payment Gateway Interface */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 mt-4 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" /> 256-Bit SSL Encrypted Gateway
                    </span>
                    <span>Visa / MasterCard</span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        maxLength={5}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    Security note: Raw card details are processed via payment gateway tokenization and are never stored on our database servers.
                  </p>
                </div>
              )}

              {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 mt-4 animate-fadeIn">
                  <span className="block text-xs font-semibold text-neutral-300">
                    Enter your {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Mobile Account Number
                  </span>
                  <input
                    type="tel"
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    placeholder="03XXXXXXXXX"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-neutral-500">
                    You will receive an in-app approval prompt or USSD PIN request on your phone.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 mt-4 text-xs text-neutral-400">
                  <p className="text-white font-semibold">Snack Fuel Corporate Account Details:</p>
                  <p>Bank: Meezan Bank Ltd (Gulberg Branch)</p>
                  <p>Title: Snack Fuel Hospitality Pvt Ltd</p>
                  <p>IBAN: PK65MEZN0001234567890123</p>
                  <p className="text-[11px] text-amber-400">
                    Please reference Order ID in transaction narration.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Order Summary Column (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
            <h3 className="font-display text-lg font-bold text-white">Order Summary</h3>

            {/* Items summary */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-800/80 pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono font-bold text-amber-400 w-5 text-center">
                      {item.quantity}×
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-[10px] text-neutral-500">{item.selectedSize}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-neutral-200 shrink-0">
                    Rs. {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-neutral-400 pt-4 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-white">Rs. {subtotal}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Promo Discount ({couponCode})</span>
                  <span className="font-mono tabular-nums">-Rs. {couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono tabular-nums text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `Rs. ${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax & Packaging</span>
                <span className="font-mono tabular-nums text-white">Rs. {tax}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-white pt-3 border-t border-neutral-800">
                <span>Total Due</span>
                <span className="font-mono tabular-nums text-amber-400">Rs. {total}</span>
              </div>
            </div>

            {/* Submit button linked to checkout-form */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Confirming Order...' : `Confirm & Place Order · Rs. ${total}`}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Satisfaction Guarantee · Real-time Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
