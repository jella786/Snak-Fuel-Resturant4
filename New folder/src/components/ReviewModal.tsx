import React, { useState } from 'react';
import { X, Star, Send, ThumbsUp } from 'lucide-react';
import { api } from '../services/api';

interface ReviewModalProps {
  orderId: string;
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  orderId,
  productId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief comment sharing your experience');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.submitReview({
        orderId,
        productId,
        rating: overallRating,
        foodRating,
        deliveryRating,
        comment: comment.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number, setter: (val: number) => void) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setter(star)}
          className="p-1 hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-700 hover:text-neutral-500'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-base text-white">Rate Your Experience</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div className="text-center py-2 bg-neutral-950/60 rounded-2xl border border-neutral-800/80">
            <span className="text-xs text-neutral-400 font-medium block mb-2">Overall Experience</span>
            <div className="flex justify-center">{renderStars(overallRating, setOverallRating)}</div>
          </div>

          {/* Food and Delivery Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
              <span className="text-[11px] text-neutral-400 block mb-1">Taste & Quality</span>
              <div className="flex justify-center scale-90">{renderStars(foodRating, setFoodRating)}</div>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
              <span className="text-[11px] text-neutral-400 block mb-1">Delivery Speed</span>
              <div className="flex justify-center scale-90">{renderStars(deliveryRating, setDeliveryRating)}</div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Review & Feedback
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved about the food, the crispiness, packaging, or rider speed..."
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Post Verified Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
