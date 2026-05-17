
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  modelUrl: string;
  imageUrl: string;
  category: 'Appetizer' | 'Main' | 'Dessert' | 'Drink';
}

export const MENU_DATA: MenuItem[] = [
  {
    id: '1',
    name: 'Artisanal Avocado Toast',
    price: 14.50,
    description: 'Freshly smashed Haas avocado on sourdough, topped with heirloom radishes, micro-greens, and a citrus-infused olive oil drizzle.',
    ingredients: ['Sourdough Bread', 'Haas Avocado', 'Radish', 'Micro-greens', 'Olive Oil', 'Sea Salt', 'Lemon'],
    allergens: ['Gluten'],
    calories: 420,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800',
    category: 'Appetizer'
  },
  {
    id: '2',
    name: 'Miso Glazed Barramundi',
    price: 32.00,
    description: 'Wild-caught Barramundi fillet, miso glaze, bok choy, and ginger-infused jasmine rice. A heart-healthy choice rich in Omega-3.',
    ingredients: ['Barramundi Fish', 'White Miso', 'Bok Choy', 'Jasmine Rice', 'Ginger', 'Soy Sauce', 'Sesame Oil'],
    allergens: ['Fish', 'Soy', 'Sesame'],
    calories: 580,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF-Binary/BarramundiFish.glb',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
    category: 'Main'
  },
  {
    id: '3',
    name: 'Peking Roast Duck',
    price: 28.00,
    description: 'Traditional slow-roasted duck with exceptionally crispy skin, served with artisanal plum sauce and fresh spring onions.',
    ingredients: ['Free-range Duck', 'Plum Sauce', 'Spring Onion', 'Honey', 'Five Spice Powder', 'Wheat Flour (Pancakes)'],
    allergens: ['Soy', 'Gluten'],
    calories: 720,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
    imageUrl: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&q=80&w=800',
    category: 'Main'
  },
  {
    id: '4',
    name: 'Alpine Mineral Water',
    price: 6.00,
    description: 'Chilled premium sparkling mineral water sourced from high-altitude Alpine springs.',
    ingredients: ['Natural Mineral Water', 'Carbonation'],
    allergens: [],
    calories: 0,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
    imageUrl: 'https://images.unsplash.com/photo-1523362628742-0c2602157522?auto=format&fit=crop&q=80&w=800',
    category: 'Drink'
  }
];
