import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  image: string;
  ingredients: string[];
  availableSizes: Array<{ name: string; price: number }>;
  addOns: Array<{ name: string; price: number }>;
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

export interface OrderItem {
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
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
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

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  offers: Offer[];
  coupons: Coupon[];
  orders: Order[];
  riders: DeliveryRider[];
  messages: ChatMessage[];
  tickets: SupportTicket[];
  reviews: Review[];
  favorites: Record<string, string[]>; // userId -> productIds
  notifications: NotificationItem[];
  settings: RestaurantSettings;
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'snackfuel_db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, re-initializing seed data', err);
      }
    }
    const initial = this.getSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public persist() {
    this.saveData(this.data);
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, value: DatabaseSchema[K]) {
    this.data[table] = value;
    this.persist();
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  private getSeedData(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('password123', salt);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const riderPasswordHash = bcrypt.hashSync('rider123', salt);
    const supportPasswordHash = bcrypt.hashSync('support123', salt);

    const users: User[] = [
      {
        id: 'usr_admin_1',
        name: 'Snack Fuel Admin',
        email: 'admin@snackfuel.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+92 300 0000001',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr_rider_1',
        name: 'Farhan Malik (Rider)',
        email: 'rider@snackfuel.com',
        passwordHash: riderPasswordHash,
        role: 'rider',
        phone: '+92 301 5551234',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        createdAt: '2026-01-05T00:00:00.000Z',
      },
      {
        id: 'usr_support_1',
        name: 'Sara Khan (Support Agent)',
        email: 'support@snackfuel.com',
        passwordHash: supportPasswordHash,
        role: 'support',
        phone: '+92 302 9998877',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        isActive: true,
        createdAt: '2026-01-08T00:00:00.000Z',
      },
      {
        id: 'usr_customer_1',
        name: 'Zain Ahmed',
        email: 'customer@snackfuel.com',
        passwordHash: defaultPasswordHash,
        role: 'customer',
        phone: '+92 303 1122334',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            id: 'addr_1',
            label: 'Home',
            city: 'Lahore',
            area: 'Gulberg III',
            street: 'Main Boulevard, House 42-B',
            details: 'Near Siddique Trade Center, 2nd Floor',
            isDefault: true,
          },
          {
            id: 'addr_2',
            label: 'Office',
            city: 'Lahore',
            area: 'DHA Phase 5',
            street: 'Sector CCA, Building 14',
            details: 'Floor 3, Tech Studio',
            isDefault: false,
          },
        ],
        isActive: true,
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ];

    const categories: Category[] = [
      {
        id: 'cat_burgers',
        name: 'Smash Burgers',
        slug: 'burgers',
        description: 'Juicy 100% pure beef patties smashed to crispy perfection with cheddar cheese',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 'cat_zingers',
        name: 'Zinger Burgers',
        slug: 'zingers',
        description: 'Extra crispy buttermilk fried chicken breast fillets with secret spicy fire sauce',
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 'cat_pizza',
        name: 'Craft Pizzas',
        slug: 'pizza',
        description: 'Stone-baked crispy crust loaded with premium pepperoni, mozzarella and spicy toppings',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 3,
      },
      {
        id: 'cat_fries',
        name: 'Loaded Fries & Sides',
        slug: 'fries',
        description: 'Golden seasoned crisp fries smothered in hot cheddar cheese and crispy toppings',
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 4,
      },
      {
        id: 'cat_chicken',
        name: 'Crispy Wings & Strips',
        slug: 'chicken',
        description: 'Golden fried wings glazed in hot buffalo, honey garlic, or fiery Korean chili',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 5,
      },
      {
        id: 'cat_deals',
        name: 'Fuel Combos & Deals',
        slug: 'deals',
        description: 'Value-packed hunger-busting meal combos with fries and cold drinks included',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        isActive: true,
        displayOrder: 6,
      },
    ];

    const products: Product[] = [
      {
        id: 'prod_1',
        name: 'The Fuel Beast Double Smash',
        description:
          'Two 150g fresh Angus beef patties smashed with mustard, double melted Wisconsin cheddar, caramelized balsamic onions, smoky chipotle mayo on a toasted brioche bun.',
        categoryId: 'cat_burgers',
        price: 850,
        discountPrice: 750,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['Angus Beef', 'Wisconsin Cheddar', 'Caramelized Onions', 'Brioche Bun', 'Chipotle Mayo', 'Dill Pickles'],
        availableSizes: [
          { name: 'Single (150g)', price: 650 },
          { name: 'Double (300g)', price: 850 },
          { name: 'Triple Monster (450g)', price: 1150 },
        ],
        addOns: [
          { name: 'Extra Cheddar Cheese Slice', price: 90 },
          { name: 'Crispy Beef Bacon Rashers', price: 180 },
          { name: 'Pickled Jalapeños', price: 60 },
          { name: 'Truffle Aioli Dip', price: 120 },
        ],
        prepTimeMinutes: 14,
        isAvailable: true,
        isPopular: true,
        isBestSeller: true,
        rating: 4.9,
        reviewCount: 142,
        createdAt: '2026-01-10T12:00:00.000Z',
      },
      {
        id: 'prod_2',
        name: 'Inferno Crunch Zinger Burger',
        description:
          'Colossal whole chicken breast marinated in 12 fiery herbs, double hand-breaded for maximum shatter-crunch, pepper jack cheese, crisp iceberg lettuce, and Fuel magma sauce.',
        categoryId: 'cat_zingers',
        price: 680,
        discountPrice: 620,
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['Crispy Chicken Fillet', 'Pepper Jack Cheese', 'Iceberg Lettuce', 'Sesame Bun', 'Fire Magma Mayo'],
        availableSizes: [
          { name: 'Regular Crunch', price: 680 },
          { name: 'Double Tower Fillet', price: 950 },
        ],
        addOns: [
          { name: 'Melted Cheddar Sauce', price: 110 },
          { name: 'Extra Fiery Magma Dip', price: 70 },
          { name: 'Crunchy Hashbrown Topping', price: 140 },
        ],
        prepTimeMinutes: 12,
        isAvailable: true,
        isPopular: true,
        isBestSeller: true,
        rating: 4.8,
        reviewCount: 98,
        createdAt: '2026-01-11T12:00:00.000Z',
      },
      {
        id: 'prod_3',
        name: 'Truffle & Cheddar Loaded Lava Fries',
        description:
          'Golden skin-on shoestring fries layered with bubbling hot molten aged cheddar cheese sauce, crisp beef bacon bits, spicy jalapeños, smoked paprika dust and scallions.',
        categoryId: 'cat_fries',
        price: 520,
        discountPrice: 470,
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['Skin-on Russet Fries', 'Aged Cheddar Melt', 'Beef Bacon Bits', 'Pickled Jalapeños', 'Chives'],
        availableSizes: [
          { name: 'Solo Box', price: 520 },
          { name: 'Party Sharing Platter', price: 890 },
        ],
        addOns: [
          { name: 'Pulled BBQ Chicken Topping', price: 190 },
          { name: 'White Garlic Ranch Drizzle', price: 80 },
        ],
        prepTimeMinutes: 10,
        isAvailable: true,
        isPopular: true,
        isBestSeller: false,
        rating: 4.7,
        reviewCount: 76,
        createdAt: '2026-01-12T12:00:00.000Z',
      },
      {
        id: 'prod_4',
        name: 'Smokey Pepperoni & Chicken Supreme Pizza',
        description:
          '12-inch hand-stretched sourdough crust fired with rich San Marzano tomato sauce, double mozzarella, spicy beef pepperoni circles, smoked barbecue grilled chicken, and fresh basil.',
        categoryId: 'cat_pizza',
        price: 1350,
        discountPrice: 1190,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['Sourdough Crust', 'Mozzarella', 'Beef Pepperoni', 'Smoked Chicken Chunks', 'Oregano', 'Chili Flakes'],
        availableSizes: [
          { name: 'Medium 10"', price: 990 },
          { name: 'Large 13"', price: 1350 },
          { name: 'Jumbo 16"', price: 1750 },
        ],
        addOns: [
          { name: 'Cheese Stuffed Crust', price: 250 },
          { name: 'Extra Pepperoni', price: 200 },
          { name: 'Hot Honey Drizzle', price: 90 },
        ],
        prepTimeMinutes: 18,
        isAvailable: true,
        isPopular: true,
        isBestSeller: true,
        rating: 4.9,
        reviewCount: 115,
        createdAt: '2026-01-13T12:00:00.000Z',
      },
      {
        id: 'prod_5',
        name: 'Fiery Glazed Buffalo Chicken Wings (8 Pcs)',
        description:
          'Crispy tossed jumbo chicken wings smothered in tangy cayenne buffalo butter sauce, sprinkled with toasted sesame seeds, served with chilled garlic ranch dipping cup.',
        categoryId: 'cat_chicken',
        price: 690,
        discountPrice: 620,
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['Jumbo Wings', 'Cayenne Butter Glaze', 'Toasted Sesame', 'Garlic Ranch Dip'],
        availableSizes: [
          { name: '6 Pieces Box', price: 540 },
          { name: '8 Pieces Box', price: 690 },
          { name: '16 Pieces Mega Party Bucket', price: 1290 },
        ],
        addOns: [
          { name: 'Extra Ranch Sauce', price: 70 },
          { name: 'Fiery Ghost Pepper Glaze Upgrade', price: 90 },
        ],
        prepTimeMinutes: 15,
        isAvailable: true,
        isPopular: true,
        isBestSeller: false,
        rating: 4.8,
        reviewCount: 64,
        createdAt: '2026-01-14T12:00:00.000Z',
      },
      {
        id: 'prod_6',
        name: 'Snack Fuel Ultimate Duo Deal',
        description:
          '1 Fuel Beast Double Smash Burger + 1 Inferno Crunch Zinger Burger + 1 Large Truffle Loaded Fries + 2 Cold Drinks (500ml). Perfect for two foodies.',
        categoryId: 'cat_deals',
        price: 2190,
        discountPrice: 1790,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        ingredients: ['2 Burgers', '1 Loaded Fries', '2 Drinks (500ml)'],
        availableSizes: [
          { name: 'Duo Meal (2 Persons)', price: 1790 },
          { name: 'Squad Meal (4 Persons)', price: 3350 },
        ],
        addOns: [
          { name: 'Upgrade to Monster Shake', price: 150 },
          { name: 'Add 4 Pcs Crispy Tenders', price: 320 },
        ],
        prepTimeMinutes: 20,
        isAvailable: true,
        isPopular: true,
        isBestSeller: true,
        rating: 5.0,
        reviewCount: 88,
        createdAt: '2026-01-15T12:00:00.000Z',
      },
    ];

    const offers: Offer[] = [
      {
        id: 'off_1',
        title: 'Midweek Madness: 20% OFF All Burgers',
        description: 'Fuel your cravings with our signature smash & zinger burgers at an unbeatable 20% discount!',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        originalPrice: 850,
        discountPrice: 680,
        discountPercentage: 20,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isActive: true,
        badge: 'HOT DEAL',
      },
      {
        id: 'off_2',
        title: 'Friday Night Supreme Feast Deal',
        description: '1 Large Craft Pizza + 1 Loaded Lava Fries + 1.5L Chilled Drink for only Rs. 1599!',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
        originalPrice: 2050,
        discountPrice: 1599,
        discountPercentage: 22,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isActive: true,
        badge: 'WEEKEND SPECIAL',
      },
      {
        id: 'off_3',
        title: 'Student Fuel Pack',
        description: 'Single Smash Burger + Regular Salted Fries + 330ml Drink during all university weekdays!',
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80',
        originalPrice: 950,
        discountPrice: 720,
        discountPercentage: 24,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isActive: true,
        badge: 'STUDENT FAVORITE',
      },
    ];

    const coupons: Coupon[] = [
      {
        id: 'coup_1',
        code: 'FUEL20',
        discountPercent: 20,
        fixedDiscount: 0,
        minOrder: 1000,
        maxDiscount: 400,
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usedCount: 84,
        isActive: true,
      },
      {
        id: 'coup_2',
        code: 'FIRSTBITE',
        discountPercent: 0,
        fixedDiscount: 150,
        minOrder: 600,
        maxDiscount: 150,
        expiryDate: '2026-12-31',
        usageLimit: 1000,
        usedCount: 142,
        isActive: true,
      },
      {
        id: 'coup_3',
        code: 'SNACK50',
        discountPercent: 50,
        fixedDiscount: 0,
        minOrder: 2500,
        maxDiscount: 800,
        expiryDate: '2026-12-31',
        usageLimit: 100,
        usedCount: 29,
        isActive: true,
      },
    ];

    const riders: DeliveryRider[] = [
      {
        id: 'rdr_1',
        userId: 'usr_rider_1',
        name: 'Farhan Malik',
        phone: '+92 301 5551234',
        email: 'rider@snackfuel.com',
        vehicle: 'Honda CB 150F Red',
        plateNumber: 'LEE-26-8841',
        status: 'busy',
        rating: 4.9,
        completedDeliveries: 428,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        currentOrderId: 'SF-1042',
      },
      {
        id: 'rdr_2',
        name: 'Usman Tariq',
        phone: '+92 302 7772345',
        email: 'usman.rider@snackfuel.com',
        vehicle: 'Yamaha YBR 125 Black',
        plateNumber: 'LER-25-3319',
        status: 'available',
        rating: 4.8,
        completedDeliveries: 312,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
    ];

    const orders: Order[] = [
      {
        id: 'SF-1042',
        userId: 'usr_customer_1',
        customerName: 'Zain Ahmed',
        customerPhone: '+92 303 1122334',
        customerEmail: 'customer@snackfuel.com',
        deliveryAddress: {
          city: 'Lahore',
          area: 'Gulberg III',
          street: 'Main Boulevard, House 42-B',
          details: 'Near Siddique Trade Center, 2nd Floor',
          instructions: 'Ring bell twice, leave with guard if not answering',
        },
        orderType: 'delivery',
        items: [
          {
            productId: 'prod_1',
            name: 'The Fuel Beast Double Smash',
            price: 750,
            quantity: 1,
            selectedSize: 'Double (300g)',
            selectedAddOns: ['Extra Cheddar Cheese Slice'],
            specialInstructions: 'Extra napkins and less pickles please',
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
          },
          {
            productId: 'prod_3',
            name: 'Truffle & Cheddar Loaded Lava Fries',
            price: 470,
            quantity: 1,
            selectedSize: 'Solo Box',
            selectedAddOns: ['Pulled BBQ Chicken Topping'],
            image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80',
          },
        ],
        subtotal: 1500,
        deliveryFee: 150,
        tax: 75,
        discount: 150,
        couponCode: 'FIRSTBITE',
        total: 1575,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'out_for_delivery',
        riderId: 'rdr_1',
        riderName: 'Farhan Malik',
        riderPhone: '+92 301 5551234',
        estimatedDeliveryMinutes: 18,
        createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 'SF-1039',
        userId: 'usr_customer_1',
        customerName: 'Zain Ahmed',
        customerPhone: '+92 303 1122334',
        customerEmail: 'customer@snackfuel.com',
        deliveryAddress: {
          city: 'Lahore',
          area: 'Gulberg III',
          street: 'Main Boulevard, House 42-B',
          details: 'Near Siddique Trade Center, 2nd Floor',
        },
        orderType: 'delivery',
        items: [
          {
            productId: 'prod_2',
            name: 'Inferno Crunch Zinger Burger',
            price: 620,
            quantity: 2,
            selectedSize: 'Regular Crunch',
            image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80',
          },
        ],
        subtotal: 1240,
        deliveryFee: 150,
        tax: 62,
        discount: 0,
        total: 1452,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        status: 'delivered',
        riderId: 'rdr_1',
        riderName: 'Farhan Malik',
        riderPhone: '+92 301 5551234',
        estimatedDeliveryMinutes: 0,
        createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400 * 1000 * 2 + 35 * 60 * 1000).toISOString(),
      },
    ];

    const messages: ChatMessage[] = [
      {
        id: 'msg_1',
        orderId: 'SF-1042',
        senderId: 'usr_customer_1',
        senderRole: 'customer',
        senderName: 'Zain Ahmed',
        message: 'Hi Farhan, please call when you reach the main gate!',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg_2',
        orderId: 'SF-1042',
        senderId: 'usr_rider_1',
        senderRole: 'rider',
        senderName: 'Farhan Malik',
        message: 'Sure Zain bhai, picked up fresh from Snack Fuel kitchen. On Main Boulevard now, 5 mins away!',
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        isRead: true,
      },
    ];

    const tickets: SupportTicket[] = [
      {
        id: 'TK-8291',
        userId: 'usr_customer_1',
        userName: 'Zain Ahmed',
        userEmail: 'customer@snackfuel.com',
        orderId: 'SF-1039',
        subject: 'Missing extra dipping sauce in previous order',
        category: 'missing_item',
        status: 'in_progress',
        priority: 'medium',
        messages: [
          {
            id: 'tmsg_1',
            senderId: 'usr_customer_1',
            senderRole: 'customer',
            senderName: 'Zain Ahmed',
            text: 'I ordered extra fire magma dip with the zinger combo in order SF-1039, but it was missing from the bag.',
            timestamp: new Date(Date.now() - 86400 * 1000).toISOString(),
          },
          {
            id: 'tmsg_2',
            senderId: 'usr_support_1',
            senderRole: 'support',
            senderName: 'Sara Khan',
            text: 'Hello Zain, sincere apologies for the oversight! We have credited Rs. 150 voucher to your account (Code: FIRSTBITE) and alerted the packaging line manager.',
            timestamp: new Date(Date.now() - 80000 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 80000 * 1000).toISOString(),
      },
    ];

    const reviews: Review[] = [
      {
        id: 'rev_1',
        orderId: 'SF-1039',
        productId: 'prod_1',
        userId: 'usr_customer_1',
        userName: 'Zain Ahmed',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        foodRating: 5,
        deliveryRating: 5,
        comment:
          'Absolute masterpiece of a smash burger. The crust on the beef patty was seasoned spot on, buns were ultra buttery and the delivery arrived blazing hot in 20 minutes!',
        date: '2026-03-28',
        isVerified: true,
      },
      {
        id: 'rev_2',
        productId: 'prod_2',
        userId: 'usr_cust_demo2',
        userName: 'Ayesha Siddiqui',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        foodRating: 5,
        deliveryRating: 5,
        comment:
          'The crunch on the Inferno Zinger is unmatched! Way better than any multinational chain in town. Keep up the high standard Snack Fuel team!',
        date: '2026-03-25',
        isVerified: true,
      },
      {
        id: 'rev_3',
        productId: 'prod_3',
        userId: 'usr_cust_demo3',
        userName: 'Hamza Bilal',
        userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        foodRating: 5,
        deliveryRating: 4,
        comment:
          'Truffle loaded fries are addictive. The cheese pull is real and bacon bits are super crunchy. Packaging was super sleek black boxes.',
        date: '2026-03-22',
        isVerified: true,
      },
    ];

    const favorites: Record<string, string[]> = {
      usr_customer_1: ['prod_1', 'prod_3'],
    };

    const notifications: NotificationItem[] = [
      {
        id: 'notif_1',
        userId: 'usr_customer_1',
        targetRole: 'customer',
        title: 'Order Out for Delivery! 🚀',
        message: 'Your order SF-1042 is on its way with rider Farhan Malik. Track live now.',
        type: 'order',
        read: false,
        link: '/track/SF-1042',
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_2',
        userId: 'usr_admin_1',
        targetRole: 'admin',
        title: 'New Order Received',
        message: 'Order #SF-1042 placed by Zain Ahmed (Total: Rs. 1575).',
        type: 'order',
        read: true,
        link: '/admin/orders',
        createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
      },
    ];

    const settings: RestaurantSettings = {
      restaurantName: 'Snack Fuel',
      tagline: 'Fuel Your Hunger with Snack Fuel',
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
      heroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
      address: 'Plot 48-C, MM Alam Road, Gulberg III',
      city: 'Lahore, Pakistan',
      phone: '+92 42 111-383-500',
      email: 'hello@snackfuel.com',
      openingHours: 'Mon - Sun: 11:30 AM – 03:00 AM (Late Night Fuel)',
      deliveryFee: 150,
      freeDeliveryThreshold: 2000,
      minOrder: 300,
      taxRate: 5,
      currency: 'PKR',
      currencySymbol: 'Rs.',
      socialLinks: {
        facebook: 'https://facebook.com/snackfuel',
        instagram: 'https://instagram.com/snackfuel',
        twitter: 'https://twitter.com/snackfuel',
        whatsapp: '+923000000000',
      },
      aboutStory:
        'Snack Fuel was born out of one obsession: crafting the crispiest, juiciest, most uncompromising fast food without culinary shortcuts. We smash 100% fresh beef on scorching griddles, hand-batter premium chicken in 12 proprietary spices, and simmer artisanal sauces in small batches.',
      aboutMission:
        'Our mission is simple: provide lightning-fast, restaurant-quality comfort fuel right to your doorstep, backed by modern technology, transparent live tracking, and obsession with customer delight.',
      isAcceptingOrders: true,
    };

    return {
      users,
      categories,
      products,
      offers,
      coupons,
      orders,
      riders,
      messages,
      tickets,
      reviews,
      favorites,
      notifications,
      settings,
    };
  }
}

export const db = new DatabaseService();
