export interface MenuItem {
  id: string;
  name: string;
  amharicName: string;
  price: number;
  description: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  modelUrl: string;
  imageUrl: string;
  category: 'FastFood' | 'main dish';
  amharicCategory: string;
}

export const MENU_DATA: MenuItem[] = [
  {
    id: 'ff-1',
    name: 'Dagi Normal Burrito',
    amharicName: 'በሪቶ',
    price: 230.00,
    description: 'በድንች፣ አቮካዶ፣ እንቁላል እና አትክልት የተሞላ ትኩስና እና ጣፋጭ ቡሪቶ።)',
    ingredients: ['ቂጣ', 'ድንች', 'አቮካዶ', 'እንቁላል', 'የበሰሉ አትክልቶች',],
    allergens: ['ግሉተን (ቂጣ)', 'እንቁላል'],
    calories: 600,
    modelUrl: "/qhom/burrito.glb",
    imageUrl: "/qhom/borrito.jpg",
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች'
  },
  {
    id: 'ff-2',
    name: 'Dagi Special Burrito',
    amharicName: 'እስፔሻል በሪቶ',
    price: 300.00,
    description: 'ልዩ ጣዕም የሚፈልጉ ሰዎች ምርጫ፤ የበሬ ሥጋ፣ አይብ፣ አቮካዶ፣ እንቁላል፣ የተጠበሱ ድንች እና ፈላፍል የተዋሃዱበት ልዩ ቡሪቶ።',
    ingredients: ['ቂጣ', 'የተፈጨ  ሥጋ', 'እንቁላል', 'ድንች', 'አቮካዶ', 'አይብ', 'ፈላፍል'],
    allergens: ['ግሉተን (ቂጣ)', 'እንቁላል', 'ወተት (አይብ)', 'ሶያ/ባቄላ (ፈላፍል)'],
    calories: 950,
    modelUrl: "/qhom/burnt_egg_burrito.glb",
    imageUrl: "/qhom/special borrito.jpg",
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች'
  },
  {
    id: 'ff-3',
    name: 'Pasta • ፓስታ',
    amharicName: 'ፓስታ',
    price: 100.00,
    description: 'ፓስታ በቲማቲም ሶስ፣ በጣዕም የተሞላ እና ግሩም ጣዕም ያለው ፓስታ።',
    ingredients: ['ፓስታ', 'ቲማቲም ', 'በርበሬ ', 'ነጭ ሽንኩርት'],
    allergens: ['ግሉተን (ፓስታ)'],
    calories: 450,
    modelUrl: "/qhom/ertib.glb",
    imageUrl: "/qhom/pasta.jpg",
    category: 'main dish',
    amharicCategory: ''
  }
];
