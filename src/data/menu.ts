// ============================================================
//  MENU CONFIG — edit this file to add or change menu items
//
//  1. Drop your image into:   public/qhom/
//  2. Drop your 3D model into: public/qhom/
//  3. Add an entry below — just type the filenames, no paths needed
// ============================================================

export interface MenuItem {
  id: string;
  name: string;
  amharicName: string;
  price: number;
  description: string;       // Amharic description
  descriptionEn: string;     // English description
  ingredients: string[];
  allergens: string[];
  calories: number;
  modelUrl: string;
  imageUrl: string;
  category: 'FastFood' | 'main dish';
  amharicCategory: string;
}

// ── Add your dishes here ────────────────────────────────────
const dishes: Array<Omit<MenuItem, 'imageUrl' | 'modelUrl'> & { image: string; model: string }> = [

  {
    id: 'ff-1',
    name: 'Dagi Normal Burrito',
    amharicName: 'በሪቶ',
    price: 230,
    description: 'በድንች፣ አቮካዶ፣ እንቁላል እና አትክልት የተሞላ ትኩስና እና ጣፋጭ ቡሪቶ።',
    descriptionEn: 'A fresh and delicious burrito filled with potatoes, avocado, egg, and vegetables.',
    ingredients: ['ቂጣ', 'ድንች', 'አቮካዶ', 'እንቁላል', 'የበሰሉ አትክልቶች'],
    allergens: ['ግሉተን (ቂጣ)', 'እንቁላል'],
    calories: 600,
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች',
    image: 'borrito.jpg',          // ← filename in public/qhom/
    model: 'burrito.glb',          // ← filename in public/qhom/
  },

  {
    id: 'ff-2',
    name: 'Dagi Special Burrito',
    amharicName: 'እስፔሻል በሪቶ',
    price: 300,
    description: 'ልዩ ጣዕም የሚፈልጉ ሰዎች ምርጫ፤ የበሬ ሥጋ፣ አይብ፣ አቮካዶ፣ እንቁላል፣ የተጠበሱ ድንች እና ፈላፍል የተዋሃዱበት ልዩ ቡሪቶ።',
    descriptionEn: 'The ultimate burrito for those who want bold flavour — beef, cheese, avocado, egg, fried potatoes and falafel all in one.',
    ingredients: ['ቂጣ', 'የተፈጨ ሥጋ', 'እንቁላል', 'ድንች', 'አቮካዶ', 'አይብ', 'ፈላፍል'],
    allergens: ['ግሉተን (ቂጣ)', 'እንቁላል', 'ወተት (አይብ)', 'ሶያ/ባቄላ (ፈላፍል)'],
    calories: 950,
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች',
    image: 'special borrito.jpg',  // ← filename in public/qhom/
    model: 'burnt_egg_burrito.glb', // ← filename in public/qhom/
  },

  {
    id: 'ff-3',
    name: 'Pasta',
    amharicName: 'ፓስታ',
    price: 100,
    description: 'ፓስታ በቲማቲም ሶስ፣ በጣዕም የተሞላ እና ግሩም ጣዕም ያለው ፓስታ።',
    descriptionEn: 'Pasta in a rich tomato sauce — full of flavour with a perfect finish.',
    ingredients: ['ፓስታ', 'ቲማቲም', 'በርበሬ', 'ነጭ ሽንኩርት'],
    allergens: ['ግሉተን (ፓስታ)'],
    calories: 450,
    category: 'main dish',
    amharicCategory: 'የቤቱ እሰፔሻል',
    image: 'pasta.jpg',            // ← filename in public/qhom/
    model: 'ertib.glb',            // ← filename in public/qhom/
  },

  // ── TEMPLATE — copy this block to add a new item ──────────
  // {
  //   id: 'ff-4',                          // unique id, increment the number
  //   name: 'My New Dish',
  //   amharicName: 'አዲስ ምግብ',
  //   price: 150,
  //   description: 'የአማርኛ መግለጫ።',
  //   descriptionEn: 'English description here.',
  //   ingredients: ['ingredient 1', 'ingredient 2'],
  //   allergens: ['allergen 1'],
  //   calories: 500,
  //   category: 'FastFood',                // 'FastFood' or 'main dish'
  //   amharicCategory: 'ፈጣን ምግቦች',
  //   image: 'my_photo.jpg',               // ← put this file in public/qhom/
  //   model: 'my_model.glb',              // ← put this file in public/qhom/
  // },

];
// ────────────────────────────────────────────────────────────

// Builds full URLs automatically — no need to touch this part
const ASSETS = '/qhom/';
export const MENU_DATA: MenuItem[] = dishes.map(({ image, model, ...rest }) => ({
  ...rest,
  imageUrl: ASSETS + image,
  modelUrl: ASSETS + model,
}));
