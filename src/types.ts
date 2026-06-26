export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sizes: string[];
  colors: string[];
  category: string;
  stock: number;
  isNew?: boolean;
  isSale?: boolean;
  isFeatured?: boolean;
  images: string[]; // URLs or base64
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  shippingMethod: string;
  couponCode?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  minSpend?: number;
}

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  coverImage?: string;
  slug: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  duration: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // conversion rate against base USD
}

export interface Language {
  code: string;
  name: string;
}

export interface CMSContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    backgroundImage: string; // fallback to default CSS or loaded img
  };
  navigation: { name: string; path: string }[];
  about: {
    story: string;
    philosophy: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    instagram: string;
    facebook: string;
    pinterest: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  emailTemplates: {
    orderPlaced: string;
    orderShipped: string;
  };
}

export interface StoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  reviews: Review[];
  blogPosts: BlogPost[];
  shippingMethods: ShippingMethod[];
  cms: CMSContent;
  currencies: Currency[];
  languages: Language[];
  activeCurrency: string;
  activeLanguage: string;
}
