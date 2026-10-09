/**
 * Real, authentic high-definition food photography for Snack Fuel.
 * Uses high-availability, high-speed CDN URLs so images 100% reliably display
 * across all browsers, mobile devices, local dev, Docker, Netlify, and GitHub.
 */

export const REAL_FOOD_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
  burger: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80',
  zinger: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80',
  fries: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  wings: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80',
  deals: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
  drinks: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
};

export const fallbackImages = REAL_FOOD_IMAGES;

export function detectFoodType(nameOrDesc?: string): keyof typeof fallbackImages {
  if (!nameOrDesc) return 'burger';
  const lower = nameOrDesc.toLowerCase();
  if (lower.includes('zinger') || lower.includes('crunch') || lower.includes('crispy')) return 'zinger';
  if (lower.includes('fries') || lower.includes('sides') || lower.includes('lava') || lower.includes('potato')) return 'fries';
  if (lower.includes('pizza') || lower.includes('pepperoni') || lower.includes('crust')) return 'pizza';
  if (lower.includes('wing') || lower.includes('strip') || lower.includes('tender') || lower.includes('nugget')) return 'wings';
  if (lower.includes('deal') || lower.includes('combo') || lower.includes('feast') || lower.includes('duo')) return 'deals';
  if (lower.includes('drink') || lower.includes('shake') || lower.includes('coke') || lower.includes('pepsi')) return 'drinks';
  return 'burger';
}

export function getImageUrl(pathOrUrl?: string | null, fallbackType?: keyof typeof fallbackImages): string {
  const chosenFallback = fallbackType || 'burger';
  if (!pathOrUrl || typeof pathOrUrl !== 'string' || pathOrUrl.trim() === '') {
    return REAL_FOOD_IMAGES[chosenFallback] || REAL_FOOD_IMAGES.default;
  }

  const trimmed = pathOrUrl.trim();

  // 1. Data URLs (e.g. uploaded images converted to base64) - work 100% everywhere without server disk
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // 2. Direct online CDN URLs (Unsplash, Cloudinary, Imgur, etc.)
  if (trimmed.startsWith('https://images.unsplash.com/') || trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  // 3. Map any legacy local /images/ or /src/assets/ path to genuine, authentic real food photography
  const lower = trimmed.toLowerCase();
  if (lower.includes('zinger')) {
    return REAL_FOOD_IMAGES.zinger;
  }
  if (lower.includes('fries') || lower.includes('lava')) {
    return REAL_FOOD_IMAGES.fries;
  }
  if (lower.includes('pizza') || lower.includes('smash_pizza')) {
    return REAL_FOOD_IMAGES.pizza;
  }
  if (lower.includes('wing') || lower.includes('chicken')) {
    return REAL_FOOD_IMAGES.wings;
  }
  if (lower.includes('deal') || lower.includes('combo')) {
    return REAL_FOOD_IMAGES.deals;
  }
  if (lower.includes('hero') || lower.includes('burger') || lower.includes('beast')) {
    return REAL_FOOD_IMAGES.hero;
  }

  return REAL_FOOD_IMAGES[chosenFallback] || REAL_FOOD_IMAGES.default;
}
