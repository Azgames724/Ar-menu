import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Wind, InfoIcon, Search, Home, MessageSquare, 
  Sparkles, Star, Copy, Check, Menu, UtensilsCrossed, X,
  MapPin, ExternalLink, Trophy, Flame, Timer, Award
} from 'lucide-react';
import { MENU_DATA, MenuItem } from './data/menu';
import ARViewer from './components/ARViewer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useLanguage } from './lib/language';

interface UserReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  dishName: string;
  createdAt: string;
}

function MenuHome() {
  const { lang, toggle } = useLanguage();
  const am = lang === 'am';

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'social'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // Live AR Simulator States in main card
  const [showArGuideScanned, setShowArGuideScanned] = useState(false);
  const [arSimulatedScale, setArSimulatedScale] = useState(1.1);
  const [arSimulatedRotation, setArSimulatedRotation] = useState(45);
  const [arSimulatedDishId, setArSimulatedDishId] = useState('ff-2');
  const [arAutoSpin, setArAutoSpin] = useState(true);

  // Food Challenge Simulator state
  const [showChallengePanel, setShowChallengePanel] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(0); // grams eaten out of 3000
  const [challengeFullness, setChallengeFullness] = useState(0); // stomach capacity 0-100%
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(900); // 15 mins = 900 seconds
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [challengeChampions, setChallengeChampions] = useState<{name: string, time: string, date: string}[]>(() => {
    const stored = localStorage.getItem('dagi_challenge_champions');
    if (stored) return JSON.parse(stored);
    return [
      { name: 'Abenezer G.', time: '11:24', date: 'June 12, 2026' },
      { name: 'Robel S.', time: '13:40', date: 'June 18, 2026' },
      { name: 'Bruk T.', time: '14:15', date: 'June 20, 2026' }
    ];
  });
  const [championNameInput, setChampionNameInput] = useState('');

  // Social/review state
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    const stored = localStorage.getItem('dagi_customer_reviews');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 'rev-google-1',
        name: 'Eyob Girma',
        rating: 5,
        comment: 'Dagi has the absolute best chicken wraps in all of Addis Ababa! Incredibly juicy, served super hot with sweet & spicy awaze! Fast service which is perfect for groups.',
        dishName: 'Dagi Special Wrap • ልዩ ዋፕ (Google Review)',
        createdAt: '4 days ago'
      },
      {
        id: 'rev-google-2',
        name: 'Selamawit Tadesse (Local Guide)',
        rating: 5,
        comment: 'The fastest fast food in town. You pull up with your car, pay, and receive your fresh, quality chicken wrap in literally 2 minutes. Consistent seasoning every time.',
        dishName: 'Dagi Normal Wrap • መደበኛ ዋፕ (Google Review)',
        createdAt: '1 week ago'
      },
      {
        id: 'rev-google-3',
        name: 'Nahom Daniel',
        rating: 5,
        comment: 'Highly addictive double chicken wraps and folded beef pockets! Generous proportions, clean kitchen, and incredibly fast output.',
        dishName: 'Dagi Special Wrap • ልዩ ዋፕ (Google Review)',
        createdAt: '2 weeks ago'
      },
      {
        id: 'rev-google-4',
        name: 'Hanna Solomon',
        rating: 4,
        comment: 'Love the quick service and the savory sauce. It is always crowded but they manage food prep extremely fast. A must-try spot!',
        dishName: 'Dagi Normal Burrito • መደበኛ ቡሪቶ (Google Review)',
        createdAt: '3 weeks ago'
      },
      {
        id: 'rev-google-5',
        name: 'Michael Belay',
        rating: 5,
        comment: 'Delicious wraps loaded with fresh ingredients. Excellent value for money and outstanding taste experience.',
        dishName: 'Dagi Normal Wrap • መደበኛ ዋፕ (Google Review)',
        createdAt: '1 month ago'
      }
    ];
  });
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5, dishId: '' });

  const categories = ['All', 'FastFood', 'main dish'];

  useEffect(() => {
    localStorage.setItem('dagi_customer_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('dagi_challenge_champions', JSON.stringify(challengeChampions));
  }, [challengeChampions]);

  useEffect(() => {
    if (!challengeActive || challengeStatus !== 'playing') return;

    const timer = setInterval(() => {
      setChallengeTimeLeft(prev => {
        if (prev <= 1) {
          setChallengeStatus('lost');
          setChallengeActive(false);
          return 0;
        }
        return prev - 1;
      });

      // Digesting food slowly: stomach fullness drops by 4% per second
      setChallengeFullness(prev => Math.max(0, prev - 4));
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeActive, challengeStatus]);

  useEffect(() => {
    if (!arAutoSpin) return;
    const interval = setInterval(() => {
      setArSimulatedRotation(prev => (prev + 1.2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [arAutoSpin]);
  
  // Automatically map legacy glTF master branch URLs to main sample branch
  const allDishes = MENU_DATA.map((item) => {
    let modelUrl = item.modelUrl || '';
    if (modelUrl.includes('glTF-Sample-Models/master/2.0/')) {
      modelUrl = modelUrl.replace(
        'glTF-Sample-Models/master/2.0/',
        'glTF-Sample-Assets/main/Models/'
      );
    }
    return { ...item, modelUrl };
  });

  const filteredMenu = activeCategory === 'All' 
    ? allDishes 
    : allDishes.filter(item => item.category === activeCategory);

  const searchedMenu = searchQuery.trim() === ''
    ? filteredMenu
    : filteredMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));

  // Interactive local voucher copy action
  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setPromoMessage(`Coupon "${code}" copied! Discount applied!`);
      setTimeout(() => {
        setCopiedCode(null);
        setPromoMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  // Helper to detect if item is vegetarian
  const isVegDish = (name: string) => {
    const norm = name.toLowerCase();
    return norm.includes('avocado') || norm.includes('normal burrito') || norm.includes('veg') || norm.includes('pasta');
  };

  // Helper to handle loading error for local images gracefully
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, imageUrl: string) => {
    e.currentTarget.onerror = null; // prevent infinite loops
    const lower = imageUrl.toLowerCase();
    if (lower.includes('pasta') || lower.includes('spaghetti')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1574484284002-982dac98677c?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('special') || lower.includes('cod')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
    } else {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=800&q=80';
    }
  };

  // Post a new customer review
  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    let selectedDishName = 'General Experience';
    if (newReview.dishId) {
      const dish = allDishes.find(d => d.id === newReview.dishId);
      if (dish) selectedDishName = dish.name;
    }

    const review: UserReview = {
      id: `rev-${Date.now()}`,
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      dishName: selectedDishName,
      createdAt: 'Just now (Redirected to Google Maps)'
    };

    setReviews([review, ...reviews]);
    setNewReview({ name: '', comment: '', rating: 5, dishId: '' });
    
    // Redirect instantly to Google Maps review page
    try {
      window.open("https://www.google.com/search?kgmid=%2Fg%2F11z5pc764n&hl=en-ET&q=Dagi%20fast%20food&shem=epsd1%2Cltac%2Crimspwouohc&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F2&kgs=a10f07a17213e860", "_blank");
    } catch (err) {
      console.warn("Popup blocked, fallback redirect:", err);
      window.location.href = "https://www.google.com/search?kgmid=%2Fg%2F11z5pc764n&hl=en-ET&q=Dagi%20fast%20food&shem=epsd1%2Cltac%2Crimspwouohc&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F2&kgs=a10f07a17213e860";
    }

    setPromoMessage('Review posted! Navigating directly to our verified Google Map Spot...');
    setTimeout(() => setPromoMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F9C52E] flex justify-center items-center py-0 sm:py-8 font-sans antialiased text-brand-black selection:bg-orange-200">
      
      {/* Devourin-Inspired Mobile Phone Container Frame */}
      <div className="relative w-full h-[100dvh] sm:max-w-[420px] sm:h-[880px] bg-[#FAF8F5] sm:rounded-[3.5rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] sm:border-[14px] sm:border-neutral-900 overflow-hidden flex flex-col">
        
        {/* Phone Sensor Notch emulation */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-xl z-50">
          <div className="w-12 h-1.5 bg-neutral-800 mx-auto mt-1.5 rounded-full" />
        </div>

        {/* Brand Theme Header matching the screenshot layout exactly */}
        <header className="sticky top-0 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/95 to-[#FAF8F5]/80 backdrop-blur-xl z-30 px-5 pt-8 sm:pt-10 pb-5 flex flex-col gap-3 relative">
          
          {/* Modern feathered white gradient + blur effect at the bottom of the header */}
          <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-[#FAF8F5]/80 via-[#FAF8F5]/30 to-transparent pointer-events-none z-20 backdrop-blur-[5px]" />

          <div className="flex justify-between items-center">
            {/* Logo and Greeting */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md border border-neutral-100">
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F59E0B] flex items-center justify-center text-white font-extrabold text-2xl border border-white/40 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => setActiveTab('home')}
                >
                  D
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-ethiopic font-black text-xl tracking-tight leading-none">
                  <span className="text-[#1E1B18]">ዳጊ</span>
                  <span className="text-[#EA580C]">ፋስት ፉድ</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-[8px] font-black tracking-widest text-[#B91C1C] uppercase">INTERACTIVE 3D & AR</span>
                </div>
                <div className="flex items-center mt-1">
                  <a 
                    href="https://www.google.com/search?kgmid=%2Fg%2F11z5pc764n&hl=en-ET&q=Dagi%20fast%20food"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-white border border-neutral-200/60 rounded-full px-2.5 py-0.5 text-[8px] font-bold text-neutral-600 shadow-sm hover:scale-105 active:scale-95 transition-transform"
                  >
                    <span className="text-red-600 font-extrabold">G</span>
                    <span className="text-amber-500">★</span>
                    <span className="text-neutral-700">4.7 Rating</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Header action button for Search, Language toggle, and Menu */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggle}
                className="h-8 px-2.5 rounded-full bg-white border border-neutral-100 flex items-center gap-1 active:scale-95 transition-all shadow-md text-[9px] font-black tracking-widest"
                title="Switch language"
              >
                <span className={am ? 'text-[#EA580C]' : 'text-neutral-400'}>አማ</span>
                <span className="text-neutral-300">|</span>
                <span className={!am ? 'text-[#EA580C]' : 'text-neutral-400'}>EN</span>
              </button>

              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center active:scale-95 transition-all shadow-md relative text-neutral-800"
                title="Search Digital Menu"
              >
                <Search size={18} strokeWidth={2} />
              </button>
              
              <button 
                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center active:scale-95 transition-all shadow-md relative text-[#EA580C]"
                title="Quick filters"
              >
                <Menu size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Animating Search Input Field */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative py-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={am ? 'ምግብ ፈልግ...' : 'Search wraps, burritos, ingredients...'}
                    className="w-full bg-white border border-orange-200 text-xs py-3 pl-10 pr-8 rounded-2xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:bg-white text-brand-black font-semibold transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500" size={14} />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Filter Menu Popover */}
          <AnimatePresence>
            {isQuickMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-20 right-5 bg-white border border-orange-100 rounded-3xl p-4 shadow-xl z-50 w-52 space-y-2.5"
              >
                <div className="flex justify-between items-center pb-2 border-b border-neutral-50">
                  <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">Quick Filters</span>
                  <button onClick={() => setIsQuickMenuOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={12} /></button>
                </div>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => { setActiveCategory('All'); setIsQuickMenuOpen(false); setActiveTab('menu'); }}
                    className={`w-full text-left text-xs font-bold py-1.5 px-2 rounded-lg transition-colors ${activeCategory === 'All' ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-55 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {am ? 'ሁሉም ምግቦች' : 'All Items'}
                  </button>
                  <button 
                    onClick={() => { setActiveCategory('FastFood'); setIsQuickMenuOpen(false); setActiveTab('menu'); }}
                    className={`w-full text-left text-xs font-bold py-1.5 px-2 rounded-lg transition-colors ${activeCategory === 'FastFood' ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-55 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {am ? 'ፈጣን ምግቦች' : 'Fast Food'}
                  </button>
                  <button 
                    onClick={() => { setActiveCategory('main dish'); setIsQuickMenuOpen(false); setActiveTab('menu'); }}
                    className={`w-full text-left text-xs font-bold py-1.5 px-2 rounded-lg transition-colors ${activeCategory === 'main dish' ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-55 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {am ? 'ዋና ምግቦች' : 'Main Dishes'}
                  </button>
                  <div className="pt-2 border-t border-neutral-50 flex justify-between">
                    <button 
                      onClick={() => { setActiveTab('social'); setIsQuickMenuOpen(false); }}
                      className="text-[9px] font-black text-amber-700 uppercase"
                    >
                      {am ? 'ግምገማዎች' : 'Reviews'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Global Toast Notification message */}
        <AnimatePresence>
          {promoMessage && (
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="absolute top-24 left-4 right-4 bg-brand-black/95 border border-neutral-800 text-white p-3 rounded-2xl text-[11px] text-center font-bold tracking-wider z-50 shadow-2xl flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-orange-400 animate-pulse" />
              <span>{promoMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#FAF8F5]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: CUSTOMER PORTAL HOME */}
            {activeTab === 'home' && (
              <motion.div
                key="home-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-5"
              >


                {/* SECTION 1: CUSTOMERS' CHOICE (የደንበኞች ምርጫ) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-sm font-black text-brand-black uppercase tracking-wider flex items-center gap-1.5 font-ethiopic text-[#1E1B18]">
                      <span className="text-[#EA580C] text-lg">✦</span>
                      <span>{am ? 'የደንበኞች ምርጫ' : "Customers' Choice"}</span>
                    </h2>
                    <button 
                      onClick={() => { setActiveTab('menu'); setActiveCategory('All'); }}
                      className="text-[10px] text-[#EA580C] hover:text-orange-700 font-extrabold uppercase tracking-widest"
                    >
                      {am ? 'ምናሌ ይመልከቱ' : 'VIEW MENU'}
                    </button>
                  </div>

                  {/* 2-Column Grid as displayed in the screenshot */}
                  <div className="grid grid-cols-2 gap-4">
                    {allDishes.filter(item => item.id === 'ff-1' || item.id === 'ff-2').map((item) => {
                      const veg = isVegDish(item.name);
                      return (
                        <div 
                          key={item.id}
                          id={`card-${item.id}`}
                          onClick={() => setSelectedItem(item)}
                          className="bg-white rounded-[2.2rem] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-neutral-100/50 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between relative group"
                        >
                          {/* Vegetarian/Non-Vegetarian square badge */}
                          <div className="absolute top-4 left-4 z-10 bg-white/90 p-1 rounded-lg shadow-sm border border-neutral-100">
                            <div className={`w-4 h-4 border-2 ${veg ? 'border-emerald-600' : 'border-red-600'} flex items-center justify-center p-[2px] rounded-sm`}>
                              <div className={`w-2 h-2 rounded-full ${veg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            </div>
                          </div>

                          {/* Plated circular food visual representation */}
                          <div className="relative w-28 h-28 mx-auto mt-4 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-b from-[#F2EDEA] to-[#E2DCD8] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageError(e, item.imageUrl)}
                            />
                          </div>

                          <div className="space-y-1.5 mt-4 text-center">
                            <p className="text-[9px] text-[#A28A76] tracking-widest uppercase font-extrabold font-ethiopic">
                              {am ? (item.amharicCategory || 'ፈጣን ምግቦች') : (item.category === 'FastFood' ? 'Fast Food' : 'Main Dish')}
                            </p>
                            <h4 className="text-sm font-black text-[#1E1B18] font-ethiopic mt-1 line-clamp-1 h-5 group-hover:text-[#EA580C] transition-colors">
                              {am ? (item.amharicName || item.name) : item.name}
                            </h4>
                            <div className="mt-2">
                              <span className="inline-block bg-[#FEFBF0] text-neutral-800 font-extrabold text-xs px-4 py-1.5 rounded-full border border-amber-100/40">
                                {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button 
                            id={`inspect-btn-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="mt-3.5 w-full bg-white border border-orange-200 text-[#EA580C] hover:bg-orange-50 hover:border-orange-300 transition-all text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span className="text-[#EA580C] text-xs">✦</span>
                            <span>{am ? 'AR 3D ይመልከቱ' : 'INSPECT AR 3D'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: HOUSE SPECIALS (የቤቱ እሰፔሻል) */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-sm font-black text-brand-black uppercase tracking-wider flex items-center gap-1.5 font-ethiopic text-[#1E1B18]">
                      <span className="text-[#EA580C] text-lg">✦</span>
                      <span>{am ? 'የቤቱ እሰፔሻል' : 'House Specials'}</span>
                    </h2>
                  </div>

                  {/* 2-Column Grid for House Specials */}
                  <div className="grid grid-cols-2 gap-4">
                    {allDishes.filter(item => item.id !== 'ff-1' && item.id !== 'ff-2').map((item) => {
                      const veg = isVegDish(item.name);
                      return (
                        <div 
                          key={item.id}
                          id={`card-${item.id}`}
                          onClick={() => setSelectedItem(item)}
                          className="bg-white rounded-[2.2rem] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-neutral-100/50 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between relative group"
                        >
                          {/* Vegetarian/Non-Vegetarian square badge */}
                          <div className="absolute top-4 left-4 z-10 bg-white/90 p-1 rounded-lg shadow-sm border border-neutral-100">
                            <div className={`w-4 h-4 border-2 ${veg ? 'border-emerald-600' : 'border-red-600'} flex items-center justify-center p-[2px] rounded-sm`}>
                              <div className={`w-2 h-2 rounded-full ${veg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            </div>
                          </div>

                          {/* Plated circular food visual representation */}
                          <div className="relative w-28 h-28 mx-auto mt-4 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-b from-[#F2EDEA] to-[#E2DCD8] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageError(e, item.imageUrl)}
                            />
                          </div>

                          <div className="space-y-1.5 mt-4 text-center">
                            <p className="text-[9px] text-[#A28A76] tracking-widest uppercase font-extrabold font-ethiopic">
                              {am ? (item.amharicCategory || 'የቤቱ እሰፔሻል') : (item.category === 'FastFood' ? 'Fast Food' : 'Main Dish')}
                            </p>
                            <h4 className="text-sm font-black text-[#1E1B18] font-ethiopic mt-1 line-clamp-1 h-5 group-hover:text-[#EA580C] transition-colors">
                              {am ? (item.amharicName || item.name) : item.name}
                            </h4>
                            <div className="mt-2">
                              <span className="inline-block bg-[#FEFBF0] text-neutral-800 font-extrabold text-xs px-4 py-1.5 rounded-full border border-amber-100/40">
                                {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button 
                            id={`inspect-btn-${item.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                            className="mt-3.5 w-full bg-white border border-orange-200 text-[#EA580C] hover:bg-orange-50 hover:border-orange-300 transition-all text-[9.5px] font-black uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span className="text-[#EA580C] text-xs">✦</span>
                            <span>{am ? 'AR 3D ይመልከቱ' : 'INSPECT AR 3D'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: MENU GRID */}
            {activeTab === 'menu' && (
              <motion.div
                key="menu-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-5"
              >
                <div>
                  <h2 className="text-2xl font-black text-brand-black font-heading">{am ? 'ዲጂታል ምናሌ' : 'Our Digital Menu'}</h2>
                  <p className="text-xs text-neutral-500">{am ? 'ማንኛውም ምግብ ነካ ብሎ 3D ሞዴሉን ይመልከቱ።' : 'Tap any item to inspect its authentic fully-interactive 3D model, nutritional metrics & ingredients.'}</p>
                </div>

                {/* Filter chip category tabs */}
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`whitespace-nowrap px-4 py-2.5 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all ${
                        activeCategory === category 
                          ? 'bg-brand-orange text-white shadow-md shadow-orange-500/25' 
                          : 'bg-white text-neutral-600 border border-neutral-100 hover:border-orange-200'
                      }`}
                    >
                      {am
                        ? (category === 'All' ? 'ሁሉም' : category === 'FastFood' ? 'ፈጣን ምግቦች' : 'ዋና ምግቦች')
                        : (category === 'All' ? 'All Items' : category === 'FastFood' ? 'Fast Food' : 'Main Dishes')}
                    </button>
                  ))}
                </div>

                {/* Two-column responsive card catalog with beautiful plates layout */}
                <div className="grid grid-cols-2 gap-4">
                  {searchedMenu.map((item) => {
                    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price as any) || 0;
                    const veg = isVegDish(item.name);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white border border-neutral-100 rounded-[2.2rem] p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.97] flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Veg / Non-Veg Indicator */}
                        <div className="absolute top-3.5 left-3.5 z-10 bg-white/95 p-1 rounded-md border border-neutral-100 shadow-sm">
                          <div className={`w-3 h-3 border ${veg ? 'border-emerald-600' : 'border-red-600'} flex items-center justify-center p-[1px]`}>
                            <div className={`w-1.5 h-1.5 ${veg ? 'rounded-full bg-emerald-600' : 'bg-red-600'}`} />
                          </div>
                        </div>

                        {/* Top rating badge */}
                        <div className="absolute top-3.5 right-3.5 z-10 bg-amber-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                          <span>★</span>
                          <span>4.9</span>
                        </div>

                        {/* Plated circular food visual element */}
                        <div className="relative w-24 h-24 mx-auto mt-2.5 bg-gradient-to-b from-[#F2EDEA] to-[#E2DCD8] rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, item.imageUrl)}
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-neutral-900/40 backdrop-blur-[1px] py-1 text-center">
                            <span className="text-[7px] text-amber-300 font-black tracking-widest uppercase">3D Viewer</span>
                          </div>
                        </div>

                        <div className="space-y-1 mt-3.5 text-center flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-orange-600 block font-ethiopic">
                              {am ? (item.amharicCategory || item.category) : (item.category === 'FastFood' ? 'Fast Food' : 'Main Dish')}
                            </span>
                            <h3 className="font-extrabold text-xs text-brand-black line-clamp-2 leading-tight font-heading group-hover:text-brand-orange transition-colors px-0.5 font-ethiopic">
                              {am ? (item.amharicName || item.name) : item.name.split('•')[0].trim()}
                            </h3>
                          </div>

                          <div className="pt-2">
                            <span className="text-xs font-black text-brand-black bg-[#FAF8F5] border border-orange-100 px-3 py-1 rounded-full inline-block">
                              {price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button className="mt-3.5 w-full bg-orange-50 border border-orange-100 group-hover:bg-brand-orange group-hover:text-white transition-all text-brand-orange text-[9px] font-black uppercase tracking-wider py-1.5 rounded-xl flex items-center justify-center gap-1">
                          <Sparkles size={10} fill="currentColor" />
                          <span>{am ? 'ይመልከቱ' : 'Inspect'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: SOCIAL COMMUNITY FEED */}
            {activeTab === 'social' && (
              <motion.div
                key="social-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 p-5"
              >
                <div>
                  <h2 className="text-2xl font-black text-brand-black font-heading uppercase tracking-tight">Community Reviews</h2>
                  <p className="text-xs text-neutral-550 mb-3">Read active reviews posted by other customers, seasoning opinions, or share your very own culinary review!</p>
                  
                  {/* Google Maps actual ratings breakdown widget */}
                  <div className="bg-white border border-[#E8F0FE] rounded-[2.2rem] p-5.5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8]">
                          <MapPin size={22} className="fill-blue-100" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-brand-black leading-tight">Google Maps Score</p>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Dagi Fast Food, Addis Ababa</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-amber-500 justify-end">
                          <span className="text-2xl font-black text-brand-black leading-none">4.7</span>
                          <div className="flex flex-col text-left">
                            <div className="flex text-amber-500 gap-0.5">
                              <Star size={10} fill="currentColor" className="stroke-none" />
                              <Star size={10} fill="currentColor" className="stroke-none" />
                              <Star size={10} fill="currentColor" className="stroke-none" />
                              <Star size={10} fill="currentColor" className="stroke-none" />
                              <Star size={10} fill="currentColor" className="stroke-none" />
                            </div>
                            <span className="text-[7.5px] text-neutral-400 font-extrabold tracking-widest uppercase">11 VOTES</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw ratings bar distribution chart */}
                    <div className="space-y-2 pt-1 border-t border-neutral-100">
                      <p className="text-[8.5px] font-black uppercase text-[#1A73E8] tracking-widest block mb-2">
                        Raw Google Rating Distribution (Actual Reviews)
                      </p>
                      
                      {/* 5 stars */}
                      <div className="flex items-center gap-2.5 text-[9.5px]">
                        <span className="text-neutral-500 font-bold w-11 text-right">5 stars</span>
                        <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[82%]" />
                        </div>
                        <span className="text-neutral-700 font-bold w-12 text-right">9 reviews</span>
                      </div>

                      {/* 4 stars */}
                      <div className="flex items-center gap-2.5 text-[9.5px]">
                        <span className="text-neutral-500 font-bold w-11 text-right">4 stars</span>
                        <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[9%]" />
                        </div>
                        <span className="text-neutral-700 font-bold w-12 text-right">1 review</span>
                      </div>

                      {/* 3 stars */}
                      <div className="flex items-center gap-2.5 text-[9.5px]">
                        <span className="text-neutral-500 font-bold w-11 text-right">3 stars</span>
                        <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[9%]" />
                        </div>
                        <span className="text-neutral-700 font-bold w-12 text-right">1 review</span>
                      </div>

                      {/* 2 stars */}
                      <div className="flex items-center gap-2.5 text-[9.5px]">
                        <span className="text-neutral-500 font-bold w-11 text-right">2 stars</span>
                        <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[0%]" />
                        </div>
                        <span className="text-neutral-400 font-bold w-12 text-right">0 reviews</span>
                      </div>

                      {/* 1 star */}
                      <div className="flex items-center gap-2.5 text-[9.5px]">
                        <span className="text-neutral-500 font-bold w-11 text-right">1 star</span>
                        <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-[0%]" />
                        </div>
                        <span className="text-neutral-400 font-bold w-12 text-right">0 reviews</span>
                      </div>
                    </div>

                    <a 
                      href="https://www.google.com/search?kgmid=%2Fg%2F11z5pc764n&hl=en-ET&q=Dagi%20fast%20food&shem=epsd1%2Cltac%2Crimspwouohc&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F2&kgs=a10f07a17213e860"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white text-[9px] font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <span>Write or Read Live on Google Maps</span>
                      <ExternalLink size={10} className="stroke-[2.5]" />
                    </a>
                  </div>
                </div>

                {/* Customer Review Posting Form */}
                <form onSubmit={handlePostReview} className="bg-white border border-[#1A73E8]/30 rounded-[2rem] p-5 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#E8F0FE] text-blue-750 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-bl-xl border-l border-b border-blue-100">
                    Google Maps Sync
                  </div>
                  
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1A73E8] block">Write a Google Maps Review</span>
                  <p className="text-[9px] text-neutral-550 font-semibold leading-relaxed">
                    Fill out your rating below - submitting will instantly launch our verified Google Maps review portal so you can write and publish your authentic feedback!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 text-xs p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />

                    <select
                      value={newReview.dishId}
                      onChange={e => setNewReview({ ...newReview, dishId: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 text-xs p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-medium text-neutral-605 text-neutral-500"
                    >
                      <option value="">Select Dish</option>
                      {allDishes.map(d => (
                        <option key={d.id} value={d.id}>{d.name.split('•')[0]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-550 font-bold">Rating:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Star size={18} fill={newReview.rating >= star ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{newReview.rating}.0 Stars Selected</span>
                  </div>

                  <textarea
                    placeholder="Describe your review of the dish. What did you think of the visual 3D design and culinary ingredients?"
                    required
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={3}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#1A73E8] hover:bg-[#1557b0] text-white font-black uppercase tracking-widest text-[9.5px] py-3.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    <span>Publish & Go Directly to Google Maps</span>
                    <ExternalLink size={11} className="stroke-[2.5]" />
                  </button>
                </form>

                {/* Review Listings */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-5 rounded-[1.8rem] border border-neutral-100 shadow-sm space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-xs text-brand-black">{rev.name}</p>
                          <span className="text-[9px] uppercase tracking-wider text-orange-600 font-extrabold">{rev.dishName}</span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} fill={i < rev.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed italic pr-2">
                        "{rev.comment}"
                      </p>
                      <div className="flex justify-end pt-1 border-t border-neutral-50">
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest font-extrabold">{rev.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Floating device bottom tab navigation (exactly three columns: Home, Menu, Social) */}
        <nav className="absolute bottom-5 left-5 right-5 bg-white border border-neutral-100 rounded-3xl flex justify-around items-center py-3.5 px-5 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#EA580C] scale-105' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Home size={22} fill={activeTab === 'home' ? 'currentColor' : 'none'} strokeWidth={activeTab === 'home' ? 0 : 2} className="transition-transform duration-200" />
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'menu' ? 'text-[#EA580C] scale-105' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <Menu size={22} className="stroke-[2.5]" />
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'social' ? 'text-[#EA580C] scale-105' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            <MessageSquare size={22} fill={activeTab === 'social' ? 'currentColor' : 'none'} strokeWidth={activeTab === 'social' ? 0 : 2} />
          </button>
        </nav>

      </div>

      {/* Detail Overlay Drawer Modal when item is clicked */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-5"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="w-full sm:max-w-md bg-white h-full sm:h-[calc(100%-2rem)] sm:max-h-[780px] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative"
            >
              {/* Overlay Sticky Header */}
              <div className="p-5 flex items-center justify-between border-b border-neutral-100 bg-[#FAF8F5]">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2.5 rounded-full bg-neutral-150 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="text-center">
                  <h2 className="text-sm font-black uppercase tracking-widest leading-none text-brand-black font-heading">Dish 3D Showcase</h2>
                  <span className="text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold text-amber-800">Inspect & Rotate Item</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center" />
              </div>

              {/* Detail Information Body Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-24 bg-[#FAF8F5]">
                
                {/* 3D AR viewer showcase */}
                <div className="relative rounded-3xl overflow-hidden bg-white border border-neutral-150/10 shadow-sm">
                  <ARViewer 
                    src={selectedItem.modelUrl} 
                    poster={selectedItem.imageUrl}
                    alt={selectedItem.name}
                  />
                  <div className="absolute top-4 left-4 bg-brand-orange text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles size={9} fill="currentColor" />
                    <span>Swipe to orbit 3D model</span>
                  </div>
                </div>

                {/* Core description texts */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline gap-4">
                    <h1 className="text-2xl font-black text-[#1E1B18] leading-tight font-heading font-ethiopic">
                      {am ? (selectedItem.amharicName || selectedItem.name) : selectedItem.name.split('•')[0].trim()}
                    </h1>
                    <span className="text-xl font-black tracking-tight text-[#EA580C] text-nowrap font-ethiopic">
                      {(typeof selectedItem.price === 'number' ? selectedItem.price : parseFloat(selectedItem.price as any) || 0).toFixed(2)} Br
                    </span>
                  </div>
                  
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-505 bg-brand-orange animate-ping" />
                    <span>Fresh & Handmade Culinary</span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-semibold bg-white p-4 rounded-2xl border border-orange-100/30">
                    {am ? selectedItem.description : (selectedItem.descriptionEn || selectedItem.description)}
                  </p>
                </div>

                {/* Calories & Allergens Metrics */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white border border-orange-100/30 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-[#A28A76]">
                      <Wind size={15} />
                      <span className="text-[9px] uppercase tracking-widest font-extrabold pb-[1px]">Energy / Calories</span>
                    </div>
                    <span className="text-sm font-black text-brand-black">{selectedItem.calories} kcal</span>
                  </div>
                  
                  <div className="bg-white border border-orange-100/30 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-[#A28A76]">
                      <InfoIcon size={15} />
                      <span className="text-[9px] uppercase tracking-widest font-extrabold pb-[1px]">Allergens</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(selectedItem.allergens) && selectedItem.allergens.length > 0 ? (
                        selectedItem.allergens.map(a => (
                          <span key={a} className="text-[9px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest pt-[2px]">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ingredients Tag Cloud */}
                {Array.isArray(selectedItem.ingredients) && selectedItem.ingredients.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-[9px] uppercase tracking-[0.2em] font-extrabold text-amber-850">
                      {am ? 'ዋና ግብዓቶች' : 'Primary Sourced Ingredients'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.ingredients.map(ing => (
                        <span key={ing} className="bg-white hover:bg-neutral-50 px-3.5 py-2 rounded-xl text-xs text-neutral-700 transition-colors border border-neutral-100 font-bold shadow-sm">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detail drawer native close CTA button */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-md border-t border-neutral-100 shadow-lg">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full bg-brand-orange hover:bg-orange-700 text-white font-black uppercase tracking-[0.15em] text-[10px] py-4 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {am ? '3D ዝጋ' : 'Close 3D Showcase'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuHome />} />
        <Route path="/*" element={<MenuHome />} />
      </Routes>
    </BrowserRouter>
  );
}

