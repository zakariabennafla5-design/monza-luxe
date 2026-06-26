import React from "react";
import { CMSContent } from "../types";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  cms: CMSContent;
  onCtaClick: () => void;
  t?: {
    heroSubtitle: string;
    heroTitle: string;
    heroDescription: string;
    heroButton: string;
  };
  isDarkMode?: boolean;
}

export default function Hero({ cms, onCtaClick, t, isDarkMode = true }: HeroProps) {
  const monzaBgImg = "/src/assets/images/monza_tees_bg_1782496197645.jpg";
  const bgImg = cms.hero.backgroundImage || monzaBgImg;

  const subtitle = t ? t.heroSubtitle : (cms.hero.subtitle || "AUTUMN / WINTER 2026");
  const title = t ? t.heroTitle : (cms.hero.title || "MONZA LUXE");
  const description = t ? t.heroDescription : (cms.hero.description || "A study in silent elegance, immaculate tailoring, and heavy-weight textures. Experience contemporary high-end silhouettes crafted intentionally for the modern wardrobe.");
  const buttonText = t ? t.heroButton : (cms.hero.buttonText || "EXPLORE THE EDIT");

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-navy-900 select-none">
      {/* Background Image / Mesh Fallback */}
      <div className="absolute inset-0 z-0">
        {bgImg ? (
          <img
            src={bgImg}
            alt="MONZA Luxe Hero"
            className="w-full h-full object-cover transform scale-102 animate-[pulse_8s_infinite_alternate]"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* A gorgeous, dark-navy fashion mesh gradient that acts as a fallback before custom upload */
          <div className="w-full h-full relative bg-gradient-to-tr from-navy-900 via-navy-800 to-navy-700">
            {/* Elegant luxury background lighting */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/15 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: "12s" }} />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: "8s" }} />
            
            {/* Minimal line grid reflecting fashion design blueprints */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            {/* Fashion hanger vector graphic backdrops */}
            <div className="absolute bottom-10 left-10 text-white/[0.02] text-9xl font-semibold select-none hidden md:block">
              M O N Z A
            </div>
            <div className="absolute top-10 right-10 text-white/[0.02] text-9xl font-semibold select-none hidden md:block">
              L U X E
            </div>
          </div>
        )}

        {/* Cinematic dark blue overlay as requested to keep texts fully readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/60 to-navy-900/80 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl px-6 text-center flex flex-col items-center">
        {/* Collection Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-milk-dark text-white/90 text-xs font-mono uppercase tracking-[0.3em] mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-blue animate-pulse" />
          <span>{subtitle}</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="font-display text-5xl md:text-[104px] font-extrabold text-white tracking-[-0.04em] uppercase mb-6 drop-shadow-2xl"
          style={{ lineHeight: "0.9" }}
        >
          {title}
        </motion.h1>

        {/* Narrative Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-white/80 text-sm md:text-lg font-light leading-relaxed max-w-2xl tracking-wide mb-10 drop-shadow-md font-sans"
        >
          {description}
        </motion.p>

        {/* Animated CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onCtaClick}
            className="group relative px-9 py-4.5 bg-white hover:bg-white/90 text-navy-800 font-display text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
            id="hero-primary-cta"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Cinematic subtle bottom fading */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${isDarkMode ? "from-[#0A163B]" : "from-[#F8FAFC]"} to-transparent z-15 pointer-events-none transition-colors duration-500`} />
    </div>
  );
}
