import {
  User,
  Product,
  Category,
  Offer,
  Coupon,
  Order,
  SupportTicket,
  Review,
  DeliveryRider,
  ChatMessage,
  NotificationItem,
  RestaurantSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_OFFERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from '../data/initialData';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('snackfuel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    throw new Error('Connection error. Server is unreachable or running offline.');
  }

  // Guard against non-JSON (like 404/200 HTML fallback from static hosts / Netlify / Vite SPA)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response.');
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Failed to parse JSON response.');
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  register: async (payload: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> => {
    try {
      const res = await request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.user && res.token) {
        localStorage.setItem('snackfuel_client_user', JSON.stringify(res.user));
        return res;
      }
    } catch {
      // Fallback
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      role: 'customer',
      phone: payload.phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const token = `sf_jwt_token_customer_${Date.now()}`;
    localStorage.setItem('snackfuel_client_user', JSON.stringify(newUser));
    return { user: newUser, token };
  },

  login: async (payload: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    try {
      const res = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.user && res.token) {
        localStorage.setItem('snackfuel_client_user', JSON.stringify(res.user));
        return res;
      }
    } catch {
      // Backend offline or static host fallback
    }

    // Offline / Client-Side fallback login
    const emailLower = (payload.email || '').trim().toLowerCase();
    let matchedUser: User;

    if (emailLower.includes('admin')) {
      matchedUser = INITIAL_USERS.admin;
    } else if (emailLower.includes('rider')) {
      matchedUser = INITIAL_USERS.rider;
    } else if (emailLower.includes('support')) {
      matchedUser = INITIAL_USERS.support;
    } else if (emailLower === 'zainbasra168@gmail.com' || emailLower.includes('zain') || emailLower === 'customer@snackfuel.com') {
      matchedUser = {
        ...INITIAL_USERS.customer,
        email: payload.email.trim(),
      };
    } else {
      matchedUser = {
        id: `usr_${Date.now()}`,
        name: payload.email.split('@')[0],
        email: payload.email.trim(),
        role: 'customer',
        phone: '+92 300 0000000',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }

    const token = `sf_jwt_token_${matchedUser.role}_${Date.now()}`;
    localStorage.setItem('snackfuel_client_user', JSON.stringify(matchedUser));
    return { user: matchedUser, token };
  },

  quickSwitchRole: async (role: string): Promise<{ user: User; token: string }> => {
    try {
      const res = await request<{ user: User; token: string }>('/auth/quick-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (res && res.user && res.token) {
        localStorage.setItem('snackfuel_client_user', JSON.stringify(res.user));
        return res;
      }
    } catch {
      // Fallback
    }

    const matchedUser: User =
      INITIAL_USERS[role] || {
        id: `usr_${role}_${Date.now()}`,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Demo`,
        email: `${role}@snackfuel.com`,
        role: role as any,
        phone: '+92 300 1234567',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

    const token = `sf_demo_token_${matchedUser.role}_${Date.now()}`;
    localStorage.setItem('snackfuel_client_user', JSON.stringify(matchedUser));
    return { user: matchedUser, token };
  },

  getMe: async (): Promise<User> => {
    try {
      const user = await request<User>('/auth/me');
      if (user && user.id) return user;
    } catch {
      // Fallback
    }

    try {
      const cached = localStorage.getItem('snackfuel_client_user');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    const token = localStorage.getItem('snackfuel_token');
    if (token) {
      if (token.includes('admin')) return INITIAL_USERS.admin;
      if (token.includes('rider')) return INITIAL_USERS.rider;
      if (token.includes('support')) return INITIAL_USERS.support;
      return INITIAL_USERS.customer;
    }

    throw new Error('User not found');
  },

  updateProfile: (payload: Partial<User>) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Settings
  getSettings: async (): Promise<RestaurantSettings> => {
    try {
      const res = await request<RestaurantSettings>('/settings');
      if (res && res.restaurantName) return res;
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  updateSettings: (payload: Partial<RestaurantSettings>) =>
    request<RestaurantSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await request<Category[]>('/categories');
      if (Array.isArray(res) && res.length > 0) {
        try {
          localStorage.setItem('snackfuel_cached_categories', JSON.stringify(res));
        } catch {}
        return res;
      }
    } catch {
      // Fallback
    }
    try {
      const cached = localStorage.getItem('snackfuel_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CATEGORIES;
  },
  createCategory: (payload: Partial<Category>) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCategory: (id: string, payload: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await request<Product[]>('/products');
      if (Array.isArray(res) && res.length > 0) {
        try {
          localStorage.setItem('snackfuel_cached_products', JSON.stringify(res));
        } catch {}
        return res;
      }
    } catch {
      // Fallback
    }
    try {
      const cached = localStorage.getItem('snackfuel_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  },
  getProduct: async (id: string): Promise<Product> => {
    try {
      return await request<Product>(`/products/${id}`);
    } catch {
      const match = INITIAL_PRODUCTS.find((p) => p.id === id);
      if (match) return match;
      throw new Error('Product not found');
    }
  },
  createProduct: (payload: Partial<Product>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: string, payload: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Offers
  getOffers: async (): Promise<Offer[]> => {
    try {
      const res = await request<Offer[]>('/offers');
      if (Array.isArray(res) && res.length > 0) {
        try {
          localStorage.setItem('snackfuel_cached_offers', JSON.stringify(res));
        } catch {}
        return res;
      }
    } catch {}
    try {
      const cached = localStorage.getItem('snackfuel_cached_offers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_OFFERS;
  },
  createOffer: (payload: Partial<Offer>) =>
    request<Offer>('/offers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateOffer: (id: string, payload: Partial<Offer>) =>
    request<Offer>(`/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteOffer: (id: string) =>
    request<{ success: boolean }>(`/offers/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const res = await request<Coupon[]>('/coupons');
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return INITIAL_COUPONS;
  },
  validateCoupon: async (code: string, orderAmount: number) => {
    try {
      return await request<{ valid: boolean; code: string; discount: number; coupon: Coupon }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderAmount }),
      });
    } catch {
      const clean = code.trim().toUpperCase();
      const match = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === clean && c.isActive);
      if (!match) {
        throw new Error('Invalid coupon code');
      }
      if (orderAmount < match.minOrder) {
        throw new Error(`Minimum order of Rs. ${match.minOrder} required for this coupon`);
      }
      let discount = 0;
      if (match.discountPercent > 0) {
        discount = Math.min((orderAmount * match.discountPercent) / 100, match.maxDiscount || Infinity);
      } else if (match.fixedDiscount > 0) {
        discount = Math.min(match.fixedDiscount, match.maxDiscount || Infinity);
      }
      return { valid: true, code: match.code, discount: Math.round(discount), coupon: match };
    }
  },
  createCoupon: (payload: Partial<Coupon>) =>
    request<Coupon>('/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCoupon: (id: string, payload: Partial<Coupon>) =>
    request<Coupon>(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCoupon: (id: string) =>
    request<{ success: boolean }>(`/coupons/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request<Order[]>('/orders'),
  getOrder: async (id: string): Promise<Order> => {
    const raw = (id || '').trim();
    if (!raw) {
      throw new Error('Please enter an Order ID (e.g. SF-1042)');
    }
    let cleanId = raw.replace(/^#/, '').toUpperCase();
    if (/^\d{3,5}$/.test(cleanId)) {
      cleanId = `SF-${cleanId}`;
    }

    try {
      const res = await request<Order>(`/orders/${encodeURIComponent(cleanId)}`);
      if (res && res.id) return res;
    } catch {
      // Fallback
    }

    // 1. Check local storage
    try {
      const storedOrders: Order[] = JSON.parse(localStorage.getItem('snackfuel_client_orders') || '[]');
      const found = storedOrders.find(
        (o) =>
          o.id.toUpperCase() === cleanId ||
          o.id.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
      );
      if (found) return found;
    } catch {}

    // 2. Check initial orders
    if (INITIAL_ORDERS[cleanId]) {
      return INITIAL_ORDERS[cleanId];
    }

    // 3. Fuzzy search in demo orders by numeric match
    const cleanDigits = cleanId.replace(/[^0-9]/g, '');
    if (cleanDigits) {
      const fuzzyKey = Object.keys(INITIAL_ORDERS).find((k) => k.includes(cleanDigits));
      if (fuzzyKey && INITIAL_ORDERS[fuzzyKey]) {
        return INITIAL_ORDERS[fuzzyKey];
      }
    }

    throw new Error(`Order #${cleanId} not found. Check your order number (e.g., SF-1042) or select from sample orders below.`);
  },
  createOrder: async (payload: any): Promise<Order> => {
    let order: Order;
    try {
      order = await request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Offline fallback order creation
      order = {
        ...payload,
        id: `SF-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'pending',
        paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDeliveryMinutes: 30,
      };
    }

    // Persist to local storage
    try {
      const stored: Order[] = JSON.parse(localStorage.getItem('snackfuel_client_orders') || '[]');
      stored.unshift(order);
      localStorage.setItem('snackfuel_client_orders', JSON.stringify(stored));
    } catch {}

    return order;
  },
  updateOrderStatus: (id: string, status: string, cancellationReason?: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, cancellationReason }),
    }),
  assignRider: (orderId: string, riderId: string) =>
    request<Order>(`/orders/${orderId}/assign-rider`, {
      method: 'PUT',
      body: JSON.stringify({ riderId }),
    }),

  // Rider portal
  getRiderOrders: () => request<Order[]>('/rider/orders'),
  updateRiderOrderStatus: (id: string, status: string) =>
    request<Order>(`/rider/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Messages
  getOrderMessages: (orderId: string) => request<ChatMessage[]>(`/orders/${orderId}/messages`),
  sendOrderMessage: (orderId: string, payload: { message: string; senderRole?: string; senderName?: string }) =>
    request<ChatMessage>(`/orders/${orderId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Support
  getSupportTickets: () => request<SupportTicket[]>('/support/tickets'),
  getSupportTicket: (id: string) => request<SupportTicket>(`/support/tickets/${id}`),
  createSupportTicket: (payload: { subject: string; category: string; message: string; orderId?: string }) =>
    request<SupportTicket>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  replySupportTicket: (id: string, text: string) =>
    request<SupportTicket>(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  updateTicketStatus: (id: string, status: string) =>
    request<SupportTicket>(`/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    try {
      const res = await request<Review[]>('/reviews');
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return INITIAL_REVIEWS;
  },
  submitReview: (payload: {
    orderId?: string;
    productId?: string;
    rating: number;
    foodRating?: number;
    deliveryRating?: number;
    comment: string;
  }) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Favorites
  getFavorites: () => request<{ ids: string[]; products: Product[] }>('/favorites'),
  toggleFavorite: (productId: string) =>
    request<{ ids: string[]; isFavorite: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // Admin users & riders
  getAdminUsers: () => request<User[]>('/admin/users'),
  toggleUserActive: (id: string) =>
    request<User>(`/admin/users/${id}/toggle`, { method: 'PUT' }),
  getAdminRiders: () => request<DeliveryRider[]>('/admin/riders'),
  createRider: (payload: Partial<DeliveryRider>) =>
    request<DeliveryRider>('/admin/riders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRider: (id: string, payload: Partial<DeliveryRider>) =>
    request<DeliveryRider>(`/admin/riders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteRider: (id: string) =>
    request<{ success: boolean }>(`/admin/riders/${id}`, { method: 'DELETE' }),

  getAdminStats: () =>
    request<{
      metrics: {
        totalOrders: number;
        pendingOrders: number;
        activeOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        totalCustomers: number;
        activeRiders: number;
        totalProducts: number;
      };
      dailySales: Array<{ day: string; sales: number; orders: number }>;
    }>('/admin/stats'),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // Upload image
  uploadImage: (dataUrl: string) =>
    request<{ url: string; success: boolean }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    }),

  // AI Helpers (Free Grounding & Transcription)
  aiMapsLocation: (payload: { query?: string; address?: string }) =>
    request<{ text: string; groundingMetadata?: any }>('/ai/maps-location', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  aiSearchGrounding: (prompt: string) =>
    request<{ text: string; groundingMetadata?: any }>('/ai/search-grounding', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  aiVoiceTranscribe: (payload: { audioBase64: string; mimeType?: string }) =>
    request<{ text: string }>('/ai/voice-transcribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
