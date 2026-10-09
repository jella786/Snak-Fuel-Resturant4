import React, { useState, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal, Flame, Sparkles, Filter, X, Mic, MicOff, HelpCircle, Loader2 } from 'lucide-react';
import { Product, Category } from '../types';
import { FoodCard } from '../components/FoodCard';
import { api } from '../services/api';

interface MenuPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'popular'>('featured');
  const [filterTag, setFilterTag] = useState<'all' | 'popular' | 'bestseller' | 'deals'>('all');

  // Voice Search State
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Search Grounding Assistant State
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setTranscribing(true);
          try {
            const res = await api.aiVoiceTranscribe({
              audioBase64: base64Audio,
              mimeType: 'audio/webm',
            });
            if (res.text) {
              setSearchQuery(res.text);
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setTranscribing(false);
          }
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access is needed for voice food search.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAskAiAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await api.aiSearchGrounding(aiQuestion.trim());
      setAiAnswer(res.text);
    } catch (err: any) {
      setAiAnswer('Unable to complete search at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesIng = p.ingredients?.some((ing) => ing.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesIng) return false;
      }

      // Tag filter
      if (filterTag === 'popular' && !p.isPopular) return false;
      if (filterTag === 'bestseller' && !p.isBestSeller) return false;
      if (filterTag === 'deals' && !p.discountPrice) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, filterTag]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Full Kitchen Menu
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
            Craving Satisfaction, Delivered
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Fresh handcrafted burgers, fiery zingers, artisanal stone-baked pizzas, and loaded fries.
          </p>
        </div>

        {/* AI Food Search Grounding Assistant trigger */}
        <button
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400/50 rounded-xl text-xs font-bold text-neutral-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask Dietary & Ingredients Assistant</span>
        </button>
      </div>

      {/* Google Search Grounded Food Assistant Drawer */}
      {aiAssistantOpen && (
        <div className="p-6 rounded-3xl bg-neutral-900 border border-amber-400/30 animate-fadeIn space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Google Search Grounded Dietary & Recipe Guide
              </h3>
            </div>
            <button
              onClick={() => setAiAssistantOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAskAiAssistant} className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask about calorie counts, allergen details, halal standards, or sauce ingredients..."
              className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              {aiLoading ? 'Searching...' : 'Ask AI'}
            </button>
          </form>

          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {aiAnswer}
            </div>
          )}
        </div>
      )}

      {/* Search & Sorting Toolbar with Voice Input */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar with Microphone */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={transcribing ? 'Transcribing your voice...' : 'Search food or click mic to speak...'}
            className="w-full pl-10 pr-20 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`p-1.5 rounded-lg transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : transcribing
                  ? 'bg-amber-400 text-neutral-950 animate-spin'
                  : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
              }`}
              title={isRecording ? 'Stop Recording' : 'Voice Search (Urdu/English)'}
              aria-label="Voice Search"
            >
              {transcribing ? (
                <Loader2 className="w-4 h-4" />
              ) : isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Tag Buttons (Segmented Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
          <button
            onClick={() => setFilterTag('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTag === 'all'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterTag('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTag === 'popular'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setFilterTag('bestseller')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTag === 'bestseller'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Best Sellers
          </button>
          <button
            onClick={() => setFilterTag('deals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTag === 'deals'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Offers & Deals
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full md:w-auto bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Dynamic Categories Tabs (Interactive Filter Controls) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-neutral-900 border border-neutral-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">No Matching Food Items</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            We couldn't find any products matching your search criteria. Try clearing filters or searching for something else.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFilterTag('all');
            }}
            className="mt-5 py-2 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const cat = categories.find((c) => c.id === p.categoryId);
            return (
              <FoodCard
                key={p.id}
                product={p}
                categoryName={cat?.name}
                isFavorite={favorites.includes(p.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

