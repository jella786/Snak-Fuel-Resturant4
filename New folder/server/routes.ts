import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { db, User, Product, Category, Offer, Coupon, Order, SupportTicket, Review, DeliveryRider, ChatMessage, NotificationItem, RestaurantSettings } from './db';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'snackfuel-super-secret-jwt-key-2026';

// Gemini AI client initialization on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Ensure uploads folder exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Auth Middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin' | 'rider' | 'support';
    name: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS
// ----------------------------------------------------

router.post('/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const users = db.get('users');
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer',
    phone: phone || '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    addresses: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  db.set('users', users);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = db.get('users');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

// Quick Switch role for effortless testing of all 4 roles in the prompt
router.post('/auth/quick-switch', (req, res) => {
  const { role } = req.body;
  const users = db.get('users');
  const targetUser = users.find((u) => u.role === role);
  if (!targetUser) {
    return res.status(404).json({ error: `No user found with role: ${role}` });
  }

  const token = jwt.sign(
    { id: targetUser.id, email: targetUser.email, role: targetUser.role, name: targetUser.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { passwordHash: _, ...safeUser } = targetUser;
  res.json({ user: safeUser, token });
});

router.get('/auth/me', authenticate, (req: AuthRequest, res) => {
  const users = db.get('users');
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.put('/auth/profile', authenticate, (req: AuthRequest, res) => {
  const users = db.get('users');
  const index = users.findIndex((u) => u.id === req.user?.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, phone, avatar, addresses } = req.body;
  if (name) users[index].name = name;
  if (phone !== undefined) users[index].phone = phone;
  if (avatar) users[index].avatar = avatar;
  if (addresses) users[index].addresses = addresses;

  db.set('users', users);
  const { passwordHash: _, ...safeUser } = users[index];
  res.json(safeUser);
});

// ----------------------------------------------------
// 2. RESTAURANT SETTINGS
// ----------------------------------------------------

router.get('/settings', (_req, res) => {
  res.json(db.get('settings'));
});

router.put('/settings', authenticate, requireRole('admin'), (req, res) => {
  const current = db.get('settings');
  const updated: RestaurantSettings = {
    ...current,
    ...req.body,
  };
  db.set('settings', updated);
  res.json(updated);
});

// ----------------------------------------------------
// 3. CATEGORIES
// ----------------------------------------------------

router.get('/categories', (_req, res) => {
  const categories = db.get('categories');
  res.json(categories.sort((a, b) => a.displayOrder - b.displayOrder));
});

router.post('/categories', authenticate, requireRole('admin'), (req, res) => {
  const { name, description, image, isActive, displayOrder } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const categories = db.get('categories');
  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    isActive: isActive !== undefined ? isActive : true,
    displayOrder: displayOrder || categories.length + 1,
  };

  categories.push(newCat);
  db.set('categories', categories);
  res.status(201).json(newCat);
});

router.put('/categories/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const categories = db.get('categories');
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });

  categories[index] = {
    ...categories[index],
    ...req.body,
    id, // preserve id
  };
  db.set('categories', categories);
  res.json(categories[index]);
});

router.delete('/categories/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let categories = db.get('categories');
  categories = categories.filter((c) => c.id !== id);
  db.set('categories', categories);
  res.json({ success: true, message: 'Category deleted' });
});

// ----------------------------------------------------
// 4. PRODUCTS / MENU ITEMS
// ----------------------------------------------------

router.get('/products', (_req, res) => {
  const products = db.get('products');
  res.json(products);
});

