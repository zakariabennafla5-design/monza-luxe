import React, { useState } from "react";
import {
  StoreState,
  Product,
  Category,
  Order,
  Coupon,
  Review,
  BlogPost,
  ShippingMethod,
  CMSContent,
  Currency,
} from "../types";
import {
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  MessageSquare,
  FileText,
  Percent,
  Sliders,
  Settings,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  Globe,
  Truck,
  Mail,
  Shield,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  state: StoreState;
  onClose: () => void;
  onUpdateState: (newState: StoreState) => void;
}

type TabType =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "reviews"
  | "blogs"
  | "coupons"
  | "cms"
  | "settings";

export default function AdminPanel({ state, onClose, onUpdateState }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Product Editor State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [newColorInput, setNewColorInput] = useState("");
  const [newSizeInput, setNewSizeInput] = useState("");

  // Category Editor State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Blog Editor State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);

  // Coupon Editor State
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  // API Call helper
  const apiCall = async (endpoint: string, method: string, body?: any) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (data.success) {
        // Reload full store state to update client
        const storeRes = await fetch("/api/store");
        const freshStore = await storeRes.json();
        onUpdateState(freshStore);
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero = false, isBlog = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLoading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            base64: base64String,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (isHero) {
            const updatedCms = {
              ...state.cms,
              hero: { ...state.cms.hero, backgroundImage: data.url },
            };
            await apiCall("/api/cms", "POST", updatedCms);
          } else if (isBlog && editingBlog) {
            setEditingBlog({ ...editingBlog, coverImage: data.url });
          } else if (editingProduct) {
            const currentImages = editingProduct.images || [];
            setEditingProduct({
              ...editingProduct,
              images: [...currentImages, data.url],
            });
          }
        } else {
          alert(data.error || "Upload failed");
        }
      } catch (err) {
        console.error(err);
        alert("Upload network error");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete product image
  const removeProductImage = (idxToRemove: number) => {
    if (editingProduct && editingProduct.images) {
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((_, idx) => idx !== idxToRemove),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-md flex items-center justify-center p-0 md:p-6 text-navy-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full h-full md:max-w-7xl md:h-[90vh] bg-slate-50 md:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-navy-800 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-blue/20 text-accent-blue">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider uppercase">
                MONZA LUXE CMS
              </h1>
              <p className="text-[10px] font-mono text-white/60">
                Merchant Operations & Store Editor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            id="close-admin-panel"
            aria-label="Close admin panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-navy-900 text-white/70 p-4 border-r border-white/5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0 scrollbar-none">
            {[
              { id: "overview", label: "Overview", icon: Sliders },
              { id: "products", label: "Products", icon: Package },
              { id: "categories", label: "Categories", icon: FolderOpen },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "customers", label: "Customers", icon: Users },
              { id: "reviews", label: "Reviews", icon: MessageSquare },
              { id: "blogs", label: "Journal", icon: FileText },
              { id: "coupons", label: "Coupons", icon: Percent },
              { id: "cms", label: "Home Sections", icon: Sliders },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setEditingProduct(null);
                    setEditingCategory(null);
                    setEditingBlog(null);
                    setEditingCoupon(null);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs tracking-wider uppercase font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 md:shrink ${
                    isActive
                      ? "bg-accent-blue text-white shadow-md font-semibold"
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                  id={`admin-tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Workspace */}
          <div className="flex-1 p-6 overflow-y-auto relative bg-slate-50">
            {loading && (
              <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono uppercase tracking-wider text-navy-800">
                    Syncing changes...
                  </span>
                </div>
              </div>
            )}

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Boutique Analytics Overview
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Real-time operational metrics for MONZA Luxe.
                  </p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Sales",
                      val: `${state.currencies.find(c => c.code === state.activeCurrency)?.symbol || "$"}${Math.round(state.orders.reduce((acc, o) => o.status !== "Cancelled" ? acc + o.total : acc, 0) * (state.currencies.find(c => c.code === state.activeCurrency)?.rate || 1)).toLocaleString()}`,
                      desc: "All time completed orders",
                      color: "text-accent-blue",
                    },
                    {
                      label: "Active Products",
                      val: state.products.length.toString(),
                      desc: "Catalog count",
                      color: "text-navy-800",
                    },
                    {
                      label: "Total Orders",
                      val: state.orders.length.toString(),
                      desc: "Completed and processing",
                      color: "text-emerald-600",
                    },
                    {
                      label: "Reviews",
                      val: `${state.reviews.filter((r) => r.approved).length}/${state.reviews.length}`,
                      desc: "Approved / Total review count",
                      color: "text-amber-500",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs flex flex-col justify-between"
                    >
                      <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                        {stat.label}
                      </span>
                      <span className={`text-2xl font-bold font-display ${stat.color} my-1`}>
                        {stat.val}
                      </span>
                      <span className="text-[10px] text-neutral-400">{stat.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Info block regarding placeholder products */}
                <div className="p-5 rounded-2xl bg-white border border-dashed border-accent-blue/40 bg-accent-blue/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-800 mb-1">
                      Merchant Note: No Placeholder Product Images Active
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                      As requested, all image slots for default products are left completely blank. This provides you complete freedom to upload your custom high-resolution brand photography. Use the "Products" tab below to upload images for each item.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="px-4 py-2 bg-navy-800 text-white rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-accent-blue transition-colors cursor-pointer shrink-0"
                  >
                    Manage Products
                  </button>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-xs overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-800">
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-accent-blue font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {state.orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-navy-800">{order.id}</span>
                            <span className="text-neutral-400">·</span>
                            <span className="text-neutral-500">{order.customerName}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-navy-800">
                            {state.currencies.find(c => c.code === state.activeCurrency)?.symbol || "$"}{(order.total * (state.currencies.find(c => c.code === state.activeCurrency)?.rate || 1)).toLocaleString()}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                              order.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-600"
                                : order.status === "Processing"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-6">
                {!editingProduct ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                          Product Catalog
                        </h2>
                        <p className="text-xs text-neutral-500">
                          Add, edit, or delete items from your fashion catalog.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setEditingProduct({
                            title: "",
                            description: "",
                            price: 0,
                            sizes: ["S", "M", "L"],
                            colors: ["Midnight Blue", "Off-White"],
                            category: state.categories[0]?.name || "",
                            stock: 10,
                            images: [],
                            isNew: true,
                          })
                        }
                        className="px-5 py-2.5 bg-accent-blue text-white rounded-full text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-navy-800 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                        id="add-new-product"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>

                    {/* Search / Filter bar */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-neutral-200">
                      <Search className="w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search product title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-navy-800 focus:outline-none w-full"
                      />
                    </div>

                    {/* Product List Table Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {state.products
                        .filter(
                          (p) =>
                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((product) => (
                          <div
                            key={product.id}
                            className="p-4 rounded-2xl bg-white border border-neutral-200/60 shadow-xs flex gap-3 relative"
                          >
                            <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-neutral-200/50">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-neutral-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mb-0.5">
                                  {product.category}
                                </span>
                                <h3 className="text-xs font-bold text-navy-800 line-clamp-1 mb-1">
                                  {product.title}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs font-bold font-display text-navy-800">
                                    ${product.price}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-[10px] line-through text-neutral-400">
                                      ${product.originalPrice}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400 block mt-1">
                                Stock: {product.stock}
                              </span>
                            </div>
                            <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-navy-800 transition-colors"
                                id={`edit-prod-${product.id}`}
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete product ${product.title}?`)) {
                                    apiCall(`/api/products/${product.id}`, "DELETE");
                                  }
                                }}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                id={`delete-prod-${product.id}`}
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  /* PRODUCT FORM */
                  <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
                        {editingProduct.id ? "Edit Product Silhouette" : "New Fashion Silhouette"}
                      </h3>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Left Block: Basic Details */}
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Product Title
                          </label>
                          <input
                            type="text"
                            value={editingProduct.title || ""}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, title: e.target.value })
                            }
                            placeholder="e.g. Oversized Heavyweight Hoodie"
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Category
                          </label>
                          <select
                            value={editingProduct.category || ""}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, category: e.target.value })
                            }
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                          >
                            {state.categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                              Price ($ USD)
                            </label>
                            <input
                              type="number"
                              value={editingProduct.price || 0}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                              Original Price ($ USD)
                            </label>
                            <input
                              type="number"
                              value={editingProduct.originalPrice || ""}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  originalPrice: parseFloat(e.target.value) || undefined,
                                })
                              }
                              placeholder="Leave blank for no discount"
                              className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                              Discount Percentage (%)
                            </label>
                            <input
                              type="number"
                              value={editingProduct.discount || ""}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  discount: parseInt(e.target.value) || undefined,
                                })
                              }
                              placeholder="e.g. 15"
                              className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                              Stock Units
                            </label>
                            <input
                              type="number"
                              value={editingProduct.stock || 0}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  stock: parseInt(e.target.value) || 0,
                                })
                              }
                              className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Detailed Description
                          </label>
                          <textarea
                            value={editingProduct.description || ""}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, description: e.target.value })
                            }
                            rows={3}
                            placeholder="Write luxury aesthetic and material fabric descriptions..."
                            className="px-3.5 py-2 rounded-xl border border-neutral-200 focus:outline-none focus:border-accent-blue text-xs text-navy-800 bg-neutral-50"
                          />
                        </div>

                        {/* Badges / Status */}
                        <div className="flex gap-4 pt-2">
                          <label className="flex items-center gap-2 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.isNew}
                              onChange={(e) =>
                                setEditingProduct({ ...editingProduct, isNew: e.target.checked })
                              }
                              className="rounded accent-accent-blue"
                            />
                            <span>Mark as "New Release"</span>
                          </label>
                          <label className="flex items-center gap-2 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editingProduct.isFeatured}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  isFeatured: e.target.checked,
                                })
                              }
                              className="rounded accent-accent-blue"
                            />
                            <span>Featured on Homepage</span>
                          </label>
                        </div>
                      </div>

                      {/* Right Block: Image Uploader & Variants */}
                      <div className="space-y-4">
                        {/* Image uploads */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Product Gallery (Multiple Images)
                          </label>
                          <div className="grid grid-cols-4 gap-2.5">
                            {editingProduct.images?.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200"
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeProductImage(idx)}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-sm"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-neutral-300 hover:border-accent-blue bg-neutral-50 flex flex-col items-center justify-center cursor-pointer text-neutral-400 hover:text-accent-blue transition-colors p-2 text-center">
                              <Upload className="w-5 h-5 mb-1" />
                              <span className="text-[8px] font-mono font-medium">UPLOAD IMAGE</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, false)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1">
                            Uploaded images are decoded and stored directly as static files in your `/uploads` server directory.
                          </span>
                        </div>

                        {/* Sizes variant builder */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Sizes Options
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {editingProduct.sizes?.map((sz, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md border text-[10px] font-semibold text-navy-800"
                              >
                                <span>{sz}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      sizes: editingProduct.sizes?.filter((s) => s !== sz),
                                    })
                                  }
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSizeInput}
                              onChange={(e) => setNewSizeInput(e.target.value)}
                              placeholder="e.g. XXL, S, M, L"
                              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs w-full bg-neutral-50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newSizeInput.trim()) {
                                  const sizes = editingProduct.sizes || [];
                                  if (!sizes.includes(newSizeInput.trim())) {
                                    setEditingProduct({
                                      ...editingProduct,
                                      sizes: [...sizes, newSizeInput.trim()],
                                    });
                                  }
                                  setNewSizeInput("");
                                }
                              }}
                              className="px-3 bg-navy-800 text-white rounded-lg hover:bg-accent-blue transition-colors cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Colors variant builder */}
                        <div className="flex flex-col gap-1.5">
                          <label className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                            Colors Options
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {editingProduct.colors?.map((col, idx) => (
                              <span
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md border text-[10px] font-semibold text-navy-800"
                              >
                                <span>{col}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      colors: editingProduct.colors?.filter((c) => c !== col),
                                    })
                                  }
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newColorInput}
                              onChange={(e) => setNewColorInput(e.target.value)}
                              placeholder="e.g. Desert Sand, Obsidian"
                              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs w-full bg-neutral-50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newColorInput.trim()) {
                                  const colors = editingProduct.colors || [];
                                  if (!colors.includes(newColorInput.trim())) {
                                    setEditingProduct({
                                      ...editingProduct,
                                      colors: [...colors, newColorInput.trim()],
                                    });
                                  }
                                  setNewColorInput("");
                                }
                              }}
                              className="px-3 bg-navy-800 text-white rounded-lg hover:bg-accent-blue transition-colors cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-5 py-2.5 rounded-full border border-neutral-200 font-semibold text-neutral-500 hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => apiCall("/api/products", "POST", editingProduct)}
                        className="px-6 py-2.5 rounded-full bg-accent-blue text-white font-semibold hover:bg-navy-800 transition-colors cursor-pointer"
                        id="save-product-btn"
                      >
                        Publish Silhouette
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                      Fashion Categories
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Manage department divisions of the MONZA Luxe catalog.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingCategory({ name: "", slug: "", description: "" })}
                    className="px-5 py-2.5 bg-accent-blue text-white rounded-full text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-navy-800 transition-colors flex items-center gap-2 cursor-pointer"
                    id="add-new-category"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </div>

                {editingCategory && (
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-4 max-w-lg text-xs">
                    <h3 className="font-bold text-navy-800 uppercase tracking-wider">
                      {editingCategory.id ? "Edit Category" : "New Category Division"}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Category Name</label>
                      <input
                        type="text"
                        value={editingCategory.name || ""}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                          })
                        }
                        placeholder="e.g. Knitwear, Overcoats"
                        className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Slug Identifier</label>
                      <input
                        type="text"
                        readOnly
                        value={editingCategory.slug || ""}
                        className="px-3 py-2 rounded-lg border bg-neutral-100 text-neutral-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Description</label>
                      <input
                        type="text"
                        value={editingCategory.description || ""}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, description: e.target.value })
                        }
                        placeholder="Brief collection narrative..."
                        className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-4 py-2 border rounded-full hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => apiCall("/api/categories", "POST", editingCategory)}
                        className="px-5 py-2 bg-accent-blue text-white rounded-full hover:bg-navy-800 transition-colors cursor-pointer"
                        id="save-category-btn"
                      >
                        Save Category
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden divide-y text-xs text-navy-800">
                  {state.categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold">{cat.name}</span>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">/{cat.slug}</p>
                        {cat.description && (
                          <p className="text-[11px] text-neutral-500 mt-1">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-navy-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category ${cat.name}?`)) {
                              apiCall(`/api/categories/${cat.id}`, "DELETE");
                            }
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Boutique Orders
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Process and manage orders, track delivery, and dispatch premium courier statuses.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden text-xs text-navy-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[9px]">
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Items</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {state.orders.map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-50/50">
                            <td className="p-4 font-mono font-bold text-navy-800">{order.id}</td>
                            <td className="p-4">
                              <div className="font-semibold">{order.customerName}</div>
                              <div className="text-[10px] text-neutral-400">{order.email}</div>
                            </td>
                            <td className="p-4">
                              <div className="max-w-[200px] truncate" title={order.items.map(i => `${i.title} (${i.quantity})`).join(", ")}>
                                {order.items.map((i) => `${i.title} (x${i.quantity})`).join(", ")}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-navy-800">
                              {state.currencies.find(c => c.code === state.activeCurrency)?.symbol || "$"}{(order.total * (state.currencies.find(c => c.code === state.activeCurrency)?.rate || 1)).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  apiCall(`/api/orders/${order.id}/status`, "POST", {
                                    status: e.target.value,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border focus:outline-none ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : order.status === "Shipped"
                                      ? "bg-purple-50 text-purple-600 border-purple-200"
                                      : order.status === "Processing"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : order.status === "Cancelled"
                                          ? "bg-red-50 text-red-500 border-red-200"
                                          : "bg-amber-50 text-amber-600 border-amber-200"
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-[10px] text-neutral-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMERS TAB */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Boutique Customers
                  </h2>
                  <p className="text-xs text-neutral-500">
                    A collection of client accounts, total luxury spending, and registration histories.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden text-xs text-navy-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[9px]">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4 text-center">Orders</th>
                          <th className="p-4">Total Spent</th>
                          <th className="p-4 text-right">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {state.customers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-neutral-50/50">
                            <td className="p-4 font-semibold text-navy-800">{cust.name}</td>
                            <td className="p-4 font-mono">{cust.email}</td>
                            <td className="p-4 text-center">{cust.ordersCount}</td>
                            <td className="p-4 font-bold text-navy-800">
                              {state.currencies.find(c => c.code === state.activeCurrency)?.symbol || "$"}{(cust.totalSpent * (state.currencies.find(c => c.code === state.activeCurrency)?.rate || 1)).toLocaleString()}
                            </td>
                            <td className="p-4 text-right text-neutral-400 text-[10px]">
                              {new Date(cust.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Customer Reviews
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Moderate customer feedback, ratings, and active website placements.
                  </p>
                </div>

                <div className="space-y-4">
                  {state.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs text-xs text-navy-800 flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{rev.customerName}</span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-[10px] text-neutral-400">{rev.productTitle}</span>
                        </div>
                        {/* Star Rating display */}
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="text-sm">
                              {i < rev.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <p className="text-neutral-600 leading-relaxed italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-neutral-400 block mt-2">
                          Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() =>
                            apiCall(`/api/reviews/${rev.id}/approve`, "POST", {
                              approved: !rev.approved,
                            })
                          }
                          className={`px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1 ${
                            rev.approved
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          {rev.approved ? "Approved" : "Approve Placement"}
                        </button>
                        <button
                          onClick={() => apiCall(`/api/reviews/${rev.id}`, "DELETE")}
                          className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JOURNAL / BLOGS TAB */}
            {activeTab === "blogs" && (
              <div className="space-y-6">
                {!editingBlog ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                          Fashion Journal Editor
                        </h2>
                        <p className="text-xs text-neutral-500">
                          Publish collections, design philosophies, and editorial narratives.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setEditingBlog({
                            title: "",
                            excerpt: "",
                            content: "",
                            author: "Creative Director",
                          })
                        }
                        className="px-5 py-2.5 bg-accent-blue text-white rounded-full text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-navy-800 transition-colors flex items-center gap-2 cursor-pointer"
                        id="add-new-blog"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Write Journal Post</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {state.blogPosts.map((blog) => (
                        <div
                          key={blog.id}
                          className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs flex flex-col justify-between"
                        >
                          <div className="text-xs">
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {blog.date} · {blog.author}
                            </span>
                            <h3 className="text-sm font-bold text-navy-800 mt-1.5 mb-2 line-clamp-1">
                              {blog.title}
                            </h3>
                            <p className="text-neutral-500 line-clamp-2 leading-relaxed">
                              {blog.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-end gap-1.5 mt-4 pt-3 border-t">
                            <button
                              onClick={() => setEditingBlog(blog)}
                              className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-navy-800 rounded-lg transition-colors"
                              id={`edit-blog-${blog.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete journal article "${blog.title}"?`)) {
                                  apiCall(`/api/blogs/${blog.id}`, "DELETE");
                                }
                              }}
                              className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* BLOG FORM */
                  <div className="p-6 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h3 className="font-bold text-navy-800 uppercase tracking-wider">
                        {editingBlog.id ? "Edit Journal Article" : "Compose Journal Article"}
                      </h3>
                      <button
                        onClick={() => setEditingBlog(null)}
                        className="p-1 text-neutral-400 hover:text-navy-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Article Title</label>
                      <input
                        type="text"
                        value={editingBlog.title || ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                        placeholder="e.g. The Structural Elegance of Cashmere Weave"
                        className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Author</label>
                        <input
                          type="text"
                          value={editingBlog.author || ""}
                          onChange={(e) =>
                            setEditingBlog({ ...editingBlog, author: e.target.value })
                          }
                          className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Cover Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingBlog.coverImage || ""}
                            onChange={(e) =>
                              setEditingBlog({ ...editingBlog, coverImage: e.target.value })
                            }
                            placeholder="Enter image URL..."
                            className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none w-full"
                          />
                          <label className="px-3 py-2 bg-navy-800 text-white rounded-lg hover:bg-accent-blue cursor-pointer flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Brief Excerpt</label>
                      <input
                        type="text"
                        value={editingBlog.excerpt || ""}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, excerpt: e.target.value })
                        }
                        placeholder="Snippet appearing on list panels..."
                        className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Article Content (HTML allowed)</label>
                      <textarea
                        value={editingBlog.content || ""}
                        onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                        rows={10}
                        placeholder="Write article. HTML paragraphs <p> are recommended..."
                        className="px-3.5 py-2 rounded-lg border bg-neutral-50 focus:outline-none font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        onClick={() => setEditingBlog(null)}
                        className="px-5 py-2.5 border rounded-full hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => apiCall("/api/blogs", "POST", editingBlog)}
                        className="px-6 py-2.5 bg-accent-blue text-white rounded-full hover:bg-navy-800 transition-colors cursor-pointer"
                        id="save-blog-btn"
                      >
                        Publish Article
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                      Discount Coupon Codes
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Manage promotional codes, campaign tags, and spend bounds.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingCoupon({ code: "", type: "percentage", value: 10, active: true })}
                    className="px-5 py-2.5 bg-accent-blue text-white rounded-full text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-navy-800 transition-colors flex items-center gap-2 cursor-pointer"
                    id="add-new-coupon"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Promo Code</span>
                  </button>
                </div>

                {editingCoupon && (
                  <div className="p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-xs space-y-4 max-w-lg text-xs">
                    <h3 className="font-bold text-navy-800 uppercase tracking-wider">
                      {editingCoupon.id ? "Edit Promo Code" : "Create Promotional Campaign"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Campaign Code</label>
                        <input
                          type="text"
                          value={editingCoupon.code || ""}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g. AWNEW15"
                          className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Discount Model</label>
                        <select
                          value={editingCoupon.type || ""}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, type: e.target.value as any })
                          }
                          className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                        >
                          <option value="percentage">Percentage Off (%)</option>
                          <option value="fixed">Fixed Currency Off ($)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Promo Value</label>
                        <input
                          type="number"
                          value={editingCoupon.value || 0}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })
                          }
                          className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Minimum Basket Spend</label>
                        <input
                          type="number"
                          value={editingCoupon.minSpend || ""}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, minSpend: parseFloat(e.target.value) || undefined })
                          }
                          placeholder="e.g. 100"
                          className="px-3 py-2 rounded-lg border bg-neutral-50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingCoupon.active}
                          onChange={(e) =>
                            setEditingCoupon({ ...editingCoupon, active: e.target.checked })
                          }
                          className="rounded accent-accent-blue"
                        />
                        <span>Campaign Active & Checkout Verified</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingCoupon(null)}
                        className="px-4 py-2 border rounded-full hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => apiCall("/api/coupons", "POST", editingCoupon)}
                        className="px-5 py-2 bg-accent-blue text-white rounded-full hover:bg-navy-800 transition-colors cursor-pointer"
                        id="save-coupon-btn"
                      >
                        Deploy Campaign
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-neutral-200/60 overflow-hidden divide-y text-xs text-navy-800">
                  {state.coupons.map((coup) => (
                    <div key={coup.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 font-mono font-bold tracking-wider">
                          {coup.code}
                        </div>
                        <div>
                          <span className="font-bold">
                            {coup.type === "percentage" ? `${coup.value}% off` : `$${coup.value} off`}
                          </span>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Min spend: ${coup.minSpend || 0} · status: {coup.active ? "Live" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingCoupon(coup)}
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-navy-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete coupon code ${coup.code}?`)) {
                              apiCall(`/api/coupons/${coup.id}`, "DELETE");
                            }
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CMS / HOMEPAGE SECTIONS TAB */}
            {activeTab === "cms" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Homepage Sections & Content
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Edit banners, titles, buttons, stories, and background pictures in real-time.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-xs p-6 space-y-6 text-xs text-navy-800">
                  {/* Hero Settings */}
                  <div className="space-y-4">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2">
                      Full-Screen Hero Showcase
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Showcase Main Header</label>
                        <input
                          type="text"
                          value={state.cms.hero.title}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.hero.title = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Showcase Subtitle / Tag</label>
                        <input
                          type="text"
                          value={state.cms.hero.subtitle}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.hero.subtitle = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Showcase Description Narrative</label>
                      <textarea
                        value={state.cms.hero.description}
                        onChange={(e) => {
                          const updated = { ...state.cms };
                          updated.hero.description = e.target.value;
                          onUpdateState({ ...state, cms: updated });
                        }}
                        rows={3}
                        className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Primary Button Label</label>
                        <input
                          type="text"
                          value={state.cms.hero.buttonText}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.hero.buttonText = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Hero Background Picture</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={state.cms.hero.backgroundImage}
                            onChange={(e) => {
                              const updated = { ...state.cms };
                              updated.hero.backgroundImage = e.target.value;
                              onUpdateState({ ...state, cms: updated });
                            }}
                            placeholder="Fallback background url..."
                            className="px-3 py-2 rounded-lg border bg-slate-50 focus:outline-none w-full"
                          />
                          <label className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-accent-blue cursor-pointer flex items-center justify-center shrink-0">
                            <Upload className="w-4 h-4 mr-1.5" />
                            <span>UPLOAD HERO</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Brand Narrative / About Us */}
                  <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2">
                      Brand Philosophy & Narrative
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">MONZA Story Narrative</label>
                      <textarea
                        value={state.cms.about.story}
                        onChange={(e) => {
                          const updated = { ...state.cms };
                          updated.about.story = e.target.value;
                          onUpdateState({ ...state, cms: updated });
                        }}
                        rows={3}
                        className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Design Philosophy</label>
                      <textarea
                        value={state.cms.about.philosophy}
                        onChange={(e) => {
                          const updated = { ...state.cms };
                          updated.about.philosophy = e.target.value;
                          onUpdateState({ ...state, cms: updated });
                        }}
                        rows={3}
                        className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-4 pt-4 border-t border-neutral-100">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2">
                      Store Contact Details & Footer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Concierge Email</label>
                        <input
                          type="email"
                          value={state.cms.contact.email}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.contact.email = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Inquiry Phone</label>
                        <input
                          type="text"
                          value={state.cms.contact.phone}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.contact.phone = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-neutral-500">Atelier / Physical Boutique Address</label>
                      <input
                        type="text"
                        value={state.cms.contact.address}
                        onChange={(e) => {
                          const updated = { ...state.cms };
                          updated.contact.address = e.target.value;
                          onUpdateState({ ...state, cms: updated });
                        }}
                        className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Instagram Handle</label>
                        <input
                          type="text"
                          value={state.cms.contact.instagram}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.contact.instagram = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Facebook Page</label>
                        <input
                          type="text"
                          value={state.cms.contact.facebook}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.contact.facebook = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Pinterest Board</label>
                        <input
                          type="text"
                          value={state.cms.contact.pinterest}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.contact.pinterest = e.target.value;
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3.5 py-2 rounded-lg border bg-slate-50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => apiCall("/api/cms", "POST", state.cms)}
                      className="px-6 py-2.5 bg-accent-blue text-white rounded-full font-bold uppercase tracking-wider hover:bg-navy-800 transition-colors cursor-pointer"
                      id="save-cms-btn"
                    >
                      Publish CMS Content
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CURRENCIES & CONFIG SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-navy-800 mb-1">
                    Boutique Configuration Settings
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Manage boutique currencies, SEO search terms, premium shipping methods, and email designs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-navy-800">
                  {/* Currencies Management */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs space-y-4">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Exchange Currencies</span>
                    </h3>
                    <div className="space-y-3">
                      {state.currencies.map((curr) => (
                        <div key={curr.code} className="flex items-center justify-between gap-4 p-2 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-navy-800">{curr.code}</span>
                            <span className="text-neutral-400 font-mono">({curr.symbol})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-400">Rate (vs USD):</span>
                            <input
                              type="number"
                              step="0.01"
                              value={curr.rate}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 1;
                                const updatedCurrencies = state.currencies.map((c) =>
                                  c.code === curr.code ? { ...c, rate: val } : c
                                );
                                onUpdateState({ ...state, currencies: updatedCurrencies });
                              }}
                              className="px-2.5 py-1 rounded border w-24 text-right font-mono bg-white text-navy-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => apiCall("/api/settings", "POST", { currencies: state.currencies })}
                          className="px-4 py-2 bg-navy-800 text-white rounded-full font-semibold hover:bg-accent-blue transition-colors cursor-pointer"
                        >
                          Save Currency Rates
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SEO Configuration */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs space-y-4">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>SEO & Meta Titles</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Website Title Meta Tag</label>
                        <input
                          type="text"
                          value={state.cms.seo?.metaTitle || ""}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.seo = { ...updated.seo, metaTitle: e.target.value };
                            onUpdateState({ ...state, cms: updated });
                          }}
                          className="px-3 py-2 rounded-lg border bg-neutral-50"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Meta Description Tag</label>
                        <textarea
                          value={state.cms.seo?.metaDescription || ""}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.seo = { ...updated.seo, metaDescription: e.target.value };
                            onUpdateState({ ...state, cms: updated });
                          }}
                          rows={3}
                          className="px-3 py-2 rounded-lg border bg-neutral-50"
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => apiCall("/api/cms", "POST", state.cms)}
                          className="px-4 py-2 bg-navy-800 text-white rounded-full font-semibold hover:bg-accent-blue transition-colors cursor-pointer"
                        >
                          Save Search Metadata
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Methods Setup */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs space-y-4 md:col-span-2">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>Premium Courier Shipping Methods</span>
                    </h3>
                    <div className="space-y-3">
                      {state.shippingMethods.map((ship, idx) => (
                        <div key={ship.id} className="grid grid-cols-3 gap-4 items-center p-3 bg-neutral-50 rounded-xl">
                          <div className="flex flex-col">
                            <span className="font-bold">{ship.name}</span>
                            <span className="text-[10px] text-neutral-400">{ship.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-400">Price ($ USD):</span>
                            <input
                              type="number"
                              value={ship.price}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updatedShipping = state.shippingMethods.map((s, sIdx) =>
                                  sIdx === idx ? { ...s, price: val } : s
                                );
                                onUpdateState({ ...state, shippingMethods: updatedShipping });
                              }}
                              className="px-2.5 py-1 rounded border w-24 text-right font-mono bg-white text-navy-800 focus:outline-none"
                            />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ID: {ship.id}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => apiCall("/api/store", "POST", state)}
                          className="px-4 py-2 bg-navy-800 text-white rounded-full font-semibold hover:bg-accent-blue transition-colors cursor-pointer"
                        >
                          Save Shipping Prices
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Templates */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs space-y-4 md:col-span-2">
                    <h3 className="font-bold uppercase tracking-wider text-accent-blue border-b pb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Transactional Email Notifications Templates</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Order Placed Template</label>
                        <textarea
                          value={state.cms.emailTemplates?.orderPlaced || ""}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.emailTemplates = { ...updated.emailTemplates, orderPlaced: e.target.value };
                            onUpdateState({ ...state, cms: updated });
                          }}
                          rows={3}
                          className="px-3.5 py-2 rounded-lg border bg-neutral-50 font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-semibold text-neutral-500">Order Shipped Dispatch Template</label>
                        <textarea
                          value={state.cms.emailTemplates?.orderShipped || ""}
                          onChange={(e) => {
                            const updated = { ...state.cms };
                            updated.emailTemplates = { ...updated.emailTemplates, orderShipped: e.target.value };
                            onUpdateState({ ...state, cms: updated });
                          }}
                          rows={3}
                          className="px-3.5 py-2 rounded-lg border bg-neutral-50 font-mono text-[11px]"
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => apiCall("/api/cms", "POST", state.cms)}
                          className="px-6 py-2.5 bg-accent-blue text-white rounded-full font-bold uppercase tracking-wider hover:bg-navy-800 transition-colors cursor-pointer"
                        >
                          Save Notification Templates
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
