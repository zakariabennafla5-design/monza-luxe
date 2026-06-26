import React from "react";
import { Product } from "../types";
import { Heart, ShoppingBag, Eye, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  currencySymbol: string;
  currencyRate: number;
  isWishlisted: boolean;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
  activeLanguage?: string;
}

export default function ProductCard({
  product,
  currencySymbol,
  currencyRate,
  isWishlisted,
  onQuickView,
  onToggleWishlist,
  onAddToCartDirect,
  activeLanguage = "EN",
}: ProductCardProps) {
  const convertedPrice = Math.round(product.price * currencyRate);
  const convertedOriginalPrice = product.originalPrice
    ? Math.round(product.originalPrice * currencyRate)
    : null;

  const getStockText = () => {
    if (product.stock > 5) {
      if (activeLanguage === "AR") return "متوفر في المخزن";
      if (activeLanguage === "FR") return "En stock";
      if (activeLanguage === "IT") return "Disponibile";
      return "In Stock";
    }
    if (product.stock > 0) {
      if (activeLanguage === "AR") return `متبقي ${product.stock} قطع فقط`;
      if (activeLanguage === "FR") return `Plus que ${product.stock} pièces`;
      if (activeLanguage === "IT") return `Solo ${product.stock} rimasti`;
      return `Only ${product.stock} left`;
    }
    if (activeLanguage === "AR") return "نفدت الكمية";
    if (activeLanguage === "FR") return "En rupture de stock";
    if (activeLanguage === "IT") return "Esaurito";
    return "Out of stock";
  };

  const getBadgeNewText = () => {
    if (activeLanguage === "AR") return "جديد";
    if (activeLanguage === "FR") return "Nouveau";
    if (activeLanguage === "IT") return "Nuovo";
    return "New";
  };

  const getBadgeFeaturedText = () => {
    if (activeLanguage === "AR") return "مميز";
    if (activeLanguage === "FR") return "Vedette";
    if (activeLanguage === "IT") return "In evidenza";
    return "Featured";
  };

  const getCategoryName = (name: string) => {
    if (name === "Coats & Jackets" || name === "Coats and Jackets") {
      if (activeLanguage === "AR") return "المعاطف والسترات";
      if (activeLanguage === "FR") return "Manteaux & Vestes";
      if (activeLanguage === "IT") return "Capotti & Giacche";
    }
    if (name === "Cashmere Knitwear") {
      if (activeLanguage === "AR") return "ملابس صوف الكشمير";
      if (activeLanguage === "FR") return "Tricots en Cachemire";
      if (activeLanguage === "IT") return "Maglieria in Cashmere";
    }
    if (name === "Tailored Trousers") {
      if (activeLanguage === "AR") return "السراويل المصممة";
      if (activeLanguage === "FR") return "Pantalons Tailleur";
      if (activeLanguage === "IT") return "Pantaloni Sartoriali";
    }
    return name;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col h-full rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-lg border border-white/10 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Badge container */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="px-3 py-1 text-[10px] tracking-widest uppercase font-semibold bg-navy-800 text-white rounded-full">
            {getBadgeNewText()}
          </span>
        )}
        {product.isFeatured && (
          <span className="px-3 py-1 text-[10px] tracking-widest uppercase font-semibold bg-amber-500/90 text-white rounded-full">
            {getBadgeFeaturedText()}
          </span>
        )}
        {product.discount && (
          <span className="px-3 py-1 text-[10px] tracking-widest uppercase font-semibold bg-red-500 text-white rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full glass-milk hover:bg-navy-800 hover:text-white transition-all duration-300 text-navy-800 shadow-sm"
        id={`wishlist-btn-${product.id}`}
        aria-label="Add to wishlist"
      >
        <Heart
          className="w-4 h-4"
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>

      {/* Image Area */}
      <div className="relative aspect-[3/4] bg-white/[0.02] flex items-center justify-center overflow-hidden border-b border-white/5">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High-quality minimal placeholder requested */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white/[0.02] to-white/[0.05] text-white/30">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-sm mb-3 text-white/40 group-hover:scale-110 transition-transform duration-300">
              <ImageIcon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <span className="text-[11px] font-display uppercase tracking-widest font-medium text-white/70 text-center">
              Image Pending
            </span>
            <span className="text-[9px] text-white/40 text-center mt-1 max-w-[150px]">
              Ready for your custom brand photography in Admin panel
            </span>
          </div>
        )}

        {/* Hover Controls Overlay */}
        <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onQuickView(product)}
            className="p-3 rounded-full bg-white text-navy-800 hover:bg-navy-800 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-md"
            id={`quickview-btn-${product.id}`}
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
          {product.stock > 0 && (
            <button
              onClick={() => onAddToCartDirect(product)}
              className="p-3 rounded-full bg-white text-navy-800 hover:bg-accent-blue hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-md delay-75"
              id={`addcart-btn-${product.id}`}
              title="Quick Add"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-1.5">
          {getCategoryName(product.category)}
        </span>
        <h3 className="font-display text-sm font-medium text-navy-800 line-clamp-1 group-hover:text-accent-blue transition-colors mb-2">
          {product.title}
        </h3>
        
        {/* Color and size quick dots */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span
                key={idx}
                className="w-2 h-2 rounded-full border border-neutral-300 bg-neutral-200"
                title={col}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[8px] text-neutral-400">+{product.colors.length - 3}</span>
            )}
          </div>
          <span className="w-1 h-1 rounded-full bg-neutral-300" />
          <div className="flex gap-1 text-[9px] font-mono text-neutral-400 uppercase">
            {product.sizes.join("·")}
          </div>
        </div>

        {/* Price & Cart CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-sm font-semibold text-navy-800">
              {currencySymbol}
              {convertedPrice.toLocaleString()}
            </span>
            {convertedOriginalPrice && (
              <span className="font-display text-[11px] line-through text-neutral-400">
                {currencySymbol}
                {convertedOriginalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <span className={`text-[10px] font-mono font-medium uppercase tracking-wider ${
            product.stock > 5 
              ? "text-emerald-600" 
              : product.stock > 0 
                ? "text-amber-600" 
                : "text-red-500"
          }`}>
            {getStockText()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