router.get('/products/:id', (req, res) => {
  const products = db.get('products');
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/products', authenticate, requireRole('admin'), (req, res) => {
  const {
    name,
    description,
    categoryId,
    price,
    discountPrice,
    image,
    ingredients,
    availableSizes,
    addOns,
    prepTimeMinutes,
    isAvailable,
    isPopular,
    isBestSeller,
    dietaryTag,
  } = req.body;

  if (!name || price === undefined || !categoryId) {
    return res.status(400).json({ error: 'Product name, category, and price are required' });
  }

  const products = db.get('products');
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    description: description || '',
    categoryId,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    ingredients: Array.isArray(ingredients) ? ingredients : typeof ingredients === 'string' ? ingredients.split(',').map((s) => s.trim()).filter(Boolean) : [],
    availableSizes: availableSizes || [{ name: 'Regular', price: Number(price) }],
    addOns: addOns || [],
    prepTimeMinutes: Number(prepTimeMinutes) || 15,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    isPopular: !!isPopular,
    isBestSeller: !!isBestSeller,
    dietaryTag: dietaryTag || undefined,
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  db.set('products', products);
  res.status(201).json(newProduct);
});

router.put('/products/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const products = db.get('products');
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const current = products[index];
  const updated: Product = {
    ...current,
    ...req.body,
    id,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    discountPrice: req.body.discountPrice !== undefined ? (req.body.discountPrice ? Number(req.body.discountPrice) : undefined) : current.discountPrice,
    prepTimeMinutes: req.body.prepTimeMinutes !== undefined ? Number(req.body.prepTimeMinutes) : current.prepTimeMinutes,
    ingredients: Array.isArray(req.body.ingredients)
      ? req.body.ingredients
      : typeof req.body.ingredients === 'string'
      ? req.body.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
      : current.ingredients,
  };

  products[index] = updated;
  db.set('products', products);
  res.json(updated);
});

router.delete('/products/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let products = db.get('products');
  products = products.filter((p) => p.id !== id);
  db.set('products', products);
  res.json({ success: true, message: 'Product deleted' });
});

// ----------------------------------------------------
// 5. OFFERS & DEALS
// ----------------------------------------------------

router.get('/offers', (_req, res) => {
  res.json(db.get('offers'));
});

router.post('/offers', authenticate, requireRole('admin'), (req, res) => {
  const { title, description, image, originalPrice, discountPrice, discountPercentage, startDate, endDate, isActive, badge } = req.body;
  if (!title) return res.status(400).json({ error: 'Offer title is required' });

  const offers = db.get('offers');
  const newOffer: Offer = {
    id: `off_${Date.now()}`,
    title,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    originalPrice: Number(originalPrice) || 0,
    discountPrice: Number(discountPrice) || 0,
    discountPercentage: Number(discountPercentage) || 0,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '2026-12-31',
    isActive: isActive !== undefined ? isActive : true,
    badge: badge || 'SPECIAL DEAL',
  };

  offers.push(newOffer);
  db.set('offers', offers);
  res.status(201).json(newOffer);
});

router.put('/offers/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const offers = db.get('offers');
  const index = offers.findIndex((o) => o.id === id);
  if (index === -1) return res.status(404).json({ error: 'Offer not found' });

  offers[index] = {
    ...offers[index],
    ...req.body,
    id,
  };
  db.set('offers', offers);
  res.json(offers[index]);
});

router.delete('/offers/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let offers = db.get('offers');
  offers = offers.filter((o) => o.id !== id);
  db.set('offers', offers);
  res.json({ success: true });
});

// ----------------------------------------------------
// 6. COUPONS
// ----------------------------------------------------

router.get('/coupons', authenticate, requireRole('admin'), (_req, res) => {
  res.json(db.get('coupons'));
});

router.post('/coupons/validate', (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });

  const coupons = db.get('coupons');
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  const now = new Date();
  if (new Date(coupon.expiryDate) < now) {
    return res.status(400).json({ error: 'This coupon has expired' });
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Coupon usage limit reached' });
  }

  const amount = Number(orderAmount) || 0;
  if (amount < coupon.minOrder) {
    return res.status(400).json({ error: `Minimum order amount of Rs. ${coupon.minOrder} required for this coupon` });
  }

  let discount = 0;
  if (coupon.discountPercent > 0) {
    discount = (amount * coupon.discountPercent) / 100;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.fixedDiscount > 0) {
    discount = Math.min(coupon.fixedDiscount, amount);
  }

  res.json({
    valid: true,
    code: coupon.code,
    discount: Math.round(discount),
    coupon,
  });
});

