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
  category: 'Chicken' | 'Burger' | 'Pizza';
  amharicCategory: string;
}

// ── Add your dishes here ────────────────────────────────────
const dishes: Array<Omit<MenuItem, 'imageUrl' | 'modelUrl'> & { image: string; model: string }> = [

  {
    id: 'ff-1',
    amharicName: 'ጣፋጭ በርገር ከጥብስ ድንች ጋር',
    price: 350,
    description: 'ጭማቂ ያለው የበሬ ሥጋ በርገር ከትኩስ አትክልቶች፣ አይብ እና በወርቃማ የተጠበሰ ድንች ጋር የሚቀርብ ጣፋጭ ምግብ።',
    descriptionEn: 'A juicy beef burger served with fresh vegetables, cheese, and crispy golden French fries.',
    ingredients: ['የበርገር ዳቦ', 'የበሬ ሥጋ', 'አይብ', 'ሰላጣ', 'ቲማቲም', 'ሽንኩርት', 'ጥብስ ድንች'],
    allergens: ['ግሉተን (የበርገር ዳቦ)', 'ወተት (አይብ)'],
    calories: 850,
    category: 'Burger',
    amharicCategory: 'በርገር',
    image: 'bur.jpg',          // ← filename in public/qhom/
    model: 'tasty_burger_with_fries_1783589138437.glb',          // ← filename in public/qhom/
  },

  {
    id: 'ff-2',
    amharicName: 'የተጠበሰ ዶሮ',
    price: 2000,
    description: 'በልዩ ቅመማ ቅመሞች የተቀመመ እና በትክክል የተጠበሰ ለስላሳ ዶሮ ከጎን ምግብ ጋር የሚቀርብ።',
    descriptionEn: 'Tender roasted chicken seasoned with special spices and perfectly cooked, served with a side dish.',
    ingredients: ['ዶሮ', 'ነጭ ሽንኩርት', 'ቅመማ ቅመሞች', 'ቅቤ', 'ሎሚ', 'ጥብስ ድንች'],
    allergens: ['ወተት (ቅቤ)'],
    calories: 780,
    category: 'Chicken',
    amharicCategory: 'ዶሮ',
    image: 'chi.jpg',  // ← filename in public/qhom/
    model: 'textured_mesh.glb', // ← filename in public/qhom/
  },

  {
    id: 'ff-3',
    amharicName: 'ፒዛ',
    price: 450,
    description: 'በትኩስ ሊጥ፣ የቲማቲም ሶስ፣ የቀለጠ አይብ እና የተመረጡ ጣፋጭ ንጥረ ነገሮች የተዘጋጀ ጣፋጭ ፒዛ።',
    descriptionEn: 'A delicious pizza made with fresh dough, rich tomato sauce, melted cheese, and carefully selected toppings.',
    ingredients: ['የፒዛ ሊጥ', 'የቲማቲም ሶስ', 'አይብ', 'ቲማቲም', 'ኦሊቭ', 'ቃሪያ', 'ሽንኩርት'],
    allergens: ['ግሉተን (የፒዛ ሊጥ)', 'ወተት (አይብ)'],
    calories: 950,
    category: 'Pizza',
    amharicCategory: 'ፒዛ',
    image: 'piz.jpg',            // ← filename in public/qhom/
    model: 'textured_mesh (1).glb',            // ← filename in public/qhom/
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
  //   category: 'Chicken',                 // 'Chicken', 'Burger' or 'Pizza'
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
