import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    settings,
    subtotal,
    deliveryFee,
    tax,
    total,
    totalItemCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponFeedback(null);
    const result = await applyCoupon(couponInput);
    setIsApplying(false);
    setCouponFeedback({
      success: result.success,
      text: result.message,
    });
    if (result.success) {
      setCouponInput('');
    }
  };

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 2000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-white">Your Order</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery threshold progress */}
          <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-800/80 text-xs">
            {remainingForFreeDelivery === 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>You unlocked FREE Delivery on this order!</span>
              </div>
            ) : (
              <div>
                <p className="text-neutral-300">
                  Add <span className="font-mono font-bold text-amber-400">Rs. {remainingForFreeDelivery}</span> more for{' '}
                  <span className="font-bold text-white">FREE Delivery</span>!
                </p>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${freeDeliveryProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-800/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <div className="w-16 h-16 rounded-2xl bg-neutral-800/60 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="font-display text-base font-bold text-white">Your Cart is Empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Your cart is empty. Let’s add something delicious and fuel up!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    fallbackType={detectFoodType(item.name)}
                    className="w-18 h-18 rounded-xl object-cover bg-neutral-950 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata details */}
                    <div className="text-[11px] text-neutral-400 mt-0.5 space-y-0.5">
                      {item.selectedSize && <p>Portion: {item.selectedSize}</p>}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <p className="truncate">+ {item.selectedAddOns.join(', ')}</p>
                      )}
                      {item.specialInstructions && (
                        <p className="italic text-neutral-500 truncate">"{item.specialInstructions}"</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-mono tabular-nums text-sm font-bold text-amber-400">
                        Rs. {item.price * item.quantity}
                      </span>

                      {/* Quantity stepper */}
                      <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer calculation & action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 space-y-4">
              {/* Promo Coupon Form */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">{couponCode}</span>
                      <span className="text-amber-400 font-mono">(-Rs. {couponDiscount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-rose-400 font-medium underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. FUEL20)"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="py-2 px-3.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${
                      couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {couponFeedback.success ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{couponFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-white">Rs. {subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-Rs. {couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-mono tabular-nums text-white">
                    {deliveryFee === 0 ? <span className="text-emerald-400">FREE</span> : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax & Packaging ({settings?.taxRate || 5}%)</span>
                  <span className="font-mono tabular-nums text-white">Rs. {tax}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-neutral-800">
                  <span>Final Total</span>
                  <span className="font-mono tabular-nums text-amber-400">Rs. {total}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