router.post('/coupons', authenticate, requireRole('admin'), (req, res) => {
  const { code, discountPercent, fixedDiscount, minOrder, maxDiscount, expiryDate, usageLimit, isActive } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const coupons = db.get('coupons');
  const newCoupon: Coupon = {
    id: `coup_${Date.now()}`,
    code: code.toUpperCase().trim(),
    discountPercent: Number(discountPercent) || 0,
    fixedDiscount: Number(fixedDiscount) || 0,
    minOrder: Number(minOrder) || 0,
    maxDiscount: Number(maxDiscount) || 0,
    expiryDate: expiryDate || '2026-12-31',
    usageLimit: Number(usageLimit) || 1000,
    usedCount: 0,
    isActive: isActive !== undefined ? isActive : true,
  };

  coupons.push(newCoupon);
  db.set('coupons', coupons);
  res.status(201).json(newCoupon);
});

router.put('/coupons/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const coupons = db.get('coupons');
  const index = coupons.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Coupon not found' });

  coupons[index] = { ...coupons[index], ...req.body, id };
  db.set('coupons', coupons);
  res.json(coupons[index]);
});

router.delete('/coupons/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let coupons = db.get('coupons');
  coupons = coupons.filter((c) => c.id !== id);
  db.set('coupons', coupons);
  res.json({ success: true });
});

// ----------------------------------------------------
// 7. ORDERS
// ----------------------------------------------------

router.get('/orders', authenticate, (req: AuthRequest, res) => {
  const orders = db.get('orders');
  if (req.user?.role === 'admin') {
    return res.json(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  // Customer sees own orders
  const userOrders = orders
    .filter((o) => o.userId === req.user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userOrders);
});

router.get('/orders/:id', optionalAuth, (req: AuthRequest, res) => {
  const orders = db.get('orders');
  const order = orders.find((o) => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // If user is authenticated, check role or ownership, but allow track order by ID
  res.json(order);
});

router.post('/orders', optionalAuth, (req: AuthRequest, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    orderType,
    items,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: 'Customer name, phone, and items are required' });
  }

  const settings = db.get('settings');
  if (!settings.isAcceptingOrders) {
    return res.status(400).json({ error: 'The restaurant is currently not accepting new orders. Please check back shortly.' });
  }

  // Calculate Subtotal
  let subtotal = 0;
  for (const item of items) {
    subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }

  // Calculate discount if coupon provided
  let discount = 0;
  if (couponCode) {
    const coupons = db.get('coupons');
    const c = coupons.find((cp) => cp.code.toUpperCase() === couponCode.toUpperCase().trim() && cp.isActive);
    if (c && subtotal >= c.minOrder) {
      if (c.discountPercent > 0) {
        discount = (subtotal * c.discountPercent) / 100;
        if (c.maxDiscount > 0 && discount > c.maxDiscount) discount = c.maxDiscount;
      } else if (c.fixedDiscount > 0) {
        discount = Math.min(c.fixedDiscount, subtotal);
      }
      c.usedCount += 1;
      db.set('coupons', coupons);
    }
  }

  const deliveryFee = orderType === 'delivery' ? (subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee) : 0;
  const tax = Math.round((subtotal * settings.taxRate) / 100);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const orderId = `SF-${Math.floor(1000 + Math.random() * 9000)}`;
  const userId = req.user?.id || `usr_guest_${Date.now()}`;

  const newOrder: Order = {
    id: orderId,
    userId,
    customerName,
    customerPhone,
    customerEmail: customerEmail || 'customer@snackfuel.com',
    deliveryAddress: deliveryAddress || { city: 'Lahore', area: 'Downtown', street: 'Street 1', details: '' },
    orderType: orderType || 'delivery',
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    couponCode: couponCode || undefined,
    total,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    status: 'pending',
    estimatedDeliveryMinutes: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = db.get('orders');
  orders.unshift(newOrder);
  db.set('orders', orders);

  // Trigger Admin Notification
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: 'usr_admin_1',
    targetRole: 'admin',
    title: `New Order: #${orderId}`,
    message: `${customerName} placed order #${orderId} (Rs. ${total}). Payment: ${paymentMethod.toUpperCase()}`,
    type: 'order',
    read: false,
    link: `/admin/orders`,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.status(201).json(newOrder);
});

router.put('/orders/:id/status', authenticate, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;

  const orders = db.get('orders');
  const index = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  const order = orders[index];
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (cancellationReason) order.cancellationReason = cancellationReason;

  if (status === 'delivered') {
    order.paymentStatus = 'paid';
    // Free rider if assigned
    if (order.riderId) {
      const riders = db.get('riders');
      const r = riders.find((rd) => rd.id === order.riderId);
      if (r) {
        r.status = 'available';
        r.completedDeliveries += 1;
        r.currentOrderId = undefined;
        db.set('riders', riders);
      }
    }
  }

  orders[index] = order;
  db.set('orders', orders);

  // Send notification to customer
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: order.userId,
    targetRole: 'customer',
    title: `Order Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
    message: `Your order #${order.id} is now ${status.replace(/_/g, ' ')}.`,
    type: 'order',
    read: false,
    link: `/track/${order.id}`,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.json(order);
});

