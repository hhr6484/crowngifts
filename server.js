import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============ CLOUDINARY CONFIGURATION ============
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============ CORS ============
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============ UPLOAD DIRECTORIES (for local backup) ============
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');
const categoriesDir = path.join(uploadsDir, 'categories');
const bannersDir = path.join(uploadsDir, 'banners');
const brandingDir = path.join(uploadsDir, 'branding');
const reviewsDir = path.join(uploadsDir, 'reviews');

[uploadsDir, productsDir, categoriesDir, bannersDir, brandingDir, reviewsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/uploads', express.static(uploadsDir));

// ============ CLOUDINARY STORAGE CONFIGURATIONS ============

// Product Storage - Cloudinary
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Category Storage - Cloudinary
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }]
  }
});

// Banner Storage - Cloudinary
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1600, height: 700, crop: 'limit' }]
  }
});

// Logo Storage - Cloudinary
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'branding',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ width: 200, height: 200, crop: 'limit' }]
  }
});

// Review Storage - Cloudinary
const reviewStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 100, height: 100, crop: 'limit' }]
  }
});

// Multer upload instances
const productUpload = multer({ 
  storage: productStorage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const categoryUpload = multer({ 
  storage: categoryStorage, 
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const bannerUpload = multer({ 
  storage: bannerStorage, 
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const reviewUpload = multer({
  storage: reviewStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ============ DATA STORE ============
const DB_FILE = path.join(__dirname, 'database.json');

let products = [];
let categories = [];
let banners = [];
let orders = [];
let customers = [];
let wishlist = [];
let coupons = [];
let shippingZones = [];
let taxRates = [];
let reviews = [];
let storeSettings = {
  storeName: 'Organic Store',
  storeEmail: 'contact@organicstore.com',
  storePhone: '+91 9876543210',
  storeAddress: '123 Main Street',
  storeCity: 'Mumbai',
  storeState: 'Maharashtra',
  storePincode: '400001',
  storeWebsite: 'www.organicstore.com',
  storeDescription: 'Best organic products at affordable prices.',
  storeCurrency: 'INR',
  taxRate: 10,
  shippingDefault: 99,
  freeShippingThreshold: 1000,
  logoUrl: null
};

// Default tax rates
const DEFAULT_TAX_RATES = [
  {
    id: 1,
    name: 'Standard GST',
    rate: 18,
    category: 'all',
    isActive: true,
    description: 'Standard GST rate for all products',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Essential Items',
    rate: 5,
    category: 'groceries',
    isActive: true,
    description: 'Lower tax rate for essential items',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Luxury Items',
    rate: 28,
    category: 'luxury',
    isActive: true,
    description: 'Higher tax rate for luxury items',
    createdAt: new Date().toISOString()
  }
];

// Default shipping zones
const DEFAULT_SHIPPING_ZONES = [
  {
    id: 1,
    name: 'Local Zone (Mumbai)',
    description: 'Fast delivery in Mumbai area',
    regions: 'Mumbai',
    countries: ['India'],
    states: ['Maharashtra'],
    cities: ['Mumbai', 'Thane', 'Navi Mumbai'],
    pincodes: '400001-400099,400100-400199',
    minOrderAmount: 0,
    shippingCost: 49,
    freeShippingAbove: 500,
    deliveryDays: '1-2',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Metro Cities',
    description: 'Delivery to major metro cities',
    regions: 'Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune',
    countries: ['India'],
    states: ['Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Maharashtra'],
    cities: ['Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'],
    pincodes: '110001-110099,560001-560100,600001-600100,700001-700150,500001-500100,411001-411060',
    minOrderAmount: 0,
    shippingCost: 79,
    freeShippingAbove: 1000,
    deliveryDays: '3-5',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Standard Zone (Rest of India)',
    description: 'Standard delivery across India',
    regions: 'All other cities',
    countries: ['India'],
    states: [],
    cities: [],
    pincodes: '',
    minOrderAmount: 0,
    shippingCost: 99,
    freeShippingAbove: 1000,
    deliveryDays: '5-7',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Default coupons
const DEFAULT_COUPONS = [
  {
    id: 1,
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 0,
    maxDiscount: 500,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    usageLimit: 1000,
    usedCount: 0,
    status: 'active',
    description: 'Get 20% off up to ₹500 on your first order',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    code: 'SAVE100',
    discountType: 'fixed',
    discountValue: 100,
    minOrder: 500,
    maxDiscount: 100,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    usageLimit: 500,
    usedCount: 0,
    status: 'active',
    description: 'Save ₹100 on orders above ₹500',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    code: 'FREESHIP',
    discountType: 'shipping',
    discountValue: 0,
    minOrder: 0,
    maxDiscount: 0,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    usageLimit: 1000,
    usedCount: 0,
    status: 'active',
    description: 'Free shipping on all orders',
    createdAt: new Date().toISOString()
  }
];

// API Domain for image URLs
const API_DOMAIN = process.env.API_DOMAIN || 'https://crowngifts12.onrender.com';

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      products = data.products || [];
      categories = data.categories || [];
      banners = data.banners || [];
      orders = data.orders || [];
      customers = data.customers || [];
      wishlist = data.wishlist || [];
      coupons = data.coupons || [];
      shippingZones = data.shippingZones || DEFAULT_SHIPPING_ZONES;
      taxRates = data.taxRates || DEFAULT_TAX_RATES;
      reviews = data.reviews || [];
      storeSettings = data.storeSettings || storeSettings;
      console.log(`✅ Loaded: ${products.length} products, ${categories.length} categories, ${coupons.length} coupons, ${shippingZones.length} shipping zones, ${taxRates.length} tax rates, ${reviews.length} reviews`);
    } else {
      categories = [
        { id: 1, name: 'Fruits', description: 'Fresh organic fruits', status: 'active', order: 1, image: '', createdAt: new Date().toISOString() },
        { id: 2, name: 'Vegetables', description: 'Farm fresh vegetables', status: 'active', order: 2, image: '', createdAt: new Date().toISOString() },
        { id: 3, name: 'Dairy', description: 'Fresh milk and dairy products', status: 'active', order: 3, image: '', createdAt: new Date().toISOString() }
      ];
      coupons = DEFAULT_COUPONS;
      shippingZones = DEFAULT_SHIPPING_ZONES;
      taxRates = DEFAULT_TAX_RATES;
      saveData();
      console.log('✅ Created default categories, coupons, shipping zones, and tax rates');
    }
  } catch (err) {
    console.error('Load error:', err);
  }
}

function saveData() {
  const data = { products, categories, banners, orders, customers, wishlist, coupons, shippingZones, taxRates, reviews, storeSettings };
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  console.log(`💾 Saved: ${products.length} products, ${categories.length} categories, ${coupons.length} coupons, ${shippingZones.length} zones, ${taxRates.length} tax rates, ${reviews.length} reviews`);
}

loadData();

// ============ IMAGE URL FUNCTION - Returns Cloudinary URLs ============
function getImageUrl(imgPath) {
  if (!imgPath) return null;
  // Cloudinary returns full HTTPS URLs, just return them
  if (imgPath.startsWith('http')) return imgPath;
  // Fallback for any local paths (should not happen with Cloudinary)
  if (imgPath.startsWith('/uploads')) return `${API_DOMAIN}${imgPath}`;
  return `${API_DOMAIN}/${imgPath}`;
}

// ============ TAX CALCULATION FUNCTION ============
function calculateTax(subtotal, productCategory = 'all') {
  let taxRate = storeSettings.taxRate || 10;
  const categoryTax = taxRates.find(t => t.isActive && (t.category === productCategory || t.category === 'all'));
  if (categoryTax) {
    taxRate = categoryTax.rate;
  }
  const taxAmount = (subtotal * taxRate) / 100;
  return { taxRate, taxAmount };
}

// ============ SHIPPING CALCULATION FUNCTION ============
function calculateShipping(pincode, city, state, country, cartTotal) {
  let matchedZone = null;
  
  for (const zone of shippingZones) {
    if (!zone.isActive) continue;
    if (zone.minOrderAmount > 0 && cartTotal < zone.minOrderAmount) continue;
    
    if (zone.pincodes && pincode) {
      const pincodeList = zone.pincodes.split(',').map(p => p.trim());
      for (const p of pincodeList) {
        if (p.includes('-')) {
          const [start, end] = p.split('-').map(Number);
          if (parseInt(pincode) >= start && parseInt(pincode) <= end) {
            matchedZone = zone;
            break;
          }
        } else if (p === pincode) {
          matchedZone = zone;
          break;
        }
      }
    }
    
    if (!matchedZone && zone.cities && city) {
      if (zone.cities.some(c => c.toLowerCase() === city.toLowerCase())) {
        matchedZone = zone;
      }
    }
    
    if (!matchedZone && zone.states && state) {
      if (zone.states.some(s => s.toLowerCase() === state.toLowerCase())) {
        matchedZone = zone;
      }
    }
    
    if (!matchedZone && zone.countries && country) {
      if (zone.countries.some(c => c.toLowerCase() === country.toLowerCase())) {
        matchedZone = zone;
      }
    }
    
    if (matchedZone) break;
  }
  
  if (matchedZone) {
    let shippingCost = matchedZone.shippingCost;
    let isFreeShipping = false;
    
    if (matchedZone.freeShippingAbove > 0 && cartTotal >= matchedZone.freeShippingAbove) {
      shippingCost = 0;
      isFreeShipping = true;
    }
    
    return {
      zone: matchedZone,
      shippingCost,
      isFreeShipping,
      deliveryDays: matchedZone.deliveryDays,
      freeShippingThreshold: matchedZone.freeShippingAbove
    };
  } else {
    let shippingCost = storeSettings.shippingDefault || 99;
    let isFreeShipping = false;
    
    if (storeSettings.freeShippingThreshold > 0 && cartTotal >= storeSettings.freeShippingThreshold) {
      shippingCost = 0;
      isFreeShipping = true;
    }
    
    return {
      zone: null,
      shippingCost,
      isFreeShipping,
      deliveryDays: '5-7',
      freeShippingThreshold: storeSettings.freeShippingThreshold
    };
  }
}

// ============ LOGGING ============
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ============ CLIENT APIS ============

// Get all products
app.get('/api/client/products', (req, res) => {
  const clientProducts = products.map(p => ({
    ...p,
    images: (p.images || []).map(getImageUrl),
    image: p.images?.[0] ? getImageUrl(p.images[0]) : null
  }));
  res.json(clientProducts);
});

// Get featured products
app.get('/api/client/products/featured', (req, res) => {
  const featured = products.filter(p => p.isFeatured === true);
  res.json(featured.map(p => ({ ...p, image: getImageUrl(p.images?.[0]) })));
});

// Get most popular products
app.get('/api/client/products/most-popular', (req, res) => {
  const popular = products.filter(p => p.isMostPopular === true);
  res.json(popular.map(p => ({ ...p, image: getImageUrl(p.images?.[0]) })));
});

// Get just arrived products
app.get('/api/client/products/just-arrived', (req, res) => {
  const justArrived = products.filter(p => p.isJustArrived === true);
  res.json(justArrived.map(p => ({ ...p, image: getImageUrl(p.images?.[0]) })));
});

// Get categories
app.get('/api/client/categories', (req, res) => {
  const activeCategories = categories
    .filter(c => c.status === 'active')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(c => ({
      ...c,
      image: getImageUrl(c.image),
      productCount: products.filter(p => p.category === c.name).length
    }));
  res.json(activeCategories);
});

// Get banners
app.get('/api/client/banners', (req, res) => {
  const activeBanners = banners
    .filter(b => b.active === true)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(b => ({ ...b, image: getImageUrl(b.image) }));
  res.json(activeBanners);
});

// Get single product
app.get('/api/client/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json({
      ...product,
      images: (product.images || []).map(getImageUrl),
      image: product.images?.[0] ? getImageUrl(product.images[0]) : null
    });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Get store settings
app.get('/api/client/store-settings', (req, res) => {
  res.json({ 
    ...storeSettings, 
    logoUrl: storeSettings.logoUrl ? getImageUrl(storeSettings.logoUrl) : null 
  });
});

// ============ REVIEWS API ============

// Get product reviews
app.get('/api/client/products/:productId/reviews', (req, res) => {
  const productReviews = reviews.filter(r => r.productId == req.params.productId);
  res.json(productReviews.map(r => ({ ...r, image: r.image ? getImageUrl(r.image) : null })));
});

// Add review
app.post('/api/client/products/:productId/reviews', reviewUpload.single('image'), (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) imageUrl = req.file.path; // Cloudinary URL
    
    const newReview = {
      id: Date.now(),
      productId: parseInt(req.params.productId),
      user: req.body.name || 'Anonymous',
      title: req.body.title || '',
      comment: req.body.comment,
      rating: parseInt(req.body.rating) || 5,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    saveData();
    res.status(201).json({ ...newReview, image: getImageUrl(imageUrl) });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SHIPPING ZONES API ============

app.get('/api/admin/shipping-zones', (req, res) => {
  res.json(shippingZones);
});

app.post('/api/admin/shipping-zones', (req, res) => {
  try {
    const newZone = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    shippingZones.push(newZone);
    saveData();
    res.status(201).json(newZone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/shipping-zones/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = shippingZones.findIndex(z => z.id === id);
    if (index === -1) return res.status(404).json({ error: 'Shipping zone not found' });
    shippingZones[index] = { ...shippingZones[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json(shippingZones[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/shipping-zones/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = shippingZones.findIndex(z => z.id === id);
    if (index === -1) return res.status(404).json({ error: 'Shipping zone not found' });
    shippingZones.splice(index, 1);
    saveData();
    res.json({ message: 'Shipping zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/shipping-zones/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = shippingZones.findIndex(z => z.id === id);
    if (index === -1) return res.status(404).json({ error: 'Shipping zone not found' });
    shippingZones[index].isActive = req.body.isActive;
    saveData();
    res.json(shippingZones[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/shipping-zones', (req, res) => {
  const activeZones = shippingZones.filter(z => z.isActive === true);
  res.json(activeZones);
});

app.post('/api/client/calculate-shipping', (req, res) => {
  try {
    const { pincode, city, state, country, cartTotal } = req.body;
    const result = calculateShipping(pincode, city, state, country, cartTotal);
    res.json(result);
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ TAX RATES API ============

app.get('/api/admin/tax-rates', (req, res) => {
  res.json(taxRates);
});

app.post('/api/admin/tax-rates', (req, res) => {
  try {
    const newTax = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
    taxRates.push(newTax);
    saveData();
    res.status(201).json(newTax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/tax-rates/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = taxRates.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Tax rate not found' });
    taxRates[index] = { ...taxRates[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json(taxRates[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/tax-rates/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = taxRates.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Tax rate not found' });
    taxRates.splice(index, 1);
    saveData();
    res.json({ message: 'Tax rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/tax-rates/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = taxRates.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Tax rate not found' });
    taxRates[index].isActive = req.body.isActive;
    saveData();
    res.json(taxRates[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/tax-rates', (req, res) => {
  const activeTaxes = taxRates.filter(t => t.isActive === true);
  res.json(activeTaxes);
});

app.post('/api/client/calculate-tax', (req, res) => {
  try {
    const { subtotal, category } = req.body;
    const result = calculateTax(subtotal, category);
    res.json(result);
  } catch (error) {
    console.error('Error calculating tax:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ COUPON APIS ============

app.post('/api/client/coupons/validate', (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.status === 'active');
    
    if (!coupon) return res.json({ valid: false, message: 'Invalid coupon code' });
    
    const today = new Date().toISOString().split('T')[0];
    if (coupon.validTo && coupon.validTo < today) return res.json({ valid: false, message: 'Coupon has expired' });
    if (coupon.validFrom && coupon.validFrom > today) return res.json({ valid: false, message: 'Coupon is not yet active' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.json({ valid: false, message: 'Coupon usage limit exceeded' });
    if (coupon.minOrder && cartTotal < coupon.minOrder) return res.json({ valid: false, message: `Minimum order of ₹${coupon.minOrder} required` });
    
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        description: coupon.description
      },
      discountAmount: discountAmount,
      message: 'Coupon applied successfully!'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/coupons/available', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const available = coupons.filter(c => 
    c.status === 'active' && (!c.validTo || c.validTo >= today) && (!c.validFrom || c.validFrom <= today)
  );
  res.json(available);
});

app.get('/api/admin/coupons', (req, res) => {
  res.json(coupons);
});

app.post('/api/admin/coupons', (req, res) => {
  try {
    const newCoupon = { id: Date.now(), ...req.body, usedCount: 0, createdAt: new Date().toISOString() };
    coupons.push(newCoupon);
    saveData();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/coupons/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });
    coupons[index] = { ...coupons[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json(coupons[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/coupons/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });
    coupons.splice(index, 1);
    saveData();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/coupons/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found' });
    coupons[index].status = req.body.status;
    saveData();
    res.json(coupons[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN PRODUCTS API ============

app.get('/api/admin/products', (req, res) => {
  const productsWithImages = products.map(p => ({ ...p, images: (p.images || []).map(getImageUrl) }));
  res.json(productsWithImages);
});

app.post('/api/admin/products', productUpload.array('images', 10), (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(f => f.path) : []; // Cloudinary URLs
    const newProduct = {
      id: Date.now(),
      name: req.body.name,
      price: parseFloat(req.body.price),
      comparePrice: req.body.comparePrice ? parseFloat(req.body.comparePrice) : null,
      description: req.body.description || '',
      category: req.body.category || '',
      stock: parseInt(req.body.stock) || 0,
      sku: req.body.sku || `SKU-${Date.now()}`,
      images: imageUrls,
      brand: req.body.brand || '',
      weight: req.body.weight || '',
      unit: req.body.unit || 'pcs',
      isFeatured: req.body.isFeatured === 'true',
      isMostPopular: req.body.isMostPopular === 'true',
      isJustArrived: req.body.isJustArrived === 'true',
      taxCategory: req.body.taxCategory || 'all',
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveData();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', productUpload.array('images', 10), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    let imageUrls = products[index].images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.path);
      imageUrls = [...imageUrls, ...newImages];
    }
    
    products[index] = {
      ...products[index],
      name: req.body.name || products[index].name,
      price: parseFloat(req.body.price) || products[index].price,
      comparePrice: req.body.comparePrice ? parseFloat(req.body.comparePrice) : null,
      description: req.body.description || products[index].description,
      category: req.body.category || products[index].category,
      stock: parseInt(req.body.stock) !== undefined ? parseInt(req.body.stock) : products[index].stock,
      sku: req.body.sku || products[index].sku,
      images: imageUrls,
      brand: req.body.brand || products[index].brand,
      weight: req.body.weight || products[index].weight,
      unit: req.body.unit || products[index].unit,
      isFeatured: req.body.isFeatured === 'true',
      isMostPopular: req.body.isMostPopular === 'true',
      isJustArrived: req.body.isJustArrived === 'true',
      taxCategory: req.body.taxCategory || products[index].taxCategory || 'all',
      updatedAt: new Date().toISOString()
    };
    saveData();
    res.json(products[index]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    products.splice(index, 1);
    saveData();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CATEGORIES API =====
app.get('/api/admin/categories', (req, res) => {
  const categoriesWithImages = categories.map(c => ({ ...c, image: getImageUrl(c.image) }));
  res.json(categoriesWithImages);
});

app.post('/api/admin/categories', categoryUpload.single('image'), (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) imageUrl = req.file.path; // Cloudinary URL
    
    const newCategory = {
      id: Date.now(),
      name: req.body.name,
      description: req.body.description || '',
      status: req.body.status || 'active',
      order: parseInt(req.body.order) || categories.length + 1,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    saveData();
    res.status(201).json({ ...newCategory, image: getImageUrl(imageUrl) });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/categories/:id', categoryUpload.single('image'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    
    let imageUrl = categories[index].image;
    if (req.file) imageUrl = req.file.path; // Cloudinary URL
    
    categories[index] = { 
      ...categories[index], 
      ...req.body, 
      image: imageUrl, 
      updatedAt: new Date().toISOString() 
    };
    saveData();
    res.json({ ...categories[index], image: getImageUrl(imageUrl) });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/categories/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    categories[index].status = req.body.status;
    saveData();
    res.json(categories[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/categories/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    categories.splice(index, 1);
    saveData();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== BANNERS API =====
app.get('/api/admin/banners', (req, res) => {
  const bannersWithImages = banners.map(b => ({ ...b, image: getImageUrl(b.image) }));
  res.json(bannersWithImages);
});

app.post('/api/admin/banners', bannerUpload.single('image'), (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) imageUrl = req.file.path; // Cloudinary URL
    
    const newBanner = {
      id: Date.now(),
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      buttonText: req.body.buttonText || 'Shop Now',
      buttonLink: req.body.buttonLink || '/shop',
      badge: req.body.badge || '',
      active: req.body.active === 'true',
      order: parseInt(req.body.order) || banners.length + 1,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };
    banners.push(newBanner);
    saveData();
    res.status(201).json({ ...newBanner, image: getImageUrl(imageUrl) });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/banners/:id', bannerUpload.single('image'), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Banner not found' });
    
    let imageUrl = banners[index].image;
    if (req.file) imageUrl = req.file.path; // Cloudinary URL
    
    banners[index] = { 
      ...banners[index], 
      ...req.body, 
      image: imageUrl, 
      updatedAt: new Date().toISOString() 
    };
    saveData();
    res.json({ ...banners[index], image: getImageUrl(imageUrl) });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/banners/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Banner not found' });
    banners[index].active = req.body.active;
    saveData();
    res.json(banners[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/banners/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = banners.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Banner not found' });
    banners.splice(index, 1);
    saveData();
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ORDERS API =====
app.get('/api/admin/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/client/orders', (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, items, total, subtotal, shipping, tax, discount, taxRate, couponCode, paymentMethod, orderId, paymentStatus, shippingAddress, shippingZone } = req.body;
    
    const newOrder = {
      id: orderId || ('ORD-' + Date.now()),
      orderId: orderId || ('ORD-' + Date.now()),
      customerName, customerEmail, customerPhone, address, items,
      total: parseFloat(total), subtotal: parseFloat(subtotal), shipping: parseFloat(shipping),
      tax: parseFloat(tax), taxRate: taxRate || 10, discount: parseFloat(discount || 0),
      couponCode: couponCode || null, paymentMethod, paymentStatus,
      status: 'pending', shippingAddress: shippingAddress || { address }, shippingZone: shippingZone || null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    
    orders.unshift(newOrder);
    
    if (couponCode) {
      const couponIndex = coupons.findIndex(c => c.code === couponCode);
      if (couponIndex !== -1) coupons[couponIndex].usedCount = (coupons[couponIndex].usedCount || 0) + 1;
    }
    
    const existingCustomerIndex = customers.findIndex(c => c.email === customerEmail);
    if (existingCustomerIndex !== -1) {
      customers[existingCustomerIndex].totalOrders = (customers[existingCustomerIndex].totalOrders || 0) + 1;
      customers[existingCustomerIndex].totalSpent = (customers[existingCustomerIndex].totalSpent || 0) + total;
      customers[existingCustomerIndex].lastOrder = new Date().toISOString();
    } else {
      customers.push({
        id: 'cust_' + Date.now(), name: customerName, email: customerEmail, phone: customerPhone,
        address: address, totalOrders: 1, totalSpent: total, lastOrder: new Date().toISOString(),
        joinedDate: new Date().toISOString(), status: 'active'
      });
    }
    
    saveData();
    console.log(`✅ New order created: ${newOrder.orderId} - Total: ₹${total} (Tax: ${taxRate}%, Shipping: ₹${shipping})`);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  try {
    const id = req.params.id;
    const index = orders.findIndex(o => o.id === id || o.orderId === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    orders[index].status = req.body.status;
    orders[index].updatedAt = new Date().toISOString();
    saveData();
    res.json(orders[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CUSTOMERS API =====
app.get('/api/admin/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/admin/customers', (req, res) => {
  const newCustomer = {
    id: Date.now(), name: req.body.name, email: req.body.email, phone: req.body.phone || '',
    address: req.body.address || '', city: req.body.city || '', state: req.body.state || '',
    pincode: req.body.pincode || '', totalOrders: 0, totalSpent: 0, status: 'active',
    joinedDate: new Date().toISOString()
  };
  customers.push(newCustomer);
  saveData();
  res.status(201).json(newCustomer);
});

app.put('/api/admin/customers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });
    customers[index] = { ...customers[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json(customers[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/customers/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Customer not found' });
    customers.splice(index, 1);
    saveData();
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== WISHLIST API =====
app.get('/api/admin/wishlist', (req, res) => {
  res.json(wishlist);
});

app.get('/api/client/wishlist/:userId', (req, res) => {
  const userWishlist = wishlist.filter(w => w.userId === req.params.userId);
  res.json(userWishlist);
});

app.post('/api/client/wishlist', (req, res) => {
  const { userId, productId, productName, price, image } = req.body;
  const existing = wishlist.find(w => w.userId === userId && w.productId === productId);
  if (!existing) {
    const newItem = { id: Date.now(), userId, productId, productName, price, image, addedDate: new Date().toISOString() };
    wishlist.push(newItem);
    saveData();
    res.status(201).json(newItem);
  } else {
    res.json({ message: 'Already in wishlist' });
  }
});

app.delete('/api/client/wishlist/:userId/:productId', (req, res) => {
  const index = wishlist.findIndex(w => w.userId === req.params.userId && w.productId == req.params.productId);
  if (index !== -1) {
    wishlist.splice(index, 1);
    saveData();
  }
  res.json({ message: 'Removed from wishlist' });
});

// ===== STORE SETTINGS API =====
app.get('/api/admin/store-settings', (req, res) => {
  res.json({ ...storeSettings, logoUrl: storeSettings.logoUrl ? getImageUrl(storeSettings.logoUrl) : null });
});

app.post('/api/admin/store-settings', (req, res) => {
  try {
    storeSettings = { ...storeSettings, ...req.body, updatedAt: new Date().toISOString() };
    saveData();
    res.json({ message: 'Store settings saved', config: storeSettings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== LOGO UPLOAD =====
app.post('/api/admin/upload-logo', logoUpload.single('logo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const logoUrl = req.file.path; // Cloudinary URL
    storeSettings.logoUrl = logoUrl;
    saveData();
    res.json({ logoUrl: getImageUrl(logoUrl), message: 'Logo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== STATS API =====
app.get('/api/admin/stats', (req, res) => {
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
  
  res.json({
    totalProducts: products.length,
    featuredProducts: products.filter(p => p.isFeatured).length,
    mostPopularProducts: products.filter(p => p.isMostPopular).length,
    justArrivedProducts: products.filter(p => p.isJustArrived).length,
    totalCategories: categories.length,
    totalBanners: banners.length,
    totalStock, totalValue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalWishlist: wishlist.length,
    totalCoupons: coupons.length,
    totalShippingZones: shippingZones.length,
    totalTaxRates: taxRates.length,
    totalReviews: reviews.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  });
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 Products: ${products.length}`);
  console.log(`🚚 Shipping Zones: ${shippingZones.length}`);
  console.log(`💰 Tax Rates: ${taxRates.length}`);
  console.log(`✅ Backend live at: ${API_DOMAIN}`);
  console.log(`✅ Cloudinary configured for image storage`);
  console.log(`✅ Ready to accept requests!\n`);
});

export default app;