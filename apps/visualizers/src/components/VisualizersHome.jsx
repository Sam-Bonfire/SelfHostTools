import { usePersistedState } from '@packages/persistence';
import { Card, Footer } from '@packages/styling';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Beaker,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Flame,
  GitFork,
  Grid,
  History,
  Landmark,
  MessageSquarePlus,
  Search,
  Snowflake,
  Sun,
  Timer,
  X
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

const VISUALIZERS = [
  {
    path: '/memento-mori',
    name: 'Memento Mori',
    desc: 'Your life in weeks. A stoic visualization of time passed and time remaining. Auto-highlights life phases.',
    category: 'Perspective',
    icon: Calendar,
    color: 'bg-black',
    textColor: 'text-white',
    iconColor: 'text-white'
  },
  {
    path: '/sankey-flowchart',
    name: 'Capital Flow Sankey',
    desc: 'Track where your money goes. An interactive flow diagram mapping income streams directly to your expenses.',
    category: 'Finance',
    icon: GitFork,
    color: 'bg-[#FFDE59]',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    path: '/compound-sandbox',
    name: 'Compound Snowball',
    desc: 'Watch compounding wealth build inside a physics-based particle simulator. See contribution and interest coins bounce.',
    category: 'Simulation',
    icon: Landmark,
    color: 'bg-blue-400',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    path: '/compound-interest',
    name: 'Compound Interest Snowball',
    desc: 'A particle simulator showing how contributions versus interest scales over 30 years.',
    category: 'Finance',
    icon: Snowflake,
    color: 'bg-blue-500',
    textColor: 'text-white'
  },
  {
    path: '/sorting-visualizer',
    name: 'Sorting Algorithms',
    desc: 'Watch Quick Sort, Merge Sort, and Bubble Sort race with retro audio synth swapping.',
    category: 'Computer Science',
    icon: Database,
    color: 'bg-indigo-500',
    textColor: 'text-white'
  },
  {
    path: '/asset-jar',
    name: 'Asset Allocation Jar',
    desc: 'A density-based physics jar simulating asset classes. Shake for market shocks, drag to rebalance.',
    category: 'Finance',
    icon: Beaker,
    color: 'bg-teal-500',
    textColor: 'text-white'
  },
  {
    path: '/cellular-automata',
    name: 'Cellular Automata',
    desc: "Conway's Game of Life & fractal replication in a pixelated Neo-Brutalist playground.",
    category: 'Mathematics',
    icon: Grid,
    color: 'bg-purple-500',
    textColor: 'text-white'
  },
  {
    path: '/pomodoro-focus',
    name: 'Pomodoro Focus & Waveform',
    desc: 'Physical retro stopwatch generating interactive sound waves (brown noise, terminal clicks).',
    category: 'Productivity',
    icon: Timer,
    color: 'bg-red-500',
    textColor: 'text-white'
  },
  {
    path: '/swr-history',
    name: 'SWR Historical Path',
    desc: 'Simulate withdrawal rates over the Great Depression, 1970s stagflation, and 2008.',
    category: 'Finance',
    icon: History,
    color: 'bg-orange-500',
    textColor: 'text-white'
  },
  {
    path: '/debt-race',
    name: 'Repayment Race',
    desc: 'Compare Snowball and Avalanche payoff strategies in an interactive race to spot the fastest debt-free path.',
    category: 'Gaming',
    icon: Flame,
    color: 'bg-red-400',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    path: '/runway-horizon',
    name: 'Runway Horizon',
    desc: 'A rolling interactive 2D landscape charting your financial runway duration and absolute lifestyle crash coordinates.',
    category: 'Horizon',
    icon: Sun,
    color: 'bg-green-400',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    path: '/freedom-clock',
    name: '24-Hour Freedom Clock',
    desc: 'A gorgeous circular time auditor mapping how much of your day is dedicated to obligations versus pure freedom.',
    category: 'Time Audit',
    icon: Clock,
    color: 'bg-[#FFDE59]',
    textColor: 'text-black',
    iconColor: 'text-black'
  }
];

export default function VisualizersHome() {
  const [searchQuery, setSearchQuery] = usePersistedState('VisualizersHome', 'searchQuery', '');
  const [selectedCategory, setSelectedCategory] = usePersistedState('VisualizersHome', 'selectedCategory', 'All');
  const [isSearchExpanded, setIsSearchExpanded] = usePersistedState('VisualizersHome', 'isSearchExpanded', () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const scrollContainerRef = useRef(null);
  const itemsRef = useRef({});

  const categories = useMemo(() => {
    const cats = new Set(VISUALIZERS.map((v) => v.category));
    return ['All', ...Array.from(cats)];
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSearchExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredVisualizers = useMemo(() => {
    return VISUALIZERS.filter((vis) => {
      const matchesCategory = selectedCategory === 'All' || vis.category === selectedCategory;
      const matchesSearch =
        vis.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vis.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryColors = useMemo(() => {
    const colors = { All: 'bg-gray-200' };
    VISUALIZERS.forEach((vis) => {
      if (!colors[vis.category]) {
        colors[vis.category] = vis.color;
      }
    });
    return colors;
  }, []);

  const toggleSearch = () => {
    if (isSearchExpanded) {
      if (!searchQuery) setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
    }
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

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
    const element = itemsRef.current[cat];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ rotate: -2 }}
            whileHover={{ scale: 1.02, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
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
                  alt="Visualizers Mascot"
                  width={100}
                  height={100}
                  className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] object-contain"
                />
              </picture>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight text-center md:text-left">
                Visualizers Hub
              </h1>
            </div>
          </motion.div>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto mb-8">
            See your life in a new perspective.
            <br />
            <span className="bg-blue-200 px-2 box-decoration-clone tracking-tight">
              Visualize time, freedom, and reality.
            </span>
          </p>

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
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const colorClass = categoryColors[cat] || 'bg-gray-200';
                  return (
                    <button
                      key={cat}
                      ref={(el) => (itemsRef.current[cat] = el)}
                      onClick={() => handleCategoryClick(cat)}
                      className={`flex-shrink-0 px-4 py-2 text-xs md:text-sm font-black uppercase border-2 border-black transition-all ${colorClass} ${colorClass === 'bg-black' ? 'text-white' : 'text-black'} ${
                        isActive
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
                <button
                  onClick={toggleSearch}
                  className="w-12 h-full flex items-center justify-center flex-shrink-0 hover:bg-yellow-300 transition-colors border-r-2 border-black"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

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

        {/* Visualizers Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="main">
          <AnimatePresence mode="popLayout">
            {filteredVisualizers.map((vis) => (
              <motion.div
                key={vis.path}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link to={vis.path} className="group block h-full decoration-transparent">
                  <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                    <div className={`${vis.color} p-6 border-b-4 border-black flex items-center justify-between`}>
                      <vis.icon className={`w-8 h-8 ${vis.iconColor}`} />
                      <ArrowRight
                        className={`w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${vis.iconColor}`}
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                        {vis.name}
                      </h2>
                      <p className="text-gray-700 font-medium mb-6 flex-1">{vis.desc}</p>
                      <div className="mt-auto">
                        <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                          {vis.category}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

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
                    We are constantly building more tools. Tell us what visualizer you need next!
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
      </div>

      <Footer />
    </div>
  );
}