router.put('/orders/:id/assign-rider', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { riderId } = req.body;

  const orders = db.get('orders');
  const orderIndex = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());
  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

  const riders = db.get('riders');
  const rider = riders.find((r) => r.id === riderId);
  if (!rider) return res.status(404).json({ error: 'Rider not found' });

  orders[orderIndex].riderId = rider.id;
  orders[orderIndex].riderName = rider.name;
  orders[orderIndex].riderPhone = rider.phone;
  orders[orderIndex].status = 'rider_assigned';
  orders[orderIndex].updatedAt = new Date().toISOString();

  rider.status = 'busy';
  rider.currentOrderId = orders[orderIndex].id;

  db.set('orders', orders);
  db.set('riders', riders);

  // Notify Rider
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: rider.userId || 'usr_rider_1',
    targetRole: 'rider',
    title: 'New Delivery Assigned!',
    message: `You have been assigned order #${orders[orderIndex].id} to ${orders[orderIndex].customerName}.`,
    type: 'order',
    read: false,
    link: `/rider`,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.json(orders[orderIndex]);
});

// ----------------------------------------------------
// 8. RIDER PORTAL ENDPOINTS
// ----------------------------------------------------

router.get('/rider/orders', authenticate, requireRole('rider', 'admin'), (req: AuthRequest, res) => {
  const orders = db.get('orders');
  const riders = db.get('riders');
  const rider = riders.find((r) => r.userId === req.user?.id || r.id === 'rdr_1');

  if (req.user?.role === 'admin') {
    return res.json(orders);
  }

  // Filter orders assigned to this rider or available to pick up
  const riderOrders = orders.filter((o) => o.riderId === rider?.id || (o.status === 'ready' && !o.riderId));
  res.json(riderOrders);
});

router.put('/rider/orders/:id/status', authenticate, requireRole('rider', 'admin'), (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['rider_assigned', 'out_for_delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status for rider workflow' });
  }

  const orders = db.get('orders');
  const orderIndex = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());
  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

  const order = orders[orderIndex];
  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'delivered') {
    order.paymentStatus = 'paid';
    if (order.riderId) {
      const riders = db.get('riders');
      const r = riders.find((rd) => rd.id === order.riderId);
      if (r) {
        r.status = 'available';
        r.completedDeliveries += 1;
        r.currentOrderId = undefined;
        db.set('riders', riders);
      }
    }
  }

  orders[orderIndex] = order;
  db.set('orders', orders);

  // Notify customer
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: order.userId,
    targetRole: 'customer',
    title: status === 'delivered' ? 'Order Delivered! 🎉 Enjoy your meal!' : 'Rider is Out for Delivery! 🛵',
    message: status === 'delivered' ? `Order #${order.id} was delivered. Rate your food now!` : `Rider ${order.riderName || 'Farhan'} has picked up your food and is on the way.`,
    type: 'order',
    read: false,
    link: `/track/${order.id}`,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.json(order);
});

// ----------------------------------------------------
// 9. CHAT (CUSTOMER <-> RIDER)
// ----------------------------------------------------

