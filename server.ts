import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { StoreState } from "./src/types";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial default state
const defaultState: StoreState = {
  products: [
    {
      id: "prod-1",
      title: "Monarch Double-Breasted Trench",
      description: "A signature double-breasted trench coat tailored in water-repellent cotton gabardine. Features unstructured shoulders, clean lines, an elegant belt, and an effortless drape that embodies classic luxury.",
      price: 490,
      originalPrice: 580,
      discount: 15,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Midnight Blue", "Sand Beige", "Obsidian Black"],
      category: "Coats & Jackets",
      stock: 12,
      isFeatured: true,
      isNew: true,
      images: []
    },
    {
      id: "prod-2",
      title: "Oversized Cashmere Crewneck",
      description: "Crafted from exceptionally soft, heavy-gauge premium Mongolian cashmere. This knit features relaxed proportions, heavy ribbed trims, and dropped shoulders for a sophisticated off-duty aesthetic.",
      price: 340,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Oatmeal Heather", "Charcoal Gray", "Off-White"],
      category: "Knitwear",
      stock: 18,
      isFeatured: true,
      isNew: false,
      images: []
    },
    {
      id: "prod-3",
      title: "Classic Silk-Blend Tailored Shirt",
      description: "An elegant, fluid button-down cut from a lightweight silk-cotton blend. Detailed with a modern hidden placket, clean cuffs, and a soft collar design that bridges casual and formal dressing.",
      price: 195,
      sizes: ["S", "M", "L"],
      colors: ["Snow White", "Powder Blue", "Obsidian Black"],
      category: "Shirts",
      stock: 25,
      isFeatured: false,
      isNew: true,
      images: []
    },
    {
      id: "prod-4",
      title: "Pleated Wool-Blend Trouser",
      description: "Tailored trouser crafted in structured tropical-weight virgin wool blend. Features a elegant high-rise waist, single front pleats, pressed creases, and a wide-leg profile.",
      price: 240,
      originalPrice: 240,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Midnight Blue", "Espresso Brown", "Charcoal Gray"],
      category: "Trousers & Denim",
      stock: 8,
      isFeatured: true,
      isSale: false,
      images: []
    },
    {
      id: "prod-5",
      title: "Italian Nappa Leather Belt",
      description: "A luxury minimalist belt crafted in Tuscany from vegetable-tanned full-grain leather. Finished with an elegant, matte silver-brushed solid brass buckle and hand-painted edges.",
      price: 110,
      sizes: ["M", "L", "XL"],
      colors: ["Obsidian Black", "Mahogany Brown"],
      category: "Accessories",
      stock: 30,
      isFeatured: false,
      isSale: true,
      discount: 10,
      originalPrice: 120,
      images: []
    }
  ],
  categories: [
    { id: "cat-1", name: "Coats & Jackets", slug: "coats-jackets", description: "Structured tailoring and elegant outwear silhouettes." },
    { id: "cat-2", name: "Knitwear", slug: "knitwear", description: "Sumptuous cashmere, heavy wool, and refined layering knits." },
    { id: "cat-3", name: "Shirts", slug: "shirts", description: "Premium cotton, silk, and linen tailored shirts." },
    { id: "cat-4", name: "Trousers & Denim", slug: "trousers-denim", description: "Timeless trousers, pleat pants, and relaxed raw denim." },
    { id: "cat-5", name: "Accessories", slug: "accessories", description: "High-end leather goods, belts, scarves, and understated luxury." }
  ],
  orders: [
    {
      id: "ORD-9824",
      customerId: "cust-1",
      customerName: "Alex Mercer",
      email: "alex@example.com",
      items: [
        {
          productId: "prod-1",
          title: "Monarch Double-Breasted Trench",
          price: 490,
          quantity: 1,
          selectedSize: "M",
          selectedColor: "Sand Beige"
        }
      ],
      total: 505, // 490 + 15 shipping
      status: "Processing",
      shippingAddress: {
        addressLine: "124 Rivington St, Apt 4B",
        city: "New York",
        postalCode: "10002",
        country: "United States"
      },
      paymentMethod: "Apple Pay",
      shippingMethod: "Standard Delivery",
      createdAt: "2026-06-25T14:32:00Z"
    },
    {
      id: "ORD-9511",
      customerId: "cust-2",
      customerName: "Elena Rostova",
      email: "elena@example.com",
      items: [
        {
          productId: "prod-2",
          title: "Oversized Cashmere Crewneck",
          price: 340,
          quantity: 1,
          selectedSize: "S",
          selectedColor: "Oatmeal Heather"
        }
      ],
      total: 355,
      status: "Delivered",
      shippingAddress: {
        addressLine: "Rue de l'Université, 45",
        city: "Paris",
        postalCode: "75007",
        country: "France"
      },
      paymentMethod: "Visa Premium",
      shippingMethod: "Standard Delivery",
      createdAt: "2026-06-20T10:15:00Z"
    }
  ],
  customers: [
    { id: "cust-1", name: "Alex Mercer", email: "alex@example.com", ordersCount: 1, totalSpent: 505, createdAt: "2026-06-25T14:30:00Z" },
    { id: "cust-2", name: "Elena Rostova", email: "elena@example.com", ordersCount: 1, totalSpent: 355, createdAt: "2026-06-20T10:10:00Z" }
  ],
  coupons: [
    { id: "coup-1", code: "MONZAFIRST", type: "percentage", value: 10, active: true, minSpend: 100 },
    { id: "coup-2", code: "LUXE50", type: "fixed", value: 50, active: true, minSpend: 300 }
  ],
  reviews: [
    {
      id: "rev-1",
      productId: "prod-1",
      productTitle: "Monarch Double-Breasted Trench",
      customerName: "Benjamin S.",
      rating: 5,
      comment: "Absolutely stunning silhouette. The weight of the gabardine is substantial, and the drape is incredibly premium. Far exceeds expectations.",
      createdAt: "2026-06-24T18:40:00Z",
      approved: true
    },
    {
      id: "rev-2",
      productId: "prod-2",
      productTitle: "Oversized Cashmere Crewneck",
      customerName: "Clara M.",
      rating: 5,
      comment: "Incredibly soft cashmere. The fit is beautifully oversized and modern without swallowing you up. Worth every penny.",
      createdAt: "2026-06-22T09:12:00Z",
      approved: true
    }
  ],
  blogPosts: [
    {
      id: "blog-1",
      title: "The Luxury of Intentionality: Philosophy of Timeless Tailoring",
      excerpt: "In a world of fast-moving trends, MONZA Luxe represents a conscious retreat toward craftsmanship, tactile weight, and structured elegance.",
      content: "<p>True style is a form of architectural discipline. It is about form, structure, and material weight. Our newest Autumn/Winter collection is a physical manifestation of this philosophy.</p><p>We have carefully selected double-twist cotton gabardines, virgin wools, and Mongolian cashmere. These materials do not simply cover the body; they respond to it, draping effortlessly and retaining structure for a lifetime.</p><p>To build a timeless wardrobe, start with three key foundations: the perfectly draped trench, the heavy-knit cashmere sweater, and the pleat-front wool trouser. Each piece is designed to build upon the next, creating a quiet yet powerful visual statement.</p>",
      author: "Creative Director",
      date: "June 18, 2026",
      slug: "luxury-of-intentionality"
    },
    {
      id: "blog-2",
      title: "Unstructured vs. Structured Outerwear: Finding the Balance",
      excerpt: "An exploration into garment architecture and how modern tailoring balances elegant rigidity with casual fluid motion.",
      content: "<p>The traditional suit was a cage. Heavy canvas linings, rigid shoulder pads, and stiff interlinings forced the body into submission. Modern luxury offers an escape.</p><p>By deconstructing the shoulders of our trench coats and jackets, we've created a silhouette that moves organically with the wearer. The shape remains clean, but the feeling is completely unrestrictive.</p><p>When dressing for the colder seasons, pair an unstructured coat with a heavily structured pleated wool trouser. This tension between fluid movement and tailored lines is the sweet spot of contemporary luxury dressing.</p>",
      author: "Head of Design",
      date: "June 10, 2026",
      slug: "unstructured-outerwear-balance"
    }
  ],
  shippingMethods: [
    { id: "ship-1", name: "Standard Insured Delivery", price: 15, duration: "3-5 Business Days" },
    { id: "ship-2", name: "Premium Overnight Express", price: 35, duration: "Next Business Day" }
  ],
  cms: {
    hero: {
      title: "MONZA LUXE",
      subtitle: "AUTUMN / WINTER 2026",
      description: "A study in silent elegance, immaculate tailoring, and heavy-weight textures. Experience contemporary high-end silhouettes crafted intentionally for the modern wardrobe.",
      buttonText: "EXPLORE THE EDIT",
      backgroundImage: ""
    },
    navigation: [
      { name: "Collection", path: "/shop" },
      { name: "About Us", path: "/about" },
      { name: "Journal", path: "/blog" },
      { name: "Inquiries", path: "/contact" }
    ],
    about: {
      story: "Founded as a contemporary fashion house, MONZA Luxe is a response to fast-paced trends. We believe in the tactile power of weight, premium drape, and absolute minimalist detailing. Each collection is developed incrementally in micro-runs, using ethical mills in Italy and Mongolia. We design with longevity in mind, creating pieces that develop individual patina and character through years of active wear.",
      philosophy: "We reject visual noise. No loud logos, no temporary gimmick details, no cheap synthetic fabrics. The premium character of a MONZA Luxe garment is conveyed purely through the sculptural depth of its pleats, the substantial weight of its weave, and its refined monochromatic palette."
    },
    contact: {
      email: "concierge@monzaluxe.com",
      phone: "+33 (0) 1 45 88 99 22",
      address: "14 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
      instagram: "monzaluxe",
      facebook: "monzaluxe.official",
      pinterest: "monzaluxe"
    },
    seo: {
      metaTitle: "MONZA Luxe | Premium Modern Fashion & Tailoring",
      metaDescription: "Experience silent luxury. High-end minimal trench coats, Mongolian cashmere knitwear, and wool tailored trousers. Designed in Paris, crafted ethically."
    },
    emailTemplates: {
      orderPlaced: "Thank you for your order with MONZA Luxe. We are currently reviewing your selection. Once processed and dispatched, you will receive an active tracking link. Standard premium delivery applies.",
      orderShipped: "Your selection has been prepared and dispatched from our logistics house in Paris. Your active tracking number is enclosed. Thank you for your continued trust."
    }
  },
  currencies: [
    { code: "USD", symbol: "$", rate: 1.0 },
    { code: "EUR", symbol: "€", rate: 0.92 },
    { code: "GBP", symbol: "£", rate: 0.79 },
    { code: "JPY", symbol: "¥", rate: 158.5 },
    { code: "DZD", symbol: "DA", rate: 134.0 }
  ],
  languages: [
    { code: "EN", name: "English" },
    { code: "FR", name: "Français" },
    { code: "IT", name: "Italiano" },
    { code: "AR", name: "العربية" }
  ],
  activeCurrency: "USD",
  activeLanguage: "EN"
};

