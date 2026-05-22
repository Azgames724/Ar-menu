import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth, signInWithGoogle, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Plus, Trash2, LogOut, LayoutDashboard, UtensilsCrossed, Euro, FileText, Box, Image as ImageIcon, Tag, Hash, AlertTriangle, ChevronLeft, KeyRound, Lock, User as UserIcon } from 'lucide-react';
import { MenuItem } from '../data/menu';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Local File Upload states
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localModelName, setLocalModelName] = useState<string>('');
  const [localImageName, setLocalImageName] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password changing states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    allergens: '',
    calories: '',
    modelUrl: '',
    imageUrl: '',
    category: 'Wrap' as MenuItem['category']
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
      setLocalModelName('');
      setLocalImageName('');
      setImportStatus(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        ingredients: '',
        allergens: '',
        calories: '',
        modelUrl: '',
        imageUrl: '',
        category: 'Wrap'
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isModel = type === 'model';
    if (isModel) {
      setIsUploadingModel(true);
    } else {
      setIsUploadingImage(true);
    }
    setUploadError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Content = result.split(',')[1];
          resolve(base64Content);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: `${Date.now()}-${file.name.replace(/\s+/g, '_')}`,
          fileType: file.type,
          base64,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await response.json();

      if (isModel) {
        setFormData(prev => ({ ...prev, modelUrl: data.url }));
        setLocalModelName(file.name);
      } else {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        setLocalImageName(file.name);
      }
    } catch (err: any) {
      setUploadError(`Upload failed: ${err.message || err}`);
    } finally {
      if (isModel) {
        setIsUploadingModel(false);
      } else {
        setIsUploadingImage(false);
      }
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Check if array or single object
        if (Array.isArray(parsed)) {
          let count = 0;
          for (const dish of parsed) {
            if (!dish.name || !dish.price) continue;
            
            const dishData = {
              name: dish.name,
              price: parseFloat(dish.price) || 0,
              description: dish.description || '',
              ingredients: Array.isArray(dish.ingredients) ? dish.ingredients : (dish.ingredients ? String(dish.ingredients).split(',').map((i: any) => i.trim()).filter((i: any) => i !== '') : []),
              allergens: Array.isArray(dish.allergens) ? dish.allergens : (dish.allergens ? String(dish.allergens).split(',').map((i: any) => i.trim()).filter((i: any) => i !== '') : []),
              calories: parseInt(dish.calories) || 0,
              modelUrl: dish.modelUrl || '',
              imageUrl: dish.imageUrl || '',
              category: (dish.category === 'Burrito' ? 'Burrito' : 'Wrap') as MenuItem['category'],
              authorId: user?.uid || 'imported',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'dishes'), dishData);
            count++;
          }
          
          setImportStatus({
            type: 'success',
            message: `Successfully batch-imported ${count} dishes directly into Firestore!`
          });
        } else if (parsed && typeof parsed === 'object') {
          setFormData({
            name: parsed.name || '',
            price: parsed.price ? String(parsed.price) : '',
            description: parsed.description || '',
            ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.join(', ') : (parsed.ingredients || ''),
            allergens: Array.isArray(parsed.allergens) ? parsed.allergens.join(', ') : (parsed.allergens || ''),
            calories: parsed.calories ? String(parsed.calories) : '',
            modelUrl: parsed.modelUrl || '',
            imageUrl: parsed.imageUrl || '',
            category: (parsed.category === 'Burrito' ? 'Burrito' : 'Wrap') as MenuItem['category']
          });

          setImportStatus({
            type: 'success',
            message: `Successfully loaded "${parsed.name || 'dish'}" data! Feel free to modify, attach local files, and save.`
          });
        } else {
          throw new Error('Unsupported JSON files.');
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Failed to import JSON file: ${err.message || err}`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ error: 'Password must be at least 6 characters.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPasswordStatus({ success: true });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordStatus({ error: error.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogin = async (emailValue: string, passwordValue: string) => {
    setLoginError(null);
    setIsLoggingIn(true);
    
    // Normalize username/email
    let normalizedEmail = emailValue.trim();
    if (normalizedEmail.toLowerCase() === 'admin') {
      normalizedEmail = 'admin@dagi.com';
    }
    
    // Normalize password if they entered 'admin' (which is under Firebase's 6 character limit)
    let normalizedPassword = passwordValue;
    if (normalizedEmail.toLowerCase() === 'admin@dagi.com' && passwordValue === 'admin') {
      normalizedPassword = 'admin_secure_password';
    }

    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    } catch (error: any) {
      if (normalizedEmail === 'admin@dagi.com') {
        // Auto-create on the fly in sandboxed environment if doesn't exist yet
        try {
          await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
        } catch (createError: any) {
          setLoginError(`Authentication failed: ${error.message || error}`);
        }
      } else {
        setLoginError(error.message || 'Incorrect credentials');
      }
    } finally {
      setIsLoggingIn(false);
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
      <div className="min-h-screen flex items-center justify-center bg-aura-paper p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-aura-dark/5"
        >
          <div className="w-16 h-16 bg-aura-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <LayoutDashboard className="text-aura-gold" size={32} />
          </div>
          
          <div className="text-center mb-6">
            <h1 className="serif text-3xl mb-1">Dagi Admin</h1>
            <p className="text-aura-dark/40 text-[9px] uppercase tracking-[0.25em] font-bold">
              Secure Terminal Access
            </p>
          </div>

          <div className="bg-aura-gold/5 border border-aura-gold/20 rounded-2xl p-4 mb-6">
            <span className="text-[9px] font-black tracking-widest text-aura-gold uppercase block mb-2">Default Admin Credentials</span>
            <div className="space-y-1 text-xs text-aura-dark/80 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="opacity-40">Username:</span>
                <span className="font-mono text-aura-dark">admin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="opacity-40">Password:</span>
                <span className="font-mono text-aura-dark">admin</span>
              </div>
            </div>
            
            <button
              onClick={() => handleLogin('admin', 'admin')}
              disabled={isLoggingIn}
              className="mt-4 w-full bg-aura-gold text-white text-[10px] font-bold uppercase tracking-widest py-2.5 px-4 rounded-xl hover:bg-neutral-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoggingIn ? 'Connecting...' : 'Instant Demo Login'}
            </button>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-2xl text-xs font-medium mb-6 leading-relaxed">
              {loginError}
            </div>
          )}

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as typeof e.target & {
                email: { value: string };
                password: { value: string };
              };
              handleLogin(target.email.value, target.password.value);
            }}
            className="space-y-5"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Email / Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/25" size={14} />
                  <input 
                    name="email"
                    type="text" 
                    required 
                    defaultValue="admin"
                    className="w-full bg-aura-dark/5 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                    placeholder="admin"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/25" size={14} />
                  <input 
                    name="password"
                    type="password" 
                    required 
                    defaultValue="admin"
                    className="w-full bg-aura-dark/5 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-aura-dark text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              {isLoggingIn ? 'Authorizing...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-aura-dark/5" />
            <span className="text-[8px] uppercase tracking-widest font-black text-aura-dark/20 text-center">Or continue with</span>
            <div className="h-px flex-1 bg-aura-dark/5" />
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full mt-4 bg-white border border-aura-dark/10 text-aura-dark py-3.5 rounded-2xl font-bold uppercase tracking-[0.1em] text-[10px] hover:bg-neutral-50 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-3.5 h-3.5" />
            Google Workspace
          </button>
          
          <p className="mt-6 text-center text-[9px] text-aura-dark/30 font-medium leading-relaxed">
            Authorized personnel only.<br />Access logged and monitored.
          </p>

          <Link 
            to="/" 
            className="mt-6 flex items-center justify-center gap-2 text-aura-dark/40 hover:text-aura-dark transition-colors"
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
          <div className="sticky top-12 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-aura-dark/5 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <h2 className="serif text-2xl mb-4 relative z-10">Add New Dish</h2>

              <div className="mb-6 p-4.5 bg-aura-gold/5 rounded-[2rem] border border-dashed border-aura-gold/30 text-center relative z-10">
                <span className="text-[10px] font-black tracking-widest text-aura-gold uppercase block mb-1">⚡ Load Dish Form File</span>
                <p className="text-[9px] text-aura-dark/60 leading-relaxed mb-3">
                  Upload a local <strong>.json</strong> file containing dish specifications to automatically populate the fields!
                </p>
                <label className="inline-flex items-center gap-1.5 bg-aura-dark hover:bg-neutral-850 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md">
                  <Plus size={12} className="text-aura-gold" />
                  <span>Choose local .json file</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleJsonImport} 
                    className="hidden" 
                    id="json-file-importer"
                  />
                </label>
              </div>

              {importStatus && (
                <div role="status" className={`p-4 rounded-2xl text-[10px] font-semibold tracking-wide mb-6 relative z-10 leading-relaxed ${
                  importStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-600 border border-red-105'
                }`}>
                  {importStatus.message}
                </div>
              )}
              
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
                        <option value="Wrap">Wrap</option>
                        <option value="Burrito">Burrito</option>
                      </select>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-2xl text-[10px] font-medium leading-relaxed mb-4">
                      {uploadError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40">3D Model URL (.glb)</label>
                      <span className="text-[8px] text-aura-gold font-bold uppercase tracking-wider">or upload file</span>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                        <input 
                          type="text" required value={formData.modelUrl}
                          onChange={e => setFormData({...formData, modelUrl: e.target.value})}
                          className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                          placeholder="https://.../model.glb or local upload"
                        />
                      </div>
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-aura-dark/5 hover:bg-aura-dark/10 active:scale-[0.98] text-aura-dark text-[10px] font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all border border-dashed border-aura-dark/10">
                        <Plus size={14} />
                        <span>{isUploadingModel ? 'Uploading 3D model...' : 'Choose 3D Model file (.glb)'}</span>
                        <input 
                          type="file" 
                          accept=".glb" 
                          onChange={(e) => handleFileUpload(e, 'model')} 
                          className="hidden" 
                        />
                      </label>
                      {localModelName && (
                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1 max-w-full overflow-hidden">
                          <span className="truncate">✓ Active glb file: {localModelName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40">Image URL</label>
                      <span className="text-[8px] text-aura-gold font-bold uppercase tracking-wider">or upload image</span>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={16} />
                        <input 
                          type="text" required value={formData.imageUrl}
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full bg-aura-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                          placeholder="https://.../image.jpg or local upload"
                        />
                      </div>
                      <label className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-aura-dark/5 hover:bg-aura-dark/10 active:scale-[0.98] text-aura-dark text-[10px] font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-all border border-dashed border-aura-dark/10">
                        <Plus size={14} />
                        <span>{isUploadingImage ? 'Uploading image...' : 'Choose Image File (JPG, PNG, WEBP)'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileUpload(e, 'image')} 
                          className="hidden" 
                        />
                      </label>
                      {localImageName && (
                        <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1 max-w-full overflow-hidden">
                          <span className="truncate">✓ Active image: {localImageName}</span>
                        </div>
                      )}
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

            {/* Change Password Settings card */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-aura-dark/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-aura-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex items-center gap-2.5 mb-6 relative z-10">
                <div className="p-2 bg-aura-dark/5 text-aura-gold rounded-xl">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h2 className="serif text-xl">Admin Security</h2>
                  <p className="text-[8px] text-aura-dark/40 uppercase tracking-[0.2em] font-bold">Update Credentials</p>
                </div>
              </div>

              {passwordStatus && (
                <div className={`p-4 rounded-2xl text-[11px] font-medium mb-4 leading-relaxed ${
                  passwordStatus.success 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {passwordStatus.success ? 'Password updated successfully!' : passwordStatus.error}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={14} />
                    <input 
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-aura-dark/5 border-none rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                      placeholder="New password (min 6 chars)"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-black text-aura-dark/40 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-aura-dark/20" size={14} />
                    <input 
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-aura-dark/5 border-none rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-aura-gold/50 transition-all outline-none"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full mt-2 bg-aura-dark text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Updating Password...' : 'Save Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
