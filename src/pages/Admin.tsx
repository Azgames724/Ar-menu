import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth, signInWithGoogle, signInWithEmailAndPassword, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Plus, Trash2, LogOut, LayoutDashboard, UtensilsCrossed, Euro, FileText, Box, Image as ImageIcon, Tag, Hash, AlertTriangle, ChevronLeft } from 'lucide-react';
import { MenuItem } from '../data/menu';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    allergens: '',
    calories: '',
    modelUrl: '',
    imageUrl: '',
    category: 'Main' as MenuItem['category']
  });

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'dishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dishesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setDishes(dishesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'dishes');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dishData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
        allergens: formData.allergens.split(',').map(i => i.trim()).filter(i => i !== ''),
        calories: parseInt(formData.calories) || 0,
        modelUrl: formData.modelUrl,
        imageUrl: formData.imageUrl,
        category: formData.category,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'dishes'), dishData);
      setIsAdding(false);
      setFormData({
        name: '',
        price: '',
        description: '',
        ingredients: '',
        allergens: '',
        calories: '',
        modelUrl: '',
        imageUrl: '',
        category: 'Main'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dishes');
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm('Are you sure you want to remove this dish?')) return;
    try {
      await deleteDoc(doc(db, 'dishes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `dishes/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aura-paper">
        <div className="w-12 h-12 border-4 border-aura-gold/20 border-t-aura-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aura-paper p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-aura-dark/5"
        >
          <div className="w-20 h-20 bg-aura-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <LayoutDashboard className="text-aura-gold" size={40} />
          </div>
          
          <div className="text-center mb-10">
            <h1 className="serif text-3xl mb-2">Aura Admin</h1>
            <p className="text-aura-dark/40 text-[10px] uppercase tracking-[0.2em] font-bold">
              Secure Terminal Access
            </p>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as typeof e.target & {
                email: { value: string };
                password: { value: string };
              };
              try {
                await signInWithEmailAndPassword(auth, target.email.value, target.password.value);
              } catch (error: any) {
                alert(error.message);
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Email / Username</label>
                <input 
                  name="email"
                  type="email" 
                  required 
                  className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                  placeholder="admin@aura.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  required 
                  className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-aura-dark text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              Enter Dashboard
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-aura-dark/5" />
            <span className="text-[8px] uppercase tracking-widest font-black text-aura-dark/20 text-center">Or continue with</span>
            <div className="h-px flex-1 bg-aura-dark/5" />
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full mt-6 bg-white border border-aura-dark/10 text-aura-dark py-4 rounded-2xl font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
            Google Workspace
          </button>
          
          <p className="mt-10 text-center text-[9px] text-aura-dark/30 font-medium leading-relaxed">
            Authorized personnel only.<br />Access logged and monitored.
          </p>

          <Link 
            to="/" 
            className="mt-8 flex items-center justify-center gap-2 text-aura-dark/40 hover:text-aura-dark transition-colors"
          >
            <ChevronLeft size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Menu</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aura-paper p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-red-100">
          <AlertTriangle className="text-red-500 mx-auto mb-6" size={48} />
          <h1 className="serif text-2xl mb-4">Access Denied</h1>
          <p className="text-aura-dark/60 text-xs mb-8 uppercase tracking-widest font-medium">
            Your account ({user.email}) does not have administrative privileges.
          </p>
          <button 
            onClick={() => auth.signOut()}
            className="text-aura-dark/40 hover:text-aura-dark underline uppercase tracking-widest text-[10px] font-bold"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aura-paper p-6 md:p-12 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-aura-dark rounded-2xl shadow-lg">
            <UtensilsCrossed className="text-aura-gold" size={24} />
          </div>
          <div>
            <h1 className="serif text-4xl mb-1">Menu Manager</h1>
            <p className="text-[10px] text-aura-dark/40 uppercase tracking-[0.3em] font-bold">
              Digital 3D Gastronomy
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-aura-dark/5 flex items-center gap-3 shadow-sm">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-aura-dark/10" referrerPolicy="no-referrer" />
            <div className="text-left pr-2">
              <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-1">{user.displayName}</p>
              <p className="text-[8px] text-aura-dark/40 uppercase leading-none">Administrator</p>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="p-3.5 bg-white border border-aura-dark/5 rounded-2xl text-aura-dark/40 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="serif text-2xl uppercase tracking-widest opacity-80">Current Dishes</h2>
            <span className="text-[10px] bg-aura-dark text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              {dishes.length} Items
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dishes.map((dish) => (
              <motion.div 
                layout
                key={dish.id} 
                className="bg-white rounded-[2rem] p-5 border border-aura-dark/5 shadow-sm group hover:shadow-xl transition-all"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-aura-dark/80 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/20">
                      {dish.category}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="serif text-xl leading-tight">{dish.name}</h3>
                  <span className="font-medium text-lg tracking-tighter">${dish.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => handleDeleteDish(dish.id)}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                  >
                    <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Remove</span>
                  </button>
                </div>
              </motion.div>
            ))}
            
            {dishes.length === 0 && (
              <div className="sm:col-span-2 py-20 bg-white border-2 border-dashed border-aura-dark/5 rounded-[2rem] flex flex-col items-center justify-center text-aura-dark/20 text-center">
                <UtensilsCrossed size={48} className="mb-4 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-medium italic">No dishes in the digital vault yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-12">
            <div className="bg-white rounded-[2.5rem] p-8 border border-aura-dark/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <h2 className="serif text-2xl mb-8 relative z-10">Add New Dish</h2>
              
              <form onSubmit={handleAddDish} className="space-y-5 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Dish Name</label>
                    <div className="relative">
                      <UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                      <input 
                        type="text" required value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                        placeholder="Ex: Miso Glazed Barramundi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Price ($)</label>
                      <div className="relative">
                        <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                        <input 
                          type="number" step="0.01" required value={formData.price}
                          onChange={e => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                          placeholder="24.50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Calories</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                        <input 
                          type="number" required value={formData.calories}
                          onChange={e => setFormData({...formData, calories: e.target.value})}
                          className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                          placeholder="450"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Description</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-aura-dark/20" size={16} />
                      <textarea 
                        required value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none min-h-[100px]"
                        placeholder="Describe the dish..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as MenuItem['category']})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none appearance-none"
                      >
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Drink">Drink</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">3D Model URL (.glb)</label>
                    <div className="relative">
                      <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                      <input 
                        type="url" required value={formData.modelUrl}
                        onChange={e => setFormData({...formData, modelUrl: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                        placeholder="https://.../model.glb"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                      <input 
                        type="url" required value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                        placeholder="https://.../image.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Ingredients (comma separated)</label>
                      <input 
                        type="text" value={formData.ingredients}
                        onChange={e => setFormData({...formData, ingredients: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                        placeholder="Salt, Pepper, Oil..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Allergens (comma separated)</label>
                      <input 
                        type="text" value={formData.allergens}
                        onChange={e => setFormData({...formData, allergens: e.target.value})}
                        className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                        placeholder="Dairy, Nuts..."
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-aura-dark text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl mt-4"
                >
                  Create Digital Dish
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
