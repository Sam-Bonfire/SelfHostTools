import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, TrendingUp, Home, Umbrella, Flame, Briefcase, Lock, GraduationCap, Hammer, MapPin, Search, X, ChevronLeft, ChevronRight, MessageSquarePlus, Zap, Activity, Rocket, Car, FileText, Globe, Camera, ShieldAlert } from 'lucide-react';
import { Card, Button, Input, Footer } from '@packages/styling';
import { motion, AnimatePresence } from 'framer-motion';

import SEO from './SEO';
import { usePersistedState, resetPersistedState } from '@packages/components';

const CALCULATORS = [
  {
    path: "/education-loan",
    name: "Education Loan",
    desc: "Calculate EMI, moratorium interest, and prepayment savings. Plan your repayment strategy effectively.",
    category: "Finance",
    icon: Calculator,
    color: "bg-[#7EAAFF]",
    textColor: "text-black"
  },
  {
    path: "/sip-calculator",
    name: "SIP Calculator",
    desc: "Estimate future wealth from your monthly investments. Includes Annual Step-Up logic.",
    category: "Investment",
    icon: TrendingUp,
    color: "bg-[#FFDE59]",
    textColor: "text-black"
  },
  {
    path: "/home-loan-vs-rent",
    name: "Buy vs Rent",
    desc: "The 'Buy or Bye' reality check. Compare ownership costs vs. renting and investing the difference.",
    category: "Housing",
    icon: Home,
    color: "bg-[#7EAAFF]",
    textColor: "text-black"
  },
  {
    path: "/home-owner-realist",
    name: "Home Warning",
    desc: "The 'Sinking Fund' Realist. Calculate the hidden maintenance bombs and true cost of ownership.",
    category: "Housing",
    icon: Hammer,
    color: "bg-[#FF9900]",
    textColor: "text-black"
  },
  {
    path: "/fire-calculator",
    name: "FIRE / Retirement",
    desc: "Calculate your path to financial freedom. Factor in healthcare inflation and post-retirement taxes.",
    category: "Freedom",
    icon: Flame,
    color: "bg-orange-400",
    textColor: "text-black"
  },
  {
    path: "/life-insurance-calculator",
    name: "Life Cover (HLV)",
    desc: "Find your Human Life Value. Calculate coverage needed for liabilities, family income, and future goals.",
    category: "Security",
    icon: Umbrella,
    color: "bg-emerald-400",
    textColor: "text-black"
  },
  {
    path: "/golden-handcuffs",
    name: "Golden Handcuffs",
    desc: "Should you quit? Calculate the true financial cost of walking away from unvested equity and clawbacks.",
    category: "Career",
    icon: Lock,
    color: "bg-yellow-300",
    textColor: "text-black"
  },
  {
    path: "/freelance-calculator",
    name: "Freelance 'Real' Pay",
    desc: "Calculate your true take-home pay after overheads, unpaid admin time, and benefits replacement.",
    category: "Business",
    icon: Briefcase,
    color: "bg-purple-400",
    textColor: "text-black"
  },
  {
    path: "/true-hourly-wage",
    name: "True Hourly Wage",
    desc: "The 'Wake Up Call'. Calculate your real earnings per hour after commute, taxes, and life maintenance costs.",
    category: "Career",
    icon: Briefcase,
    color: "bg-red-400",
    textColor: "text-black"
  },
  {
    path: "/degree-roi",
    name: "Degree ROI",
    desc: "Is college worth it? Compare the 20-year ROI of a degree vs entering the workforce immediately.",
    category: "Education",
    icon: GraduationCap,
    color: "bg-blue-600",
    textColor: "text-white",
    iconColor: "text-white"
  },
  {
    path: "/job-relocation",
    name: "Job Relocation",
    desc: "Should you move? Calculate the true financial impact of relocating for a job, including hidden costs & lifestyle changes.",
    category: "Career",
    icon: MapPin,
    color: "bg-teal-400",
    textColor: "text-black"
  },
  {
    path: "/tdee-calculator",
    name: "TDEE & BMR",
    desc: "Fitness starts here. Calculate your maintenance calories and get custom targets for cutting or bulking.",
    category: "Health",
    icon: Flame,
    color: "bg-pink-400",
    textColor: "text-black"
  },
  {
    path: "/invest-vs-payoff",
    name: "Invest vs Payoff",
    desc: "The eternal dilemma solved. Compare net worth outcomes of investing surplus vs aggressively paying debt.",
    category: "Strategy",
    icon: TrendingUp,
    color: "bg-lime-400",
    textColor: "text-black"
  },
  {
    path: "/alternate-investment",
    name: "Active vs Passive",
    desc: "The 'Sweat Equity' check. Calculate real ROI of businesses/rentals by deducting your time cost & inflation.",
    category: "Business",
    icon: Briefcase,
    color: "bg-cyan-400",
    textColor: "text-black"
  },
  {
    path: "/saas-leak",
    name: "SaaS Subscription Leak",
    desc: "Calculate the compound opportunity cost of your subscriptions. See how compounding returns and active labor hours drain your wealth.",
    category: "Finance",
    icon: Flame,
    color: "bg-rose-400",
    textColor: "text-black"
  },
  {
    path: "/time-buyback",
    name: "Time Buy-Back Delegate",
    desc: "Should you outsource that chore? Calculate delegation ROI using your true net hourly wage, energy drain multipliers, and reinvestment upside.",
    category: "Career",
    icon: Zap,
    color: "bg-violet-400",
    textColor: "text-black"
  },
  {
    path: "/inflation-destroyer",
    name: "Inflation Destroyer",
    desc: "Watch inflation silently devour your cash savings. Translate rupee erosion into real goods lost and compare against market investing.",
    category: "Finance",
    icon: Flame,
    color: "bg-orange-500",
    textColor: "text-white"
  },
  {
    path: "/lifestyle-creep",
    name: "Lifestyle Creep",
    desc: "The silent wealth destroyer. See what happens when you spend your raise vs. invest it over 20 years.",
    category: "Finance",
    icon: Activity,
    color: "bg-rose-500",
    textColor: "text-white"
  },
  {
    path: "/solo-founder-runway",
    name: "Solo-Founder Runway",
    desc: "Find your true Break-Even and Freedom MRR. Deducts Stripe fees, hosting, churn, and taxes.",
    category: "Strategy",
    icon: Rocket,
    color: "bg-purple-500",
    textColor: "text-white"
  },
  {
    path: "/car-ownership",
    name: "Car Ownership Realist",
    desc: "Expose the hidden costs of depreciation, interest, and maintenance. Find your true cost per month.",
    category: "Finance",
    icon: Car,
    color: "bg-orange-500",
    textColor: "text-white"
  },
  {
    path: "/tax-bracket",
    name: "Tax Bracket Optimizer",
    desc: "Standard vs Itemized Deductions? Find the exact tax-saving strategy for your income.",
    category: "Finance",
    icon: FileText,
    color: "bg-emerald-500",
    textColor: "text-white"
  },
  {
    path: "/international-arbitrage",
    name: "International Arbitrage",
    desc: "Model local currency value, PPP ratios, and compute net worth velocity change across borders.",
    category: "Strategy",
    icon: Globe,
    color: "bg-blue-600",
    textColor: "text-white"
  },
  {
    path: "/creator-economy",
    name: "Creator Economy Quoter",
    desc: "Reverse-engineer your income based on subs and open rates to find your optimal sponsor pricing.",
    category: "Freelance",
    icon: Camera,
    color: "bg-pink-500",
    textColor: "text-white"
  },
  {
    path: "/emergency-fund",
    name: "Emergency Fund Cushion",
    desc: "Customize your cash cushion based on expense volatility, job search duration, and liquid assets.",
    category: "Finance",
    icon: ShieldAlert,
    color: "bg-red-600",
    textColor: "text-white"
  }
];

