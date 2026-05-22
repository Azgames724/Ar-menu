import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, Wind, InfoIcon, Settings } from 'lucide-react';
import { MENU_DATA, MenuItem } from './data/menu';
import ARViewer from './components/ARViewer';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

function MenuHome() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [firestoreDishes, setFirestoreDishes] = useState<MenuItem[]>([]);

  const categories = ['All', 'Wrap', 'Burrito'];
  
  useEffect(() => {
    const q = query(collection(db, 'dishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dishes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setFirestoreDishes(dishes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dishes');
    });

    return () => unsubscribe();
  }, []);

  // Merge hardcoded data with firestore data, with firestore taking priority in case of duplicate IDs/names
  const mergedDishes = [...firestoreDishes];
  MENU_DATA.forEach((item) => {
    const isDuplicate = mergedDishes.some(
      (d) => d.id === item.id || d.name.toLowerCase().trim() === item.name.toLowerCase().trim()
    );
    if (!isDuplicate) {
      mergedDishes.push(item);
    }
  });

  // Self-healing: automatically map any legacy/broken glTF-Sample-Models URLs to the new active glTF-Sample-Assets repo at runtime
  const allDishes = mergedDishes.map((item) => {
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

  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-8 pt-12 text-center relative">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="serif text-4xl tracking-widest uppercase mb-2 font-black text-aura-dark"
        >
          Dagi
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
          className="text-xs uppercase tracking-[0.3em] font-medium"
        >
          Fast Food 3D Showcase
        </motion.p>
        <Link 
          to="/admin" 
          className="absolute top-12 right-6 bg-white border border-aura-dark/15 text-aura-dark hover:bg-aura-dark hover:text-white transition-all px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm active:scale-95"
          title="Admin Settings Portal"
        >
          <Settings size={12} className="opacity-80 transition-transform duration-500 group-hover:rotate-45" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wider rounded-full transition-all ${
              activeCategory === category 
                ? 'bg-aura-dark text-white' 
                : 'bg-white/50 text-aura-dark/60 border border-aura-dark/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
        <motion.div 
          layout
          className="space-y-6"
        >
          {filteredMenu.map((item, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-3xl p-4 shadow-sm border border-aura-dark/5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="serif text-lg font-medium leading-tight">{item.name}</h3>
                </div>
                <p className="text-[10px] text-aura-dark/40 uppercase tracking-widest mb-2">
                  {item.category}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-tight">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="bg-aura-dark/5 p-1.5 rounded-full">
                    <ChevronRight size={14} className="text-aura-dark/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-8 pb-12 text-center flex flex-col items-center gap-2 border-t border-aura-dark/5 mt-12">
            <p className="text-[10px] text-aura-dark/30 uppercase tracking-[0.2em] font-medium">Fast Food Reimagined</p>
            <Link 
              to="/admin" 
              className="text-[10px] text-aura-gold hover:text-aura-dark font-black uppercase tracking-[0.25em] flex items-center gap-1.5 transition-colors"
            >
              <Settings size={12} />
              <span>Enter Admin Dashboard</span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-aura-paper flex flex-col"
          >
            {/* Overlay Header */}
            <div className="p-6 flex items-center justify-between">
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-full bg-aura-dark/5 hover:bg-aura-dark/10 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="text-center">
                <h2 className="serif text-xl uppercase tracking-widest leading-none font-bold text-aura-dark">Dagi Fast Food</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Fast Food 3D Showcase</span>
              </div>
              <div className="w-10" /> {/* Spacer for balance */}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20">
              {/* AR Viewer */}
              <div className="mb-8">
                <ARViewer 
                  src={selectedItem.modelUrl} 
                  poster={selectedItem.imageUrl}
                  alt={selectedItem.name}
                />
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <h1 className="serif text-3xl font-medium">{selectedItem.name}</h1>
                    <span className="text-2xl font-light tracking-tighter">${selectedItem.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-aura-dark/60 leading-relaxed italic">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-aura-dark/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 opacity-40">
                      <Wind size={14} />
                      <span className="text-[10px] uppercase tracking-wider font-bold">Calories</span>
                    </div>
                    <span className="text-lg font-medium">{selectedItem.calories} kcal</span>
                  </div>
                  <div className="bg-aura-dark/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 opacity-40">
                      <InfoIcon size={14} />
                      <span className="text-[10px] uppercase tracking-wider font-bold">Allergens</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(selectedItem.allergens || []).length > 0 ? (
                        selectedItem.allergens.map(a => (
                          <span key={a} className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm font-medium">
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-medium">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-3 flex items-center gap-2">
                      Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map(ing => (
                        <span key={ing} className="border border-aura-dark/10 px-3 py-1.5 rounded-full text-xs text-aura-dark/70">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
