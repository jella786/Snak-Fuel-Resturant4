import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Star, Clock, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';
import { detectFoodType } from '../utils/imageUrl';

interface FoodDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedSizeIndex(0);
      setSelectedAddOns([]);
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const currentSize = product.availableSizes?.[selectedSizeIndex] || {
    name: 'Regular',
    price: product.discountPrice || product.price,
  };

  const addOnsTotal = selectedAddOns.reduce((sum, name) => {
    const item = product.addOns?.find((a) => a.name === name);
    return sum + (item ? item.price : 0);
  }, 0);

  const unitPrice = currentSize.price + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
      selectedSize: currentSize.name,
      selectedAddOns,
      specialInstructions: specialInstructions.trim() || undefined,
      image: product.image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-neutral-950/80 text-neutral-300 hover:text-white backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Large Food Image */}
          <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden">
            <SafeImage
              src={product.image}
              alt={product.name}
              fallbackType={detectFoodType(product.name)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
                  <span>({product.reviewCount} reviews)</span>
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{product.prepTimeMinutes} mins prep</span>
                </span>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-white">
                {product.name}
              </h2>
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                {product.description}
              </p>

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs text-neutral-300">
                    {product.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-neutral-800/80 px-2.5 py-1 rounded-md">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sizes Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
                  Select Size / Portion:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {product.availableSizes.map((size, index) => {
                    const isSelected = selectedSizeIndex === index;
                    return (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setSelectedSizeIndex(index)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <span>{size.name}</span>
                        <span className="font-mono tabular-nums text-neutral-400">
                          Rs. {size.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons Selection */}
            {product.addOns && product.addOns.length > 0 && (
              <div>
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
                  Custom Add-ons & Sauces:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.addOns.map((addon) => {
                    const isChecked = selectedAddOns.includes(addon.name);
                    return (
                      <button
                        key={addon.name}
                        type="button"
                        onClick={() => toggleAddOn(addon.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked
                                ? 'bg-amber-400 border-amber-400 text-neutral-950'
                                : 'border-neutral-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono tabular-nums text-neutral-400">
                          +Rs. {addon.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                Special Kitchen Instructions:
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Less spicy, no onions, extra napkins, cut into halves..."
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Sticky Purchase Footer */}
        <div className="bg-neutral-950 p-5 md:px-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono font-bold text-sm text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="sm:hidden text-right">
              <span className="font-mono tabular-nums text-lg font-extrabold text-amber-400">
                Rs. {totalPrice}
              </span>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full sm:w-auto flex-1 sm:max-w-xs py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart · Rs. {totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