export default function Root() {
  const [searchQuery, setSearchQuery] = usePersistedState('Root', 'searchQuery', "");
  const [selectedCategory, setSelectedCategory] = usePersistedState('Root', 'selectedCategory', "All");
  const [isSearchExpanded, setIsSearchExpanded] = usePersistedState('Root', 'isSearchExpanded', () => {
    // Default to expanded on mobile (window width < 768px)
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const scrollContainerRef = React.useRef(null);
  const itemsRef = React.useRef({});

  const categories = useMemo(() => {
    const cats = new Set(CALCULATORS.map(c => c.category));
    return ["All", ...Array.from(cats)];
  }, []);

  // Handle auto-expansion on mobile resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSearchExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCalculators = useMemo(() => {
    return CALCULATORS.filter(calc => {
      const matchesCategory = selectedCategory === "All" || calc.category === selectedCategory;
      const matchesSearch =
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryColors = useMemo(() => {
    const colors = { "All": "bg-gray-200" };
    CALCULATORS.forEach(calc => {
      if (!colors[calc.category]) {
        // Extract the bg color class
        colors[calc.category] = calc.color;
      }
    });
    return colors;
  }, []);

  const toggleSearch = () => {
    if (isSearchExpanded) {
      // If closing, clear search? Optional. Let's keep it user friendly and NOT clear immediately unless intended.
      // Actually, standard behavior is usually click to open, click X to close/clear.
      if (!searchQuery) setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
    }
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    setSearchQuery("");
    setIsSearchExpanded(false);
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);

    // Auto-scroll logic
    const element = itemsRef.current[cat];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Calculators Hub",
    "url": `${import.meta.env.VITE_SITE_URL}`,
    "description": "A hub for various calculators, including financial, educational, and more.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${import.meta.env.VITE_SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Calculators Hub"
        description="A hub for various calculators, including financial, educational, and more. Plan your future with our easy-to-use tools."
        keywords="calculators, financial planning, money tools, retirement, education, investment, savings, wealth growth"
        canonical={`${import.meta.env.VITE_SITE_URL}`}
        ogImage={`${import.meta.env.VITE_SITE_URL}/og/home.png`}
        structuredData={structuredData}
      />
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <header className="mb-8 text-center">
          <motion.div
            initial={{ rotate: -2 }}
            whileHover={{ scale: 1.02, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="inline-block p-4 md:p-6 bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 cursor-default relative w-full md:w-auto mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/images/mascot/mascot_64.webp 64w, /images/mascot/mascot_128.webp 128w, /images/mascot/mascot_256.webp 256w"
                  sizes="(max-width: 768px) 64px, 80px"
                />
                <source
                  type="image/png"
                  srcSet="/images/mascot/mascot_64.png 64w, /images/mascot/mascot_128.png 128w, /images/mascot/mascot_256.png 256w"
                  sizes="(max-width: 768px) 64px, 80px"
                />
                <img
                  src="/images/mascot/mascot_128.png"
                  alt="Mascot"
                  width={100}
                  height={100}
                  className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] object-contain"
                />
              </picture>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight text-center md:text-left">
                Calculators Hub
              </h1>
            </div>
          </motion.div>

          {/* Controls Row: Filters & Search */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mt-12 mb-2">

            {/* Category Filters - Scrollable with Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
              <button
                onClick={() => scroll('left')}
                className="p-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all hidden md:flex"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide py-2 md:py-4 px-2 w-full md:w-auto mask-linear-gradient"
                style={{ scrollBehavior: 'smooth' }}
              >
                {categories.map(cat => {
                  const isActive = selectedCategory === cat;
                  const colorClass = categoryColors[cat] || "bg-gray-200";

                  return (
                    <button
                      key={cat}
                      ref={el => itemsRef.current[cat] = el}
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex-shrink-0 px-4 py-2 text-xs md:text-sm font-black uppercase border-2 border-black transition-all ${colorClass} text-black ${isActive
                        ? 'opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-110 z-10'
                        : 'opacity-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-100 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scroll('right')}
                className="p-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all hidden md:flex"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar - Expandable */}
            <div className="relative w-full md:w-auto flex justify-end">
              <motion.div
                layout
                initial={false}
                animate={{ width: isSearchExpanded ? '100%' : '3rem' }}
                className={`overflow-hidden h-10 md:h-12 bg-white border-2 border-black flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-200`}
                style={{
                  width: isSearchExpanded ? 'var(--expanded-width, 100%)' : '3rem',
                  '--expanded-width': typeof window !== 'undefined' && window.innerWidth > 768 ? '300px' : '100%'
                }}
              >
                {/* Search Icon / Toggle */}
                <button
                  onClick={toggleSearch}
                  className="w-12 h-full flex items-center justify-center flex-shrink-0 hover:bg-yellow-300 transition-colors border-r-2 border-black"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Input (only visible when expanded) */}
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center pr-2"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full h-full border-none outline-none bg-transparent px-2 font-bold text-sm"
                        autoFocus
                      />
                      <button
                        onClick={handleClearSearch}
                        className="p-1 hover:bg-gray-200 rounded-full"
                        aria-label="Clear Search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Calculators Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="main">
          <AnimatePresence mode="popLayout">
            {filteredCalculators.map((calc) => (
              <motion.div
                key={calc.path}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link to={calc.path} className="group block h-full decoration-transparent">
                  <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                    <div className={`${calc.color} p-6 border-b-4 border-black flex items-center justify-between`}>
                      <calc.icon className={`w-8 h-8 ${calc.iconColor || 'text-black'}`} />
                      <ArrowRight className={`w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${calc.iconColor || 'text-black'}`} />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                        {calc.name}
                      </h2>
                      <p className="text-gray-700 font-medium mb-6 flex-1">
                        {calc.desc}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                          {calc.category}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Placeholder for future calculators - Only show if showing All or no results? Maybe just always hide when filtering to avoid clutter. 
              Let's show it only if selectedCategory is All and no search query. */}
          {selectedCategory === 'All' && !searchQuery && (
            <Link to="/feedback" className="group block h-full decoration-transparent">
              <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                <div className="bg-purple-300 p-6 border-b-4 border-black flex items-center justify-between">
                  <MessageSquarePlus className="w-8 h-8 text-black" />
                  <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 text-black" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                    Have an Idea?
                  </h2>
                  <p className="text-gray-700 font-medium mb-6">
                    We are constantly building more tools. Tell us what calculator you need next!
                  </p>
                  <div className="mt-auto">
                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                      Suggest
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          )}

        </main>

        <Footer />
      </div>
    </div>
  );
}
