import React, { useState, useEffect } from "react";
import {
  StoreState,
  Product,
  Category,
  Order,
  Coupon,
  Review,
  BlogPost,
  CMSContent,
  OrderItem,
} from "./types";
import {
  Heart,
  ShoppingBag,
  User,
  Search,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  X,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Star,
  MapPin,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Sliders,
  Send,
  Eye,
  Menu,
  Image as ImageIcon,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "./components/ProductCard";
import Hero from "./components/Hero";
import AdminPanel from "./components/AdminPanel";
import { translations } from "./translations";

// Utility to generate random client reviews
const INITIAL_REVIEWS = [
  { rating: 5, author: "Julien V.", comment: "The structure of the trench is incredibly sharp. Unbelievable luxury feel." },
  { rating: 5, author: "Sophia K.", comment: "Superb Mongolian Cashmere knitwear. Soft, thick, and perfectly tailored." },
  { rating: 5, author: "Marcus L.", comment: "Monza Luxe is the only contemporary label executing tailoring at this premium tier." }
];

export default function App() {
  const [state, setState] = useState<StoreState | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme state (Dark Mode by default to preserve stunning dark luxury aesthetic, switchable to Light)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("monza_dark_mode");
    return saved !== null ? saved === "true" : true;
  });

  // Sync class on document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Sync HTML direction attribute for RTL language support (Arabic)
  useEffect(() => {
    const activeLang = state?.activeLanguage || "EN";
    if (activeLang === "AR") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, [state?.activeLanguage]);

  // App Routing (home, shop, blog, contact, about, faq, cart, checkout, account, details, tracking)
  const [currentRoute, setCurrentRoute] = useState<string>("home");
  
  // Selected single entities
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Search & Filter state
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("default");
  const [sizeFilter, setSizeFilter] = useState<string>("All");
  const [colorFilter, setColorFilter] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  // Shopping States
  const [cart, setCart] = useState<{ product: Product; quantity: number; size: string; color: string }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Modals & Panels
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selection configurations for Active Items
  const [activeSize, setActiveSize] = useState("");
  const [activeColor, setActiveColor] = useState("");
  const [activeQty, setActiveQty] = useState(1);

  // Customer Account Simulation
  const [userAccount, setUserAccount] = useState<{ name: string; email: string; isRegistered: boolean } | null>(null);
  const [loginForm, setLoginForm] = useState({ name: "", email: "" });

  // Newsletter & Contact Form States
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Brand Review Input State
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch full store configuration and items from custom Express server
  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch("/api/store");
        const data = await res.json();
        setState(data);
      } catch (err) {
        console.error("Failed to connect to fullstack express api, retrying...", err);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, []);

  // Save Recently Viewed & Cart to local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("monza_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const savedWish = localStorage.getItem("monza_wishlist");
    if (savedWish) {
      try { setWishlist(JSON.parse(savedWish)); } catch (e) {}
    }
    const savedUser = localStorage.getItem("monza_user");
    if (savedUser) {
      try { setUserAccount(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  const saveCartToLocalStorage = (newCart: typeof cart) => {
    setCart(newCart);
    localStorage.setItem("monza_cart", JSON.stringify(newCart));
  };

  const saveWishlistToLocalStorage = (newWish: typeof wishlist) => {
    setWishlist(newWish);
    localStorage.setItem("monza_wishlist", JSON.stringify(newWish));
  };

  // Quick View triggering helper
  const handleQuickView = (prod: Product) => {
    setQuickViewProduct(prod);
    setActiveSize(prod.sizes[0] || "M");
    setActiveColor(prod.colors[0] || "Neutral");
    setActiveQty(1);
  };

  // Add Product to Cart with specifications
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    if (product.stock === 0) return;
    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.size === size &&
        item.color === color
    );

    let updated = [...cart];
    if (existingIdx > -1) {
      updated[existingIdx].quantity += qty;
    } else {
      updated.push({ product, quantity: qty, size, color });
    }

    saveCartToLocalStorage(updated);
    setIsCartOpen(true);
  };

  // Quick direct add from card
  const handleAddToCartDirect = (product: Product) => {
    if (product.stock === 0) return;
    handleAddToCart(product, product.sizes[0] || "M", product.colors[0] || "Midnight");
  };

  // Toggle Item in Wishlist
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = wishlist.filter((item) => item.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    saveWishlistToLocalStorage(updated);
  };

  // Currency conversions
  const getCurrencySymbol = () => {
    if (!state) return "$";
    return state.currencies.find((c) => c.code === state.activeCurrency)?.symbol || "$";
  };

  const getCurrencyRate = () => {
    if (!state) return 1;
    return state.currencies.find((c) => c.code === state.activeCurrency)?.rate || 1;
  };

  const convertPrice = (priceInUSD: number) => {
    return Math.round(priceInUSD * getCurrencyRate());
  };

  // Search, sorting, filtering product logic
  const getFilteredProducts = () => {
    if (!state) return [];
    return state.products
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch =
          p.title.toLowerCase().includes(searchText.toLowerCase()) ||
          p.description.toLowerCase().includes(searchText.toLowerCase()) ||
          p.category.toLowerCase().includes(searchText.toLowerCase());
        const matchesSize = sizeFilter === "All" || p.sizes.includes(sizeFilter);
        const matchesColor = colorFilter === "All" || p.colors.includes(colorFilter);
        const matchesPrice = p.price <= maxPrice;
        return matchesCategory && matchesSearch && matchesSize && matchesColor && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "newest") return a.isNew ? -1 : 1;
        return 0; // Default sorting
      });
  };

  // Apply Coupon code logic
  const handleApplyCoupon = () => {
    if (!state) return;
    const match = state.coupons.find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase() && c.active
    );
    if (match) {
      const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      if (match.minSpend && subtotal < match.minSpend) {
        alert(`Minimum spend of $${match.minSpend} required for this coupon.`);
      } else {
        setAppliedCoupon(match);
      }
    } else {
      alert("Invalid or expired coupon code.");
    }
    setCouponInput("");
  };

  // Simulated Account login / registration
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name && loginForm.email) {
      const user = { name: loginForm.name, email: loginForm.email, isRegistered: true };
      setUserAccount(user);
      localStorage.setItem("monza_user", JSON.stringify(user));
      setLoginForm({ name: "", email: "" });
    }
  };

  // Submit Order logic
  const [shippingAddress, setShippingAddress] = useState({
    line: "",
    city: "",
    postal: "",
    country: "United States",
  });
  const [activeShippingId, setActiveShippingId] = useState("ship-1");

  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<Order | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        discount = subtotal * (appliedCoupon.value / 100);
      } else {
        discount = appliedCoupon.value;
      }
    }
    const shippingPrice = state.shippingMethods.find((s) => s.id === activeShippingId)?.price || 0;
    const totalOrderValue = Math.max(0, subtotal - discount) + shippingPrice;

    const itemsPayload: OrderItem[] = cart.map((i) => ({
      productId: i.product.id,
      title: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
      selectedSize: i.size,
      selectedColor: i.color,
    }));

    const orderPayload = {
      customerName: userAccount?.name || "Guest Patron",
      email: userAccount?.email || "guest@example.com",
      items: itemsPayload,
      total: totalOrderValue,
      shippingAddress: {
        addressLine: shippingAddress.line,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal,
        country: shippingAddress.country,
      },
      paymentMethod: "Premium Card Invoicing",
      shippingMethod: state.shippingMethods.find((s) => s.id === activeShippingId)?.name || "Standard",
      couponCode: appliedCoupon?.code || undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        setCheckoutSuccessOrder(data.order);
        // Reload Store state to update stocks
        const storeRes = await fetch("/api/store");
        const freshStore = await storeRes.json();
        setState(freshStore);

        // Clear Cart
        saveCartToLocalStorage([]);
        setAppliedCoupon(null);
        setShippingAddress({ line: "", city: "", postal: "", country: "United States" });
        setCurrentRoute("thank-you");
      } else {
        alert(data.error || "Order failed to process");
      }
    } catch (err) {
      console.error(err);
      alert("Operational checkout error");
    }
  };

  // Search Tracking Order
  const handleOrderTracking = () => {
    if (!state || !trackingOrderId) return;
    const match = state.orders.find((o) => o.id.toLowerCase() === trackingOrderId.trim().toLowerCase());
    if (match) {
      setTrackedOrder(match);
    } else {
      setTrackedOrder(null);
      alert("Order ID not found. Ensure correct tracking format (e.g., ORD-9824).");
    }
  };

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !selectedProduct) return;

    const payload = {
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      customerName: reviewForm.name || "Anonymous Patron",
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setReviewForm({ name: "", rating: 5, comment: "" });
        // Reload State to show reviews
        const storeRes = await fetch("/api/store");
        const freshStore = await storeRes.json();
        setState(freshStore);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Loading Screen
  if (loading || !state) {
    return (
      <div className="w-full h-screen bg-navy-900 flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 border-3 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-display text-base uppercase tracking-[0.2em] animate-pulse">
          MONZA LUXE ATELIER
        </span>
      </div>
    );
  }

  const { cms, currencies, languages, activeCurrency, activeLanguage } = state;

  const t = translations[activeLanguage] || translations.EN;

  const getCategoryName = (name: string) => {
    if (name === "Coats & Jackets" || name === "Coats and Jackets") return t.categoryCoats;
    if (name === "Cashmere Knitwear") return t.categoryCashmere;
    if (name === "Tailored Trousers") return t.categoryTrousers;
    return name;
  };

  const currencySymbol = getCurrencySymbol();
  const currencyRate = getCurrencyRate();

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartSubtotalConverted = convertPrice(cartSubtotal);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      cartDiscount = cartSubtotal * (appliedCoupon.value / 100);
    } else {
      cartDiscount = appliedCoupon.value;
    }
  }
  const cartDiscountConverted = convertPrice(cartDiscount);

  const cartShippingPrice = state.shippingMethods.find((s) => s.id === activeShippingId)?.price || 0;
  const cartShippingPriceConverted = convertPrice(cartShippingPrice);

  const cartTotalConverted = Math.max(0, cartSubtotalConverted - cartDiscountConverted) + cartShippingPriceConverted;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? "bg-[#0A163B] text-white" : "bg-[#F8FAFC] text-navy-800"}`}>
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 left-0 right-0 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto glass-milk rounded-full px-6 py-3.5 flex items-center justify-between shadow-lg border border-white/15 light:border-navy-800/10 transition-colors duration-500">
          {/* Logo */}
          <button
            onClick={() => {
              setCurrentRoute("home");
              setSelectedProduct(null);
              setSelectedBlog(null);
            }}
            className="relative flex items-center h-10 cursor-pointer text-current hover:opacity-90 transition-opacity select-none px-2"
            id="brand-logo-btn"
          >
            {/* MONZA wordmark in high-contrast luxury serif */}
            <span className="font-logo-serif text-xl md:text-2xl font-black uppercase tracking-[0.05em] leading-none text-current select-none">
              MONZA
            </span>
            {/* Overlapping luxe signature */}
            <span className={`absolute -bottom-1 left-7 font-logo-script text-2xl md:text-3xl font-medium transform -rotate-[12deg] select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isDarkMode ? "text-accent-blue/90" : "text-accent-blue"}`}>
              luxe
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-display uppercase tracking-widest font-semibold text-current">
            {cms.navigation.map((nav, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (nav.path === "/shop") {
                    setSelectedCategory("All");
                    setCurrentRoute("shop");
                  } else if (nav.path === "/about") {
                    setCurrentRoute("about");
                  } else if (nav.path === "/blog") {
                    setCurrentRoute("blog");
                  } else if (nav.path === "/contact") {
                    setCurrentRoute("contact");
                  }
                  setSelectedProduct(null);
                  setSelectedBlog(null);
                }}
                className="hover:text-accent-blue transition-colors cursor-pointer relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:w-0 after:h-[1px] after:bg-accent-blue hover:after:w-full hover:after:left-0 after:transition-all after:duration-300"
                id={`nav-${idx}`}
              >
                {nav.path === "/shop" ? t.navCollection :
                 nav.path === "/about" ? t.navAboutUs :
                 nav.path === "/blog" ? t.navBlog :
                 nav.path === "/contact" ? t.navContact : nav.name}
              </button>
            ))}
            <button
              onClick={() => setCurrentRoute("faq")}
              className="hover:text-accent-blue transition-colors cursor-pointer"
            >
              {t.navFAQ}
            </button>
            <button
              onClick={() => setCurrentRoute("tracking")}
              className="hover:text-accent-blue transition-colors cursor-pointer opacity-60 hover:opacity-100"
            >
              {t.navTracking}
            </button>
          </nav>

          {/* Utility Right Bar */}
          <div className="flex items-center gap-4 text-white">
            {/* Currency Selector */}
            <div className="relative group flex items-center gap-1.5 cursor-pointer py-1">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                {activeCurrency}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-white/95 backdrop-blur-md border border-neutral-100 rounded-xl shadow-xl p-2 flex flex-col min-w-[80px]">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={async () => {
                        const updated = { ...state, activeCurrency: curr.code };
                        setState(updated);
                        await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ activeCurrency: curr.code }),
                        });
                      }}
                      className="text-left px-2 py-1.5 text-[10px] font-mono hover:bg-neutral-50 rounded-md transition-colors"
                    >
                      {curr.code} ({curr.symbol})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative group flex items-center gap-1 cursor-pointer py-1 hidden sm:flex">
              <span className="text-[10px] font-semibold font-mono uppercase text-neutral-400">
                {activeLanguage}
              </span>
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-white/95 backdrop-blur-md border border-neutral-100 rounded-xl shadow-xl p-2 flex flex-col min-w-[100px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        const updated = { ...state, activeLanguage: lang.code };
                        setState(updated);
                        await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ activeLanguage: lang.code }),
                        });
                      }}
                      className="text-left px-2 py-1.5 text-[10px] font-semibold hover:bg-neutral-50 rounded-md transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <span className="w-[1px] h-4 bg-neutral-300 hidden sm:inline" />

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 hover:text-accent-blue transition-all duration-300 rounded-full cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-navy-800/5 flex items-center justify-center"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              id="theme-mode-toggle-btn"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-navy-800" />
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={() => setCurrentRoute("wishlist")}
              className="relative p-1 hover:text-accent-blue transition-colors cursor-pointer"
              id="header-wishlist-btn"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-accent-blue text-white text-[8px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 hover:text-accent-blue transition-colors cursor-pointer"
              id="header-cart-btn"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-accent-blue text-white text-[8px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Account / Admin Panel */}
            <button
              onClick={() => setCurrentRoute("account")}
              className="p-1 hover:text-accent-blue transition-colors cursor-pointer"
              id="header-account-btn"
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </button>

            {/* CMS Operations Toggle */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 rounded-full bg-navy-800 hover:bg-accent-blue text-white text-[9px] font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-1 cursor-pointer"
              id="open-cms-btn"
            >
              <Sliders className="w-3 h-3" />
              <span>Admin CMS</span>
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1 hover:text-accent-blue transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-24 left-4 right-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-100 shadow-2xl p-6 space-y-4 text-xs font-display uppercase tracking-widest font-semibold text-navy-800"
          >
             {cms.navigation.map((nav, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (nav.path === "/shop") {
                    setSelectedCategory("All");
                    setCurrentRoute("shop");
                  } else if (nav.path === "/about") {
                    setCurrentRoute("about");
                  } else if (nav.path === "/blog") {
                    setCurrentRoute("blog");
                  } else if (nav.path === "/contact") {
                    setCurrentRoute("contact");
                  }
                  setIsMobileMenuOpen(false);
                  setSelectedProduct(null);
                  setSelectedBlog(null);
                }}
                className="block w-full text-left py-2 hover:text-accent-blue border-b border-neutral-50"
              >
                {nav.path === "/shop" ? t.navCollection :
                 nav.path === "/about" ? t.navAboutUs :
                 nav.path === "/blog" ? t.navBlog :
                 nav.path === "/contact" ? t.navContact : nav.name}
              </button>
            ))}
            <button
              onClick={() => {
                setCurrentRoute("faq");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-accent-blue border-b border-neutral-50"
            >
              {t.navFAQ}
            </button>
            <button
              onClick={() => {
                setCurrentRoute("tracking");
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-accent-blue"
            >
              {t.navTracking}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN WORKSPACE ROUTING */}
      <main className="flex-1 flex flex-col">
        {/* VIEW: HOME PAGE */}
        {currentRoute === "home" && (
          <div className="flex-1 flex flex-col">
            {/* Cinematic Hero Header Component */}
            <Hero
              cms={cms}
              t={t}
              isDarkMode={isDarkMode}
              onCtaClick={() => {
                setSelectedCategory("All");
                setCurrentRoute("shop");
              }}
            />

            {/* Seamless Brand Showcase & Story Section */}
            <section className={`relative w-full py-24 px-4 overflow-hidden border-y transition-colors duration-500 ${isDarkMode ? "border-white/5 bg-[#0A163B]" : "border-neutral-200 bg-[#F8FAFC]"}`}>
              {/* Parallax background image matching the uploaded asset */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isDarkMode ? "opacity-40 mix-blend-luminosity" : "opacity-10"} scale-105 pointer-events-none`}
                style={{ 
                  backgroundImage: `url('/src/assets/images/monza_tees_bg_1782496197645.jpg')`,
                  backgroundAttachment: 'fixed'
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-500 ${isDarkMode ? "from-[#0A163B] via-[#0A163B]/90 to-[#0A163B]" : "from-[#F8FAFC] via-[#F8FAFC]/90 to-[#F8FAFC]"}`} />

              <div className="relative z-10 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="glass-card rounded-[40px] p-8 md:p-16 text-center space-y-8 shadow-2xl"
                >
                  {/* Visual Brand Logo Overlay mimicking the uploaded design */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`relative w-72 h-44 rounded-[32px] border flex flex-col items-center justify-center select-none shadow-2xl p-6 overflow-hidden transition-all duration-500 ${isDarkMode ? "bg-white/10 border-white/15" : "bg-navy-800/5 border-navy-800/10"}`}>
                      {/* MONZA */}
                      <span className={`font-logo-serif text-5xl md:text-6xl font-black uppercase tracking-[0.05em] leading-none select-none block transition-colors duration-500 ${isDarkMode ? "text-white" : "text-navy-800"}`}>
                        MONZA
                      </span>
                      {/* Overlapping luxe */}
                      <span className={`absolute bottom-6 font-logo-script text-6.5xl md:text-7xl font-medium transform -rotate-[10deg] select-none pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-colors duration-500 ${isDarkMode ? "text-white" : "text-accent-blue"}`}>
                        luxe
                      </span>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-accent-blue uppercase block">
                        {t.showcaseSubtitle}
                      </span>
                      <h3 className={`text-xs font-mono tracking-[0.25em] uppercase transition-colors duration-500 ${isDarkMode ? "text-white/50" : "text-navy-800/50"}`}>
                        {t.showcaseBrandProject}
                      </h3>
                    </div>
                  </div>

                  <hr className={`w-16 mx-auto transition-colors duration-500 ${isDarkMode ? "border-white/15" : "border-navy-800/15"}`} />

                  <div className="space-y-4">
                    <h2 className={`font-display text-4xl md:text-5xl font-extrabold tracking-[-0.03em] uppercase leading-none transition-colors duration-500 ${isDarkMode ? "text-white" : "text-navy-800"}`}>
                      {t.showcaseTitle}
                    </h2>
                  </div>

                  <p className={`font-sans text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto text-justify md:text-center transition-colors duration-500 ${isDarkMode ? "text-white/80" : "text-navy-800/80"}`}>
                    "{t.showcaseStory}"
                  </p>

                  <div className="pt-6">
                    <span className={`inline-block text-[11px] font-mono font-bold tracking-[0.5em] uppercase animate-pulse transition-colors duration-500 ${isDarkMode ? "text-white/40" : "text-navy-800/40"}`}>
                      {t.showcaseComingSoon}
                    </span>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Luxurious Banners Carousel Grid */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
              <div className="text-center mb-16 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                  Fine Tailoring Divisions
                </span>
                <h2 className="font-display text-2xl md:text-4xl font-semibold tracking-wide text-navy-800 uppercase">
                  Explore Categories
                </h2>
                <p className="text-sm font-light text-neutral-500 max-w-xl mx-auto">
                  Deconstructed designs built using fine biological cotton, cashmere, and high-twist wool blends.
                </p>
              </div>

              {/* Grid bento layout of Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.categories.slice(0, 3).map((cat, i) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentRoute("shop");
                    }}
                    className="group relative h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-neutral-200/50 bg-gradient-to-tr from-neutral-50 to-neutral-100"
                  >
                    {/* Visual fashion background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-navy-800/10 via-transparent to-navy-800/80 group-hover:to-navy-800/90 transition-all duration-300 z-10" />
                    
                    {/* Hanger icon vector decoration */}
                    <div className="absolute inset-0 flex items-center justify-center text-navy-800/[0.02] text-[180px] font-bold select-none select-none">
                      M
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 z-20 text-white space-y-1">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-white/70">
                        Category Silhouette {i + 1}
                      </span>
                      <h3 className="font-display text-lg font-bold uppercase tracking-wider">
                        {getCategoryName(cat.name)}
                      </h3>
                      <p className="text-[11px] font-light text-white/80 line-clamp-1">
                        {cat.description || "Refined tailored collections."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED SILHOUETTES */}
            <section className="py-20 px-6 md:px-12 bg-[#F1F5F9]/50 w-full border-y border-neutral-100">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                      The Editorial Edit
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-navy-800 uppercase">
                      Featured Silhouettes
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setCurrentRoute("shop");
                    }}
                    className="group flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-widest text-navy-800 hover:text-accent-blue transition-colors cursor-pointer"
                  >
                    <span>View Full Edit</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Grid of featured products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {state.products
                    .filter((p) => p.isFeatured)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currencySymbol={currencySymbol}
                        currencyRate={currencyRate}
                        isWishlisted={wishlist.some((item) => item.id === product.id)}
                        onQuickView={handleQuickView}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCartDirect={handleAddToCartDirect}
                        activeLanguage={activeLanguage}
                      />
                    ))}
                </div>
              </div>
            </section>

            {/* CLIENT TESTIMONIALS & REVIEWS SECTION */}
            <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full text-center space-y-12">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                  Boutique Feedback
                </span>
                <h2 className="font-display text-2xl font-semibold uppercase tracking-wider text-navy-800">
                  Client Reflections
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(state.reviews.filter(r => r.approved).length > 0 
                  ? state.reviews.filter(r => r.approved).slice(0, 3) 
                  : INITIAL_REVIEWS
                ).map((rev, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-xs text-center flex flex-col justify-between"
                  >
                    <div className="flex justify-center text-amber-400 mb-3 text-sm">
                      {Array.from({ length: 5 }).map((_, stIdx) => (
                        <span key={stIdx}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-600 italic leading-relaxed mb-4">
                      "{'comment' in rev ? rev.comment : rev.comment}"
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-navy-800 font-semibold block">
                      - {'customerName' in rev ? rev.customerName : (rev as any).author}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* INSTAGRAM EDITORIALS GRID */}
            <section className="py-20 px-6 md:px-12 bg-white border-t border-neutral-100 w-full">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                    Social Diary
                  </span>
                  <h2 className="font-display text-2xl font-semibold uppercase tracking-wider text-navy-800">
                    Instagram Editorial Grid
                  </h2>
                  <p className="text-xs text-neutral-400 font-semibold font-mono">
                    @{cms.contact.instagram || "monzaluxe"}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100"
                    >
                      {/* Stylized placeholder simulating luxurious Instagram images */}
                      <div className="absolute inset-0 bg-navy-900/10 group-hover:bg-navy-900/60 transition-all duration-300 flex items-center justify-center text-white/0 group-hover:text-white/90 z-10 select-none">
                        <span className="text-xs uppercase tracking-widest font-mono">VIEW JOURNAL</span>
                      </div>
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-neutral-300">
                        <span className="text-[10px] font-mono tracking-widest uppercase mb-1">MONZA luxe</span>
                        <span className="text-[8px] text-neutral-400">EPISODE {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* NEWSLETTER SECTION */}
            <section className="py-24 px-6 md:px-12 bg-navy-800 text-white text-center w-full relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-blue/10 blur-[100px] pointer-events-none" />
              <div className="max-w-xl mx-auto space-y-6 relative z-10">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 font-bold block">
                  Atelier Updates
                </span>
                <h2 className="font-display text-3xl font-semibold uppercase tracking-wider">
                  Subscribe to the Journal
                </h2>
                <p className="text-xs text-white/70 font-light leading-relaxed max-w-md mx-auto">
                  Receive micro-edition catalog warnings, silent collection launches, and direct artisan journals.
                </p>
                {!newsletterSubscribed ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail) {
                        setNewsletterSubscribed(true);
                        setNewsletterEmail("");
                      }
                    }}
                    className="flex gap-2 max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter concierge email..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="px-4 py-3 rounded-full text-navy-800 bg-white/95 text-xs w-full focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-accent-blue text-white rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-navy-900 transition-colors cursor-pointer"
                    >
                      Join
                    </button>
                  </form>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-accent-blue tracking-wide animate-pulse">
                    Thank you. You have been added to our private ledger.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: SHOP PAGE */}
        {currentRoute === "shop" && (
          <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar filter controls */}
              <aside className="w-full lg:w-64 shrink-0 space-y-8 text-xs text-navy-800">
                <div className="flex items-center justify-between pb-4 border-b">
                  <span className="font-display text-sm font-bold uppercase tracking-wider">
                    Filters Catalog
                  </span>
                  <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                </div>

                {/* Categories */}
                <div className="space-y-2.5">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                    Division Categories
                  </h4>
                  <div className="flex flex-col gap-1.5 font-medium">
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className={`text-left hover:text-accent-blue transition-colors cursor-pointer ${
                        selectedCategory === "All" ? "text-accent-blue font-bold" : ""
                      }`}
                    >
                      {t.shopAll}
                    </button>
                    {state.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.name)}
                        className={`text-left hover:text-accent-blue transition-colors cursor-pointer ${
                          selectedCategory === btoa(c.name) || selectedCategory === c.name
                            ? "text-accent-blue font-bold"
                            : ""
                        }`}
                      >
                        {getCategoryName(c.name)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-2.5">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                    Filter Sizes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "S", "M", "L", "XL"].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSizeFilter(sz)}
                        className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                          sizeFilter === sz
                            ? "bg-navy-800 text-white border-navy-800 shadow-sm"
                            : "bg-white text-navy-800 hover:border-neutral-400"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="space-y-2.5">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                    Filter Colors
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Midnight Blue", "Sand Beige", "Obsidian Black", "Oatmeal Heather", "Off-White"].map(
                      (col) => (
                        <button
                          key={col}
                          onClick={() => setColorFilter(col)}
                          className={`px-3 py-1.5 rounded-lg border font-medium text-[10px] transition-all cursor-pointer ${
                            colorFilter === col
                              ? "bg-navy-800 text-white border-navy-800 shadow-sm"
                              : "bg-white text-navy-800 hover:border-neutral-400"
                          }`}
                        >
                          {col}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Price bounds */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                      Price Range
                    </h4>
                    <span className="font-bold font-mono">
                      {currencySymbol}
                      {convertPrice(maxPrice).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="20"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-accent-blue cursor-pointer"
                  />
                </div>
              </aside>

              {/* Product grid and headers */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                  <div>
                    <h1 className="font-display text-xl font-bold uppercase tracking-wider text-navy-800">
                      {activeLanguage === "AR" ? `قسم المجموعة: ${getCategoryName(selectedCategory)}` :
                       activeLanguage === "FR" ? `Division de collection : ${getCategoryName(selectedCategory)}` :
                       activeLanguage === "IT" ? `Divisione collezione: ${getCategoryName(selectedCategory)}` :
                       `Collection division: ${getCategoryName(selectedCategory)}`}
                    </h1>
                    <span className="text-[10px] text-neutral-400">
                      {activeLanguage === "AR" ? `عرض ${getFilteredProducts().length} نتائج فاخرة` :
                       activeLanguage === "FR" ? `Affichage de ${getFilteredProducts().length} résultats de luxe` :
                       activeLanguage === "IT" ? `Visualizzazione di ${getFilteredProducts().length} risultati di lusso` :
                       `Showing ${getFilteredProducts().length} luxury results`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-800">
                    <span className="text-neutral-400">{t.shopSortByPrice}:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3.5 py-1.5 rounded-xl border bg-white focus:outline-none"
                    >
                      <option value="default">{activeLanguage === "AR" ? "الكتالوج الافتراضي" : activeLanguage === "FR" ? "Catalogue par défaut" : activeLanguage === "IT" ? "Catalogo predefinito" : "Default Catalog"}</option>
                      <option value="price-low">{t.shopPriceLowHigh}</option>
                      <option value="price-high">{t.shopPriceHighLow}</option>
                      <option value="newest">{activeLanguage === "AR" ? "الإصدارات الجديدة أولاً" : activeLanguage === "FR" ? "Nouveautés d'abord" : activeLanguage === "IT" ? "Nuove uscite prima" : "New Releases First"}</option>
                    </select>
                  </div>
                </div>

                {/* Table of items */}
                {getFilteredProducts().length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredProducts().map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currencySymbol={currencySymbol}
                        currencyRate={currencyRate}
                        isWishlisted={wishlist.some((item) => item.id === product.id)}
                        onQuickView={handleQuickView}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCartDirect={handleAddToCartDirect}
                        activeLanguage={activeLanguage}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center max-w-sm mx-auto space-y-3">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                      Empty Segment
                    </span>
                    <p className="text-xs text-neutral-500">
                      No matching high-end silhouettes fit your precise filter. Reset parameters or explore another division.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSizeFilter("All");
                        setColorFilter("All");
                        setMaxPrice(1000);
                        setSearchText("");
                      }}
                      className="px-5 py-2.5 bg-navy-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ABOUT US */}
        {currentRoute === "about" && (
          <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto text-xs text-navy-800 space-y-12 leading-relaxed">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                Who We Are
              </span>
              <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
                Our Story
              </h1>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm font-light leading-relaxed">
                {cms.about.story ||
                  "MONZA Luxe represents a conscious retreat toward craftsmanship, tactile weight, and structured elegance. Founded in Paris, we develop incremental micro-runs of classic high-fashion designs, resisting traditional seasonal grids."}
              </p>
              
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/50 space-y-3 my-8">
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent-blue font-bold">
                  Design Manifesto
                </span>
                <p className="font-serif italic text-neutral-700">
                  {cms.about.philosophy ||
                    "We reject visual noise. The premium character of a MONZA Luxe garment is conveyed purely through the sculptural depth of its pleats, the substantial weight of its weave, and its refined monochromatic palette."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="font-bold">Tailored Micro-Runs</span>
                  <p className="text-neutral-500 mt-1">Our items are crafted in small editions to prevent fabric waist and ensure artisan oversight.</p>
                </div>
                <div>
                  <span className="font-bold">Premium Materials</span>
                  <p className="text-neutral-500 mt-1">Fine Mongolian cashmere, Egyptian cotton blends, and durable Italian wool fibers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: JOURNAL / BLOG */}
        {currentRoute === "blog" && (
          <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1 space-y-12">
            {!selectedBlog ? (
              <>
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                    Atelier Narrative
                  </span>
                  <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-navy-800">
                    The MONZA Journal
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {state.blogPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedBlog(post)}
                      className="group cursor-pointer rounded-2xl border border-neutral-200/50 bg-white/50 backdrop-blur-md overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-[16/10] bg-neutral-100 flex items-center justify-center border-b overflow-hidden">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                            Journal Cover Image
                          </span>
                        )}
                      </div>
                      <div className="p-6 space-y-3 text-xs text-navy-800">
                        <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider block">
                          {post.date} · {post.author}
                        </span>
                        <h2 className="font-display text-base font-bold uppercase tracking-wide group-hover:text-accent-blue transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-neutral-500 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* INDIVIDUAL BLOG POST VIEW */
              <div className="max-w-2xl mx-auto space-y-8 text-xs text-navy-800 leading-relaxed">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="flex items-center gap-1 hover:text-accent-blue transition-colors uppercase font-mono font-bold text-[10px] tracking-widest cursor-pointer"
                >
                  ← Back to Journal
                </button>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                    {selectedBlog.date} · {selectedBlog.author}
                  </span>
                  <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wider">
                    {selectedBlog.title}
                  </h1>
                </div>

                {selectedBlog.coverImage && (
                  <div className="aspect-[16/9] bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    <img src={selectedBlog.coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Render HTML content safely */}
                <div
                  className="space-y-4 text-sm font-light font-sans text-neutral-700 leading-relaxed prose"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW: CONTACT */}
        {currentRoute === "contact" && (
          <div className="py-16 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Contact Information */}
              <div className="space-y-6 text-xs text-navy-800">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                    Private Consultations
                  </span>
                  <h1 className="font-display text-3xl font-bold uppercase tracking-wider">
                    Store Inquiries
                  </h1>
                </div>
                <p className="text-neutral-500 leading-relaxed max-w-sm">
                  Our private concierge responds to fit measurements, tailor customizations, and dispatch logs.
                </p>

                <div className="space-y-4 pt-6 border-t font-semibold">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-accent-blue" />
                    <span>{cms.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-accent-blue" />
                    <span>{cms.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-accent-blue shrink-0" />
                    <span className="font-light">{cms.contact.address}</span>
                  </div>
                </div>
              </div>

              {/* Form submit */}
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs">
                {!contactSuccess ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (contactForm.name && contactForm.email && contactForm.msg) {
                        setContactSuccess(true);
                        setContactForm({ name: "", email: "", msg: "" });
                      }
                    }}
                    className="space-y-4 text-xs text-navy-800"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="px-3 py-2 bg-neutral-50 rounded-lg border focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="px-3 py-2 bg-neutral-50 rounded-lg border focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
                        Inquiry Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={contactForm.msg}
                        onChange={(e) => setContactForm({ ...contactForm, msg: e.target.value })}
                        className="px-3 py-2 bg-neutral-50 rounded-lg border focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-navy-800 text-white rounded-full font-bold uppercase tracking-wider hover:bg-accent-blue transition-colors cursor-pointer"
                    >
                      Send Message
                    </button>
                  </form>
                ) : (
                  <div className="p-6 text-center space-y-3 animate-pulse">
                    <Check className="w-10 h-10 text-emerald-500 mx-auto" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 block">
                      Dispatch Successful
                    </span>
                    <p className="text-xs text-neutral-500">
                      Our private concierge has received your transmission and will respond within 12 standard business hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: FAQ */}
        {currentRoute === "faq" && (
          <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto w-full flex-1 space-y-8">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                Atelier Inquiries
              </span>
              <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-navy-800">
                Frequently Asked Inquiries
              </h1>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is your return protocol?",
                  a: "Due to the tailored micro-runs of our luxury editions, we welcome un-worn returns with original designer tags intact within 14 calendar days from delivery receipt. Shipping returns are fully covered under standard premium service.",
                },
                {
                  q: "How do you ensure fabric durability and sustainability?",
                  a: "Each fiber represents ethical sourcing. Our virgin wools are carded in Piedmont mills, and raw cashmeres are sourced from Mongolian herding communes. Our garments build individual texture character through regular wearing and natural aeration.",
                },
                {
                  q: "Where is my selection dispatched from?",
                  a: "All orders are prepared, packaged in customized MONZA Luxe presentation cases, and dispatched from our primary operations house in Paris, France.",
                },
                {
                  q: "Can I cancel or edit my order?",
                  a: "Because our fulfillment queue operates continuously, cancellations must be communicated to the private concierge within 2 hours of checkouts.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-2 text-xs"
                >
                  <h3 className="font-bold font-display uppercase tracking-wider text-navy-800">
                    {item.q}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed font-sans font-light">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MY ACCOUNT */}
        {currentRoute === "account" && (
          <div className="py-16 px-6 md:px-12 max-w-lg mx-auto w-full flex-1">
            {!userAccount ? (
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-6">
                <div className="text-center space-y-2 pb-4 border-b">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                    Patron Registry
                  </span>
                  <h1 className="font-display text-xl font-bold uppercase tracking-wider text-navy-800">
                    Sign In / Register Account
                  </h1>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-navy-800">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jean Dupont"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                      className="px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-500 uppercase tracking-widest text-[9px]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="concierge@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-navy-800 text-white rounded-full font-bold uppercase tracking-wider hover:bg-accent-blue transition-colors cursor-pointer"
                  >
                    Enter Patron Ledger
                  </button>
                </form>
              </div>
            ) : (
              /* ACTIVE USER PROFILE PANEL */
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-6 text-xs text-navy-800">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                      Patron Profile Card
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Loyalty Ledger Active
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserAccount(null);
                      localStorage.removeItem("monza_user");
                    }}
                    className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                  >
                    Logout Account
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
                    Customer Name:
                  </span>
                  <div className="text-sm font-bold">{userAccount.name}</div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-semibold">
                    Account Email:
                  </span>
                  <div className="text-sm font-bold font-mono">{userAccount.email}</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border space-y-2">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-neutral-400">
                    Boutique Orders Ledger
                  </h3>
                  {state.orders.filter(o => o.email.toLowerCase() === userAccount.email.toLowerCase()).length > 0 ? (
                    <div className="divide-y divide-neutral-200">
                      {state.orders
                        .filter(o => o.email.toLowerCase() === userAccount.email.toLowerCase())
                        .map(order => (
                          <div key={order.id} className="py-2 flex justify-between items-center text-[11px]">
                            <div>
                              <span className="font-bold font-mono">{order.id}</span>
                              <p className="text-[9px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="font-bold">${order.total}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-400">No active purchases registered under this email yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: ORDER TRACKING */}
        {currentRoute === "tracking" && (
          <div className="py-16 px-6 md:px-12 max-w-lg mx-auto w-full flex-1">
            <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-6 text-xs text-navy-800">
              <div className="text-center space-y-2 pb-4 border-b">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block">
                  Courier Ledger
                </span>
                <h1 className="font-display text-xl font-bold uppercase tracking-wider">
                  Track Your Dispatch
                </h1>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ORD-9824"
                  value={trackingOrderId}
                  onChange={(e) => setTrackingOrderId(e.target.value)}
                  className="px-3.5 py-2 border rounded-xl w-full focus:outline-none bg-neutral-50 font-mono text-xs uppercase"
                />
                <button
                  onClick={handleOrderTracking}
                  className="px-5 py-2 bg-navy-800 text-white rounded-xl hover:bg-accent-blue font-bold uppercase cursor-pointer"
                >
                  Track
                </button>
              </div>

              {trackedOrder ? (
                <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200/50 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold font-mono text-sm">{trackedOrder.id}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        trackedOrder.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600 animate-pulse"
                      }`}
                    >
                      {trackedOrder.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      Delivery Courier
                    </span>
                    <div className="font-semibold">{trackedOrder.shippingMethod}</div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      Destination Address
                    </span>
                    <div className="text-neutral-600">
                      {trackedOrder.shippingAddress.addressLine}, {trackedOrder.shippingAddress.city},{" "}
                      {trackedOrder.shippingAddress.postalCode}, {trackedOrder.shippingAddress.country}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      Purchased Selections
                    </span>
                    <div className="text-[11px] font-medium text-neutral-700 divide-y divide-neutral-100">
                      {trackedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span>{item.title} (x{item.quantity})</span>
                          <span>${item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-neutral-400 text-center">
                  Search order using reference tag from your receipt invoice.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW: WISHLIST */}
        {currentRoute === "wishlist" && (
          <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-navy-800">
                  {activeLanguage === "AR" ? "مختارات المفضلة الخاصة بي" :
                   activeLanguage === "FR" ? "Mes sélections coups de cœur" :
                   activeLanguage === "IT" ? "Le mie selezioni preferite" :
                   "My Wishlist Selections"}
                </h1>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                  {activeLanguage === "AR" ? "تصاميم المتجر المحفوظة" :
                   activeLanguage === "FR" ? "Silhouettes de la boutique enregistrées" :
                   activeLanguage === "IT" ? "Silhouette dell'atelier salvate" :
                   "Saved Boutique Silhouettes"}
                </span>
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wishlist.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currencySymbol={currencySymbol}
                      currencyRate={currencyRate}
                      isWishlisted={true}
                      onQuickView={handleQuickView}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCartDirect={handleAddToCartDirect}
                      activeLanguage={activeLanguage}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center max-w-xs mx-auto space-y-3">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                    Empty Wishlist
                  </span>
                  <p className="text-xs text-neutral-500">
                    You have not bookmarked any fashion profiles. Browse the catalog to save favorites.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setCurrentRoute("shop");
                    }}
                    className="px-5 py-2.5 bg-navy-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider"
                  >
                    Browse Collections
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: DETAILED PRODUCT INQUIRY */}
        {selectedProduct && (
          <div className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1 text-xs text-navy-800 space-y-12">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setCurrentRoute("shop");
              }}
              className="flex items-center gap-1 hover:text-accent-blue transition-colors uppercase font-mono font-bold text-[10px] tracking-widest cursor-pointer"
            >
              ← Back to Collection
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Product Gallery Images */}
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden border">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-neutral-400">
                      <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-display uppercase tracking-widest font-medium text-navy-800/60">
                        Image Slot Ready
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Variant smaller grid gallery thumbnails */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.images?.slice(1).map((img, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-lg overflow-hidden border bg-neutral-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Options selection */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                    {selectedProduct.category}
                  </span>
                  <h1 className="font-display text-2xl font-bold uppercase tracking-wider">
                    {selectedProduct.title}
                  </h1>
                </div>

                <div className="flex items-baseline gap-2 pb-4 border-b">
                  <span className="font-display text-xl font-bold">
                    {currencySymbol}
                    {convertPrice(selectedProduct.price).toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="font-display text-sm line-through text-neutral-400">
                      {currencySymbol}
                      {convertPrice(selectedProduct.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-neutral-600 leading-relaxed font-sans font-light">
                  {selectedProduct.description}
                </p>

                {/* Sizing selection */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                    Choose Size
                  </span>
                  <div className="flex gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setActiveSize(sz)}
                        className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                          activeSize === sz
                            ? "bg-navy-800 text-white border-navy-800 shadow-sm"
                            : "bg-white text-navy-800 hover:border-neutral-400"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color choices */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                    Choose Color
                  </span>
                  <div className="flex gap-2">
                    {selectedProduct.colors.map((col) => (
                      <button
                        key={col}
                        onClick={() => setActiveColor(col)}
                        className={`px-3 py-1.5 rounded-lg border font-medium text-[10px] transition-all cursor-pointer ${
                          activeColor === col
                            ? "bg-navy-800 text-white border-navy-800 shadow-sm"
                            : "bg-white text-navy-800 hover:border-neutral-400"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Warning */}
                <div className="text-[11px] font-mono font-medium text-neutral-500">
                  Status:{" "}
                  <span className={selectedProduct.stock > 0 ? "text-emerald-600" : "text-red-500"}>
                    {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} units available)` : "Sold Out"}
                  </span>
                </div>

                {/* Add to Cart Controls */}
                <div className="flex gap-4 pt-4 border-t">
                  {selectedProduct.stock > 0 ? (
                    <>
                      <div className="flex items-center gap-1 bg-white rounded-full border px-3">
                        <button
                          onClick={() => setActiveQty(Math.max(1, activeQty - 1))}
                          className="p-1 hover:text-accent-blue text-neutral-400"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs w-6 text-center font-bold">{activeQty}</span>
                        <button
                          onClick={() => setActiveQty(Math.min(selectedProduct.stock, activeQty + 1))}
                          className="p-1 hover:text-accent-blue text-neutral-400"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAddToCart(selectedProduct, activeSize, activeColor, activeQty)}
                        className="w-full py-3.5 bg-navy-800 hover:bg-accent-blue text-white rounded-full font-display text-xs font-semibold tracking-widest uppercase shadow-md transition-colors cursor-pointer"
                        id="details-add-to-cart"
                      >
                        Add to Cart Selections
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 bg-neutral-200 text-neutral-400 rounded-full font-display text-xs font-semibold tracking-widest uppercase cursor-not-allowed"
                    >
                      Boutique Silhouette Out of stock
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* REVIEW BUILDER AT BOTTOM OF DETAILS */}
            <div className="pt-12 border-t border-neutral-100 space-y-8">
              <div className="space-y-2">
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-navy-800">
                  Patron Reflections
                </h3>
                <p className="text-neutral-400">Refined reviews submitted from direct boutique purchasers.</p>
              </div>

              {/* Submission Form */}
              <div className="p-6 rounded-2xl bg-white border max-w-lg">
                {!reviewSuccess ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <h4 className="font-bold text-navy-800 uppercase tracking-widest">Write Reflection</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold">Your Name</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border bg-neutral-50"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold">Rating (Stars)</label>
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) || 5 })}
                          className="px-3 py-1.5 rounded-lg border bg-neutral-50"
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold">Your reflection comment</label>
                      <textarea
                        required
                        rows={3}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border bg-neutral-50"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-navy-800 text-white rounded-full font-bold uppercase tracking-wider hover:bg-accent-blue cursor-pointer text-[10px]"
                    >
                      Publish Reflection
                    </button>
                  </form>
                ) : (
                  <div className="text-center p-4 animate-pulse">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                    <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest block mt-2">Success</span>
                    <p className="text-[11px] text-neutral-500">Your review was submitted and approved on database ledger.</p>
                  </div>
                )}
              </div>

              {/* Listing reflections */}
              <div className="space-y-4 max-w-2xl">
                {state.reviews.filter(r => r.productId === selectedProduct.id && r.approved).map((rev) => (
                  <div key={rev.id} className="p-4 bg-neutral-50 rounded-xl border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold">{rev.customerName}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-amber-400 text-[10px] mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <p className="text-neutral-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CART PAGE */}
        {currentRoute === "cart" && (
          <div className="py-12 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1 space-y-6 text-xs text-navy-800">
            <div className="border-b pb-4">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider">
                My Shopping Cart
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                Artisan selections for dispatch
              </span>
            </div>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left table */}
                <div className="lg:col-span-2 divide-y border-b">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-4 flex gap-4 items-center">
                      <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold line-clamp-1 text-sm">{item.product.title}</h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Size: {item.size} · Color: {item.color}
                        </p>
                        <span className="font-mono font-bold mt-1.5 block">
                          {currencySymbol}
                          {convertPrice(item.product.price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 border rounded-full px-2 py-1 bg-white">
                        <button
                          onClick={() => {
                            let updated = [...cart];
                            if (item.quantity === 1) {
                              updated = updated.filter((_, uIdx) => uIdx !== idx);
                            } else {
                              updated[idx].quantity -= 1;
                            }
                            saveCartToLocalStorage(updated);
                          }}
                          className="p-0.5 hover:text-accent-blue"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const updated = [...cart];
                            updated[idx].quantity += 1;
                            saveCartToLocalStorage(updated);
                          }}
                          className="p-0.5 hover:text-accent-blue"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right summary card */}
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs h-fit space-y-4">
                  <h3 className="font-bold uppercase tracking-wider pb-2 border-b">
                    Summary Invoicing
                  </h3>
                  
                  <div className="space-y-2 font-medium">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Catalog Subtotal</span>
                      <span>
                        {currencySymbol}
                        {cartSubtotalConverted.toLocaleString()}
                      </span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Campaign Discount ({appliedCoupon.code})</span>
                        <span>
                          -{currencySymbol}
                          {cartDiscountConverted.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Insured Shipping</span>
                      <span>
                        {currencySymbol}
                        {cartShippingPriceConverted.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Apply Coupon input */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border focus:outline-none w-full bg-neutral-50 font-mono text-xs"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3 bg-navy-800 text-white rounded-lg hover:bg-accent-blue transition-colors font-bold uppercase cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between items-baseline font-bold text-navy-800">
                    <span className="text-sm uppercase tracking-wider">Total Ledger</span>
                    <span className="text-lg">
                      {currencySymbol}
                      {cartTotalConverted.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentRoute("checkout")}
                    className="w-full py-3 bg-navy-800 hover:bg-accent-blue text-white rounded-full font-bold uppercase tracking-wider text-center transition-colors cursor-pointer"
                    id="cart-checkout-cta"
                  >
                    Proceed to Secured Checkout
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center max-w-xs mx-auto space-y-3">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                  Empty Cart
                </span>
                <p className="text-xs text-neutral-500">
                  No active silhouettes saved in shopping cart ledger. Ready for premium collection.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setCurrentRoute("shop");
                  }}
                  className="px-5 py-2.5 bg-navy-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: SECURED CHECKOUT */}
        {currentRoute === "checkout" && (
          <div className="py-12 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1 space-y-6 text-xs text-navy-800">
            <div className="border-b pb-4">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider">
                Secured Checkout
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                Invoice & Shipping Ledger
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Address Form */}
              <form onSubmit={handleCheckoutSubmit} className="lg:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-xs">
                <h3 className="font-bold uppercase tracking-wider pb-2 border-b text-navy-800">
                  Shipping Destination
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                      Patron Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      value={userAccount?.name || ""}
                      onChange={(e) => {
                        if (userAccount) setUserAccount({ ...userAccount, name: e.target.value });
                        else setUserAccount({ name: e.target.value, email: "guest@example.com", isRegistered: false });
                      }}
                      className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                      Patron Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="concierge@example.com"
                      value={userAccount?.email || ""}
                      onChange={(e) => {
                        if (userAccount) setUserAccount({ ...userAccount, email: e.target.value });
                        else setUserAccount({ name: "Guest Patron", email: e.target.value, isRegistered: false });
                      }}
                      className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                    Delivery Address Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="14 Rue du Faubourg Saint-Honoré"
                    value={shippingAddress.line}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line: e.target.value })}
                    className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paris"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="75008"
                      value={shippingAddress.postal}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postal: e.target.value })}
                      className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                    Country / Realm
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                  />
                </div>

                {/* Courier Shipping choice */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-neutral-400 uppercase tracking-widest text-[9px] block">
                    Choose Premium Courier Method
                  </span>
                  <div className="space-y-2">
                    {state.shippingMethods.map((ship) => (
                      <label
                        key={ship.id}
                        onClick={() => setActiveShippingId(ship.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer hover:border-accent-blue transition-colors ${
                          activeShippingId === ship.id
                            ? "bg-accent-blue/5 border-accent-blue font-bold"
                            : "bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={activeShippingId === ship.id}
                            readOnly
                            className="accent-accent-blue"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-navy-800">{ship.name}</span>
                            <span className="block text-[9px] text-neutral-400 font-normal">{ship.duration}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-navy-800">
                          {currencySymbol}
                          {convertPrice(ship.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-navy-800 hover:bg-accent-blue text-white rounded-full font-bold uppercase tracking-wider text-center transition-colors shadow-lg cursor-pointer"
                  id="checkout-submit-btn"
                >
                  Verify Invoice & Authorize Order Dispatch
                </button>
              </form>

              {/* Summary checkout panel */}
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs h-fit space-y-4">
                <h3 className="font-bold uppercase tracking-wider pb-2 border-b">
                  Review Selections
                </h3>
                <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between text-[11px]">
                      <div>
                        <span className="font-bold">{item.product.title}</span>
                        <p className="text-[9px] text-neutral-400">
                          {item.size} / {item.color} (x{item.quantity})
                        </p>
                      </div>
                      <span className="font-mono font-bold">
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Subtotal</span>
                    <span>
                      {currencySymbol}
                      {cartSubtotalConverted.toLocaleString()}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>
                        -{currencySymbol}
                        {cartDiscountConverted.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Courier Delivery</span>
                    <span>
                      {currencySymbol}
                      {cartShippingPriceConverted.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-baseline font-bold text-navy-800">
                  <span className="text-xs uppercase tracking-wider">Final Ledger Total</span>
                  <span className="text-lg">
                    {currencySymbol}
                    {cartTotalConverted.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: THANK YOU */}
        {currentRoute === "thank-you" && checkoutSuccessOrder && (
          <div className="py-24 px-6 md:px-12 max-w-md mx-auto w-full text-center space-y-6 text-xs text-navy-800 flex-1 flex flex-col justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-200 mx-auto animate-bounce">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-600 font-bold block">
                Dispatch Authorized
              </span>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider">
                Order Confirmed
              </h1>
              <p className="text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Thank you for your boutique order. Your secure invoice receipt has been registered on the server ledger.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/50 space-y-3 max-w-xs mx-auto text-left font-semibold">
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-400">Reference Tag:</span>
                <span className="font-mono text-navy-800 font-bold">{checkoutSuccessOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Patron Email:</span>
                <span className="font-mono text-navy-800">{checkoutSuccessOrder.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Ledger Value:</span>
                <span className="text-navy-800 font-bold">
                  {currencySymbol}
                  {(checkoutSuccessOrder.total * currencyRate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 max-w-xs mx-auto">
              <p className="text-[10px] text-neutral-400">
                You can track this package's shipping and delivery progress using our active "Courier Tracking" panel at any time.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setTrackingOrderId(checkoutSuccessOrder.id);
                    setTrackedOrder(checkoutSuccessOrder);
                    setCurrentRoute("tracking");
                  }}
                  className="px-5 py-2.5 bg-navy-800 text-white rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Track Progress
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute("home");
                    setCheckoutSuccessOrder(null);
                  }}
                  className="px-5 py-2.5 border rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-neutral-50"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-navy-900 text-white/70 py-16 px-6 md:px-12 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="relative flex items-center h-10 select-none pb-2">
              <span className="font-logo-serif text-2xl font-black uppercase tracking-[0.05em] leading-none text-white select-none">
                MONZA
              </span>
              <span className="absolute bottom-1 left-9 font-logo-script text-3xl text-accent-blue/90 font-medium transform -rotate-[12deg] select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                luxe
              </span>
            </div>
            <p className="font-light text-white/60 leading-relaxed">
              {activeLanguage === "AR" ? "أناقة هادئة، أوزان منظمة فاخرة، وتصاميم مفككة. صُمم في باريس، وصُنع عالميًا." :
               activeLanguage === "FR" ? "Élégance discrète, matières structurées luxueuses, silhouettes déconstruites. Conçu à Paris, fabriqué dans le monde entier." :
               activeLanguage === "IT" ? "Quiet elegance, tessuti strutturati di lusso, silhouette decostruite. Disegnato a Parigi, realizzato globalmente." :
               "Quiet elegance, luxurious structured weights, deconstructed silhouettes. Designed in Paris, crafted globally."}
            </p>
            <div className="flex gap-3 text-white/50 text-[10px] uppercase font-mono font-bold">
              <a href={`https://instagram.com/${cms.contact.instagram}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <span>·</span>
              <a href={`https://pinterest.com/${cms.contact.pinterest}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pinterest</a>
            </div>
          </div>

          {/* Catalog Divisions */}
          <div className="space-y-3">
            <h4 className="font-display uppercase tracking-widest text-white text-[10px] font-bold">
              {activeLanguage === "AR" ? "أقسام المتجر" :
               activeLanguage === "FR" ? "Divisions de la boutique" :
               activeLanguage === "IT" ? "Divisioni del negozio" :
               "Store Divisions"}
            </h4>
            <div className="flex flex-col gap-2 font-medium">
              {state.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    setCurrentRoute("shop");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-left hover:text-white transition-colors cursor-pointer text-white/60"
                >
                  {getCategoryName(c.name)}
                </button>
              ))}
            </div>
          </div>

          {/* Legal and Support */}
          <div className="space-y-3">
            <h4 className="font-display uppercase tracking-widest text-white text-[10px] font-bold">
              {activeLanguage === "AR" ? "خدمات العملاء المتميزين" :
               activeLanguage === "FR" ? "Services aux clients" :
               activeLanguage === "IT" ? "Servizi di assistenza" :
               "Patron Services"}
            </h4>
            <div className="flex flex-col gap-2 font-medium text-white/60">
              <button onClick={() => setCurrentRoute("faq")} className="text-left hover:text-white transition-colors">
                {activeLanguage === "AR" ? "الأسئلة الشائعة للحرفيين" : activeLanguage === "FR" ? "FAQ de l'Atelier" : activeLanguage === "IT" ? "FAQ dell'Atelier" : "Artisan FAQ"}
              </button>
              <button onClick={() => setCurrentRoute("tracking")} className="text-left hover:text-white transition-colors">
                {activeLanguage === "AR" ? "تتبع البريد السريع" : activeLanguage === "FR" ? "Suivi du coursier" : activeLanguage === "IT" ? "Tracciamento spedizione" : "Courier Tracking"}
              </button>
              <button onClick={() => setCurrentRoute("contact")} className="text-left hover:text-white transition-colors">
                {activeLanguage === "AR" ? "استشارة خاصة" : activeLanguage === "FR" ? "Consultation privée" : activeLanguage === "IT" ? "Consulenza privata" : "Private Consultation"}
              </button>
              <button onClick={() => setCurrentRoute("about")} className="text-left hover:text-white transition-colors">
                {activeLanguage === "AR" ? "تاريخ البيان" : activeLanguage === "FR" ? "Histoire du Manifeste" : activeLanguage === "IT" ? "La nostra storia" : "Manifesto History"}
              </button>
            </div>
          </div>

          {/* Store Address / Location */}
          <div className="space-y-3 text-white/60">
            <h4 className="font-display uppercase tracking-widest text-white text-[10px] font-bold">
              {activeLanguage === "AR" ? "المشغل الفعلي" :
               activeLanguage === "FR" ? "Atelier physique" :
               activeLanguage === "IT" ? "Atelier fisico" :
               "Physical Atelier"}
            </h4>
            <p className="leading-relaxed">
              {cms.contact.address}
            </p>
            <span className="block font-mono text-[10px] text-white/40">
              {activeLanguage === "AR" ? "بوابة الاستقبال: " : activeLanguage === "FR" ? "Concierge : " : activeLanguage === "IT" ? "Servizio clienti: " : "Concierge: "} {cms.contact.phone}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-white/40 text-[10px] font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            {activeLanguage === "AR" ? "© ٢٠٢٦ مونزا لوكس. جميع حقوق المتجر محفوظة." :
             activeLanguage === "FR" ? "© 2026 MONZA Luxe. Tous droits de boutique réservés." :
             activeLanguage === "IT" ? "© 2026 MONZA Luxe. Tutti i diritti riservati." :
             "© 2026 MONZA Luxe. All boutique rights reserved."}
          </span>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">
              {activeLanguage === "AR" ? "سياسة الخصوصية" : activeLanguage === "FR" ? "Politique de confidentialité" : activeLanguage === "IT" ? "Informativa sulla privacy" : "Privacy Policy"}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {activeLanguage === "AR" ? "شروط الخدمة" : activeLanguage === "FR" ? "Conditions d'utilisation" : activeLanguage === "IT" ? "Termini di servizio" : "Terms of Service"}
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              {activeLanguage === "AR" ? "بروتوكول المرتجعات" : activeLanguage === "FR" ? "Protocole de retour" : activeLanguage === "IT" ? "Protocollo resi" : "Returns Protocol"}
            </span>
          </div>
        </div>
      </footer>

      {/* MODAL: CART DRAWER SLIDE-OUT */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden text-xs text-navy-800">
            <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                      Artisan Cart Selections
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Preparing dispatch details
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 text-neutral-400 hover:text-navy-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart lists */}
                <div className="flex-1 overflow-y-auto p-6 divide-y">
                  {cart.length > 0 ? (
                    cart.map((item, idx) => (
                      <div key={idx} className="py-4 flex gap-4 items-center">
                        <div className="w-14 h-18 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold line-clamp-1 text-xs">{item.product.title}</h4>
                          <p className="text-[9px] text-neutral-400">
                            {item.size} / {item.color}
                          </p>
                          <span className="font-bold font-mono text-[11px] block mt-1">
                            {currencySymbol}
                            {(convertPrice(item.product.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 border rounded-full px-2 py-0.5">
                          <button
                            onClick={() => {
                              let updated = [...cart];
                              if (item.quantity === 1) {
                                updated = updated.filter((_, uIdx) => uIdx !== idx);
                              } else {
                                updated[idx].quantity -= 1;
                              }
                              saveCartToLocalStorage(updated);
                            }}
                            className="p-0.5 text-neutral-400 hover:text-navy-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const updated = [...cart];
                              updated[idx].quantity += 1;
                              saveCartToLocalStorage(updated);
                            }}
                            className="p-0.5 text-neutral-400 hover:text-navy-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 text-center text-neutral-400 font-mono text-[10px]">
                      Cart empty
                    </div>
                  )}
                </div>

                {/* Summary Checkout at bottom */}
                <div className="p-6 border-t bg-neutral-50/50 space-y-4">
                  <div className="flex justify-between items-baseline font-bold">
                    <span className="uppercase tracking-widest text-[10px] text-neutral-400">
                      Total Ledger Subtotal:
                    </span>
                    <span className="text-lg">
                      {currencySymbol}
                      {cartSubtotalConverted.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setCurrentRoute("cart");
                      }}
                      className="py-3 border rounded-full font-bold uppercase tracking-wider hover:bg-neutral-50 text-center cursor-pointer"
                    >
                      View Cart
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setCurrentRoute("checkout");
                      }}
                      className="py-3 bg-navy-800 text-white rounded-full font-bold uppercase tracking-wider text-center hover:bg-accent-blue transition-colors cursor-pointer"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRODUCT QUICK VIEW OVERLAY */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs text-navy-800 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 relative grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl border"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-navy-800 transition-all"
                id="close-quickview-btn"
                aria-label="Close Quick View"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Picture */}
              <div className="aspect-[3/4] rounded-2xl bg-neutral-100 border overflow-hidden flex items-center justify-center">
                {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                  <img src={quickViewProduct.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-neutral-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-[10px] tracking-widest font-mono">NO IMAGE</span>
                  </div>
                )}
              </div>

              {/* Right options */}
              <div className="flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-semibold mb-0.5">
                      {quickViewProduct.category}
                    </span>
                    <h3 className="font-display text-lg font-bold text-navy-800 uppercase tracking-wide">
                      {quickViewProduct.title}
                    </h3>
                    <div className="font-display text-sm font-bold text-navy-800 mt-1">
                      {currencySymbol}
                      {convertPrice(quickViewProduct.price).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-neutral-500 leading-relaxed font-sans text-[11px]">
                    {quickViewProduct.description}
                  </p>

                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                        Sizing Option
                      </span>
                      <select
                        value={activeSize}
                        onChange={(e) => setActiveSize(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border bg-neutral-50 w-full font-mono text-[11px]"
                      >
                        {quickViewProduct.sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                        Color Option
                      </span>
                      <select
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="px-2 py-1.5 rounded-lg border bg-neutral-50 w-full font-sans text-[11px]"
                      >
                        {quickViewProduct.colors.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(quickViewProduct, activeSize, activeColor);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-3 bg-navy-800 hover:bg-accent-blue text-white rounded-full font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                    id="quick-add-to-cart-btn"
                  >
                    Add selections
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: MERCHANT CMS PANEL OVERLAY */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            state={state}
            onClose={() => setIsAdminOpen(false)}
            onUpdateState={(updatedState) => setState(updatedState)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
