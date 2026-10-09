export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'rider' | 'support';
  phone: string;
  avatar?: string;
  addresses?: Array<{
    id: string;
    label: string;
    city: string;
    area: string;
    street: string;
    details: string;
    isDefault: boolean;
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ProductSize {
  name: string;
  price: number;
}

export interface ProductAddOn {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  image: string;
  ingredients: string[];
  availableSizes: ProductSize[];
  addOns: ProductAddOn[];
  prepTimeMinutes: number;
  isAvailable: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  dietaryTag?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  badge: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  fixedDiscount: number;
  minOrder: number;
  maxDiscount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface CartItem {
  id: string; // unique cart entry key
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedAddOns?: string[];
  specialInstructions?: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: {
    city: string;
    area: string;
    street: string;
    details: string;
    instructions?: string;
  };
  orderType: 'delivery' | 'takeaway' | 'dine-in';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cod' | 'card' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'rider_assigned'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export interface DeliveryRider {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  plateNumber: string;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completedDeliveries: number;
  avatar: string;
  currentOrderId?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderRole: 'customer' | 'rider' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  subject: string;
  category:
    | 'order_problem'
    | 'refund'
    | 'missing_item'
    | 'wrong_item'
    | 'delivery'
    | 'payment'
    | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: Array<{
    id: string;
    senderId: string;
    senderRole: 'customer' | 'support';
    senderName: string;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  productId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  foodRating: number;
  deliveryRating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  targetRole?: 'customer' | 'admin' | 'rider' | 'support';
  title: string;
  message: string;
  type: 'order' | 'support' | 'offer' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  logo: string;
  heroImage: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  openingHours: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrder: number;
  taxRate: number;
  currency: string;
  currencySymbol: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    whatsapp: string;
  };
  aboutStory: string;
  aboutMission: string;
  isAcceptingOrders: boolean;
}