// State Helper Functions
function getStoreState(): StoreState {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading db.json, returning defaultState", error);
  }
  // Write default state if file doesn't exist
  saveStoreState(defaultState);
  return defaultState;
}

function saveStoreState(state: StoreState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db.json", error);
  }
}

// Enable JSON bodies with higher limits for Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve Uploads as Static Folder
app.use("/uploads", express.static(UPLOADS_DIR));

// --- API ROUTES ---

// GET full store state
app.get("/api/store", (req, res) => {
  res.json(getStoreState());
});

// POST to update entire state (backup / full sync)
app.post("/api/store", (req, res) => {
  const state = req.body;
  saveStoreState(state);
  res.json({ success: true, state });
});

// POST to upload an image (decodes Base64 and writes to disk)
app.post("/api/upload", (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ error: "Missing filename or base64 data" });
    }

    // Clean base64 string
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique name to prevent collisions
    const ext = path.extname(filename) || ".jpg";
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/uploads/${uniqueFilename}`
    });
  } catch (error: any) {
    console.error("Upload error", error);
    res.status(500).json({ error: error.message || "Failed to upload image" });
  }
});

// POST products (create or update)
app.post("/api/products", (req, res) => {
  const state = getStoreState();
  const product = req.body;

  if (!product.id) {
    product.id = `prod-${Date.now()}`;
    state.products.push(product);
  } else {
    const idx = state.products.findIndex((p) => p.id === product.id);
    if (idx > -1) {
      state.products[idx] = product;
    } else {
      state.products.push(product);
    }
  }

  saveStoreState(state);
  res.json({ success: true, product });
});

// DELETE products
app.delete("/api/products/:id", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  state.products = state.products.filter((p) => p.id !== id);
  saveStoreState(state);
  res.json({ success: true });
});

// POST categories (create or update)
app.post("/api/categories", (req, res) => {
  const state = getStoreState();
  const category = req.body;

  if (!category.id) {
    category.id = `cat-${Date.now()}`;
    state.categories.push(category);
  } else {
    const idx = state.categories.findIndex((c) => c.id === category.id);
    if (idx > -1) {
      state.categories[idx] = category;
    } else {
      state.categories.push(category);
    }
  }

  saveStoreState(state);
  res.json({ success: true, category });
});

// DELETE categories
app.delete("/api/categories/:id", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  state.categories = state.categories.filter((c) => c.id !== id);
  saveStoreState(state);
  res.json({ success: true });
});

// POST orders (create new order)
app.post("/api/orders", (req, res) => {
  const state = getStoreState();
  const order = req.body;

  order.id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  order.createdAt = new Date().toISOString();
  order.status = "Pending";

  // Check if customer already exists, otherwise add them
  let customer = state.customers.find((c) => c.email.toLowerCase() === order.email.toLowerCase());
  if (customer) {
    customer.ordersCount += 1;
    customer.totalSpent += order.total;
  } else {
    customer = {
      id: `cust-${Date.now()}`,
      name: order.customerName,
      email: order.email,
      ordersCount: 1,
      totalSpent: order.total,
      createdAt: new Date().toISOString()
    };
    state.customers.push(customer);
  }
  order.customerId = customer.id;

  // Deduct stock from products
  order.items.forEach((item: any) => {
    const prod = state.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  state.orders.unshift(order);
  saveStoreState(state);
  res.json({ success: true, order });
});

// POST order status update
app.post("/api/orders/:id/status", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  const { status } = req.body;

  const order = state.orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    saveStoreState(state);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// POST coupons
app.post("/api/coupons", (req, res) => {
  const state = getStoreState();
  const coupon = req.body;

  if (!coupon.id) {
    coupon.id = `coup-${Date.now()}`;
    state.coupons.push(coupon);
  } else {
    const idx = state.coupons.findIndex((c) => c.id === coupon.id);
    if (idx > -1) {
      state.coupons[idx] = coupon;
    } else {
      state.coupons.push(coupon);
    }
  }

  saveStoreState(state);
  res.json({ success: true, coupon });
});

// DELETE coupons
app.delete("/api/coupons/:id", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  state.coupons = state.coupons.filter((c) => c.id !== id);
  saveStoreState(state);
  res.json({ success: true });
});

// POST reviews (customer review creation)
app.post("/api/reviews", (req, res) => {
  const state = getStoreState();
  const review = req.body;

  review.id = `rev-${Date.now()}`;
  review.createdAt = new Date().toISOString();
  review.approved = true; // Auto-approved for this boutique preview, editable in CMS

  state.reviews.unshift(review);
  saveStoreState(state);
  res.json({ success: true, review });
});

// POST reviews approve/disapprove (from admin)
app.post("/api/reviews/:id/approve", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  const { approved } = req.body;

  const review = state.reviews.find((r) => r.id === id);
  if (review) {
    review.approved = approved;
    saveStoreState(state);
    res.json({ success: true, review });
  } else {
    res.status(404).json({ error: "Review not found" });
  }
});

// DELETE reviews (from admin)
app.delete("/api/reviews/:id", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  state.reviews = state.reviews.filter((r) => r.id !== id);
  saveStoreState(state);
  res.json({ success: true });
});

// POST blogs (create or update)
app.post("/api/blogs", (req, res) => {
  const state = getStoreState();
  const blog = req.body;

  if (!blog.id) {
    blog.id = `blog-${Date.now()}`;
    blog.date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    state.blogPosts.unshift(blog);
  } else {
    const idx = state.blogPosts.findIndex((b) => b.id === blog.id);
    if (idx > -1) {
      state.blogPosts[idx] = { ...state.blogPosts[idx], ...blog };
    } else {
      state.blogPosts.push(blog);
    }
  }

  saveStoreState(state);
  res.json({ success: true, blog });
});

// DELETE blogs
app.delete("/api/blogs/:id", (req, res) => {
  const state = getStoreState();
  const { id } = req.params;
  state.blogPosts = state.blogPosts.filter((b) => b.id !== id);
  saveStoreState(state);
  res.json({ success: true });
});

// POST CMS configuration
app.post("/api/cms", (req, res) => {
  const state = getStoreState();
  state.cms = req.body;
  saveStoreState(state);
  res.json({ success: true, cms: state.cms });
});

// POST settings (currencies, languages, active selection)
app.post("/api/settings", (req, res) => {
  const state = getStoreState();
  const { activeCurrency, activeLanguage, currencies, languages } = req.body;

  if (activeCurrency) state.activeCurrency = activeCurrency;
  if (activeLanguage) state.activeLanguage = activeLanguage;
  if (currencies) state.currencies = currencies;
  if (languages) state.languages = languages;

  saveStoreState(state);
  res.json({ success: true, settings: { activeCurrency: state.activeCurrency, activeLanguage: state.activeLanguage } });
});


// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