router.get('/orders/:id/messages', (req, res) => {
  const messages = db.get('messages');
  const orderMessages = messages.filter((m) => m.orderId.toLowerCase() === req.params.id.toLowerCase());
  res.json(orderMessages);
});

router.post('/orders/:id/messages', optionalAuth, (req: AuthRequest, res) => {
  const { message, senderRole, senderName } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const role = req.user?.role || senderRole || 'customer';
  const name = req.user?.name || senderName || 'Customer';
  const senderId = req.user?.id || `usr_anon_${Date.now()}`;

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    orderId: req.params.id,
    senderId,
    senderRole: role,
    senderName: name,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  const messages = db.get('messages');
  messages.push(newMessage);
  db.set('messages', messages);

  res.status(201).json(newMessage);
});

// ----------------------------------------------------
// 10. SUPPORT TICKETS
// ----------------------------------------------------

router.get('/support/tickets', authenticate, (req: AuthRequest, res) => {
  const tickets = db.get('tickets');
  if (['admin', 'support'].includes(req.user?.role || '')) {
    return res.json(tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  }
  const userTickets = tickets.filter((t) => t.userId === req.user?.id);
  res.json(userTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

router.get('/support/tickets/:id', authenticate, (req, res) => {
  const tickets = db.get('tickets');
  const ticket = tickets.find((t) => t.id.toLowerCase() === req.params.id.toLowerCase());
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

router.post('/support/tickets', authenticate, (req: AuthRequest, res) => {
  const { subject, category, message, orderId, priority } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and initial message are required' });
  }

  const ticketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTicket: SupportTicket = {
    id: ticketId,
    userId: req.user?.id || 'usr_customer_1',
    userName: req.user?.name || 'Valued Customer',
    userEmail: req.user?.email || 'customer@snackfuel.com',
    orderId: orderId || undefined,
    subject,
    category: category || 'general',
    status: 'open',
    priority: priority || 'medium',
    messages: [
      {
        id: `tmsg_${Date.now()}`,
        senderId: req.user?.id || 'usr_customer_1',
        senderRole: 'customer',
        senderName: req.user?.name || 'Customer',
        text: message,
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tickets = db.get('tickets');
  tickets.unshift(newTicket);
  db.set('tickets', tickets);

  // Notify Support Team
  const notifications = db.get('notifications');
  notifications.unshift({
    id: `notif_${Date.now()}`,
    userId: 'usr_support_1',
    targetRole: 'support',
    title: `New Support Ticket: #${ticketId}`,
    message: `${req.user?.name}: "${subject}"`,
    type: 'support',
    read: false,
    link: `/support`,
    createdAt: new Date().toISOString(),
  });
  db.set('notifications', notifications);

  res.status(201).json(newTicket);
});

router.post('/support/tickets/:id/reply', authenticate, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  const tickets = db.get('tickets');
  const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  const role = ['admin', 'support'].includes(req.user?.role || '') ? 'support' : 'customer';

  tickets[index].messages.push({
    id: `tmsg_${Date.now()}`,
    senderId: req.user?.id || 'usr_anon',
    senderRole: role,
    senderName: req.user?.name || (role === 'support' ? 'Support Agent' : 'Customer'),
    text: text.trim(),
    timestamp: new Date().toISOString(),
  });

  if (role === 'support' && tickets[index].status === 'open') {
    tickets[index].status = 'in_progress';
  }
  tickets[index].updatedAt = new Date().toISOString();

  db.set('tickets', tickets);
  res.json(tickets[index]);
});

router.put('/support/tickets/:id/status', authenticate, requireRole('admin', 'support'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const tickets = db.get('tickets');
  const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  tickets[index].status = status;
  tickets[index].updatedAt = new Date().toISOString();
  db.set('tickets', tickets);
  res.json(tickets[index]);
});

// ----------------------------------------------------
// 11. REVIEWS & RATINGS
// ----------------------------------------------------

router.get('/reviews', (_req, res) => {
  res.json(db.get('reviews'));
});

router.post('/reviews', authenticate, (req: AuthRequest, res) => {
  const { orderId, productId, rating, foodRating, deliveryRating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and review comment are required' });
  }

  const users = db.get('users');
  const user = users.find((u) => u.id === req.user?.id);

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    orderId,
    productId,
    userId: req.user?.id || 'usr_anon',
    userName: req.user?.name || 'Verified Customer',
    userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    rating: Number(rating),
    foodRating: Number(foodRating) || Number(rating),
    deliveryRating: Number(deliveryRating) || Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0],
    isVerified: true,
  };

  const reviews = db.get('reviews');
  reviews.unshift(newReview);
  db.set('reviews', reviews);

  // Update product rating if productId provided
  if (productId) {
    const products = db.get('products');
    const p = products.find((pr) => pr.id === productId);
    if (p) {
      const prodReviews = reviews.filter((r) => r.productId === productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      p.rating = Math.round(avg * 10) / 10;
      p.reviewCount = prodReviews.length;
      db.set('products', products);
    }
  }

  res.status(201).json(newReview);
});

// ----------------------------------------------------
// 12. FAVORITES
// ----------------------------------------------------

router.get('/favorites', authenticate, (req: AuthRequest, res) => {
  const favorites = db.get('favorites');
  const userFavs = favorites[req.user?.id || ''] || [];
  const products = db.get('products');
  const favProducts = products.filter((p) => userFavs.includes(p.id));
  res.json({ ids: userFavs, products: favProducts });
});

router.post('/favorites/toggle', authenticate, (req: AuthRequest, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'Product ID required' });

  const userId = req.user?.id || '';
  const favorites = db.get('favorites');
  let list = favorites[userId] || [];

  if (list.includes(productId)) {
    list = list.filter((id) => id !== productId);
  } else {
    list.push(productId);
  }

  favorites[userId] = list;
  db.set('favorites', favorites);
  res.json({ ids: list, isFavorite: list.includes(productId) });
});

// ----------------------------------------------------
// 13. ADMIN CUSTOMERS & RIDERS MANAGEMENT
// ----------------------------------------------------

router.get('/admin/users', authenticate, requireRole('admin'), (_req, res) => {
  const users = db.get('users');
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  res.json(safeUsers);
});

router.put('/admin/users/:id/toggle', authenticate, requireRole('admin'), (req, res) => {
  const users = db.get('users');
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isActive = !user.isActive;
  db.set('users', users);
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.get('/admin/riders', authenticate, requireRole('admin'), (_req, res) => {
  res.json(db.get('riders'));
});

router.post('/admin/riders', authenticate, requireRole('admin'), (req, res) => {
  const { name, phone, email, vehicle, plateNumber } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const riders = db.get('riders');
  const newRider: DeliveryRider = {
    id: `rdr_${Date.now()}`,
    name,
    phone,
    email: email || '',
    vehicle: vehicle || 'Motorcycle',
    plateNumber: plateNumber || 'LHR-2026',
    status: 'available',
    rating: 5.0,
    completedDeliveries: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  };

  riders.push(newRider);
  db.set('riders', riders);
  res.status(201).json(newRider);
});

router.put('/admin/riders/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const riders = db.get('riders');
  const index = riders.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Rider not found' });

  riders[index] = { ...riders[index], ...req.body, id };
  db.set('riders', riders);
  res.json(riders[index]);
});

router.delete('/admin/riders/:id', authenticate, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  let riders = db.get('riders');
  riders = riders.filter((r) => r.id !== id);
  db.set('riders', riders);
  res.json({ success: true });
});

// Admin Analytics / Stats
router.get('/admin/stats', authenticate, requireRole('admin'), (_req, res) => {
  const orders = db.get('orders');
  const users = db.get('users');
  const riders = db.get('riders');
  const products = db.get('products');

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
  const activeOrders = orders.filter((o) => ['rider_assigned', 'out_for_delivery'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const activeRiders = riders.filter((r) => r.status !== 'offline').length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;

  // Sales trend calculation
  const dailySales = [
    { day: 'Mon', sales: 18500, orders: 14 },
    { day: 'Tue', sales: 22400, orders: 18 },
    { day: 'Wed', sales: 19800, orders: 15 },
    { day: 'Thu', sales: 26500, orders: 21 },
    { day: 'Fri', sales: 38900, orders: 32 },
    { day: 'Sat', sales: 44200, orders: 38 },
    { day: 'Sun', sales: 41000, orders: 35 },
  ];

  res.json({
    metrics: {
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalCustomers,
      activeRiders,
      totalProducts: products.length,
    },
    dailySales,
  });
});

// ----------------------------------------------------
// 14. NOTIFICATIONS
// ----------------------------------------------------

router.get('/notifications', authenticate, (req: AuthRequest, res) => {
  const notifications = db.get('notifications');
  const userNotifs = notifications.filter(
    (n) => n.userId === req.user?.id || n.targetRole === req.user?.role
  );
  res.json(userNotifs);
});

router.put('/notifications/:id/read', authenticate, (req, res) => {
  const notifications = db.get('notifications');
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    db.set('notifications', notifications);
  }
  res.json({ success: true });
});

router.put('/notifications/read-all', authenticate, (req: AuthRequest, res) => {
  const notifications = db.get('notifications');
  notifications.forEach((n) => {
    if (n.userId === req.user?.id || n.targetRole === req.user?.role) {
      n.read = true;
    }
  });
  db.set('notifications', notifications);
  res.json({ success: true });
});

// ----------------------------------------------------
// 15. IMAGE UPLOAD HANDLER
// ----------------------------------------------------

router.post('/upload', authenticate, requireRole('admin'), (req, res) => {
  const { dataUrl, filename } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'dataUrl base64 payload required' });
  }

  try {
    // If it's a data url e.g. data:image/png;base64,...
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      // If it's already an asset path or external URL, return as is
      return res.json({ url: dataUrl });
    }

    const ext = matches[1].split('/')[1].replace('+xml', '');
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    // Also persist directly into public/images so it gets included in Git commits and Vite production builds
    try {
      const publicDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicDir, safeName), buffer);
    } catch (saveErr) {
      console.warn('Could not save to public/images:', saveErr);
    }

    const publicUrl = `/images/${safeName}`;

    res.json({ url: publicUrl, success: true, base64: dataUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save image', details: err.message });
  }
});

// ----------------------------------------------------
// 16. AI FEATURES (MAPS GROUNDING, SEARCH GROUNDING, AUDIO TRANSCRIBE)
// ----------------------------------------------------

// Google Maps Grounding with gemini-3.5-flash
router.post('/ai/maps-location', async (req, res) => {
  const { query, address } = req.body;
  const prompt = `You are the location assistant for Snack Fuel restaurant (Gulberg III, MM Alam Road, Lahore). 
Customer inquiry or location query: "${query || address || 'Where is Snack Fuel and what landmarks are nearby?'}".
Provide accurate location details, directions, nearby famous landmarks, and estimated delivery reach.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    res.json({
      text: response.text || 'Location information retrieved successfully.',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    });
  } catch (err: any) {
    console.error('Maps Grounding error:', err);
    res.status(500).json({ error: 'Failed to retrieve location details', details: err.message });
  }
});

// Google Search Grounding with gemini-3.5-flash
router.post('/ai/search-grounding', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the culinary and dietary assistant for Snack Fuel restaurant. Answer accurately using Google Search: ${prompt}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({
      text: response.text || 'Information found.',
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    });
  } catch (err: any) {
    console.error('Search Grounding error:', err);
    res.status(500).json({ error: 'Failed to perform search', details: err.message });
  }
});

// Audio Transcription with gemini-3.5-transcribe
router.post('/ai/voice-transcribe', async (req, res) => {
  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this food order accurately in the language spoken (English, Urdu, or Roman Urdu). Return only the transcribed text.' },
        ],
      },
    });

    res.json({
      text: response.text?.trim() || '',
    });
  } catch (err: any) {
    console.error('Voice Transcription error:', err);
    res.status(500).json({ error: 'Failed to transcribe audio', details: err.message });
  }
});

export default router;
