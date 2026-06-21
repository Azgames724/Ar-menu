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
  category: 'FastFood' | 'main dish';
}

export const MENU_DATA: MenuItem[] = [
  {
    id: 'ff-1',
    name: 'Dagi Normal Burrito • ቦሪቶ',
    price: 210.00,
    description: 'ቦሪቶ: Toasted flat flour tortilla filled with crispy seasoned sliced potatoes, eggs, and a light sautéed cabbage-carrot salad. Flavored with paprika, and signature spice blend for a bold street-style taste.',
    ingredients: ['Flour Tortilla', 'Potatoes', 'Eggs', 'Cabbage', 'Carrot', 'Paprika', 'Signature Spice Blend', 'Vegetable Oil', 'Salt'],
    allergens: ['Gluten', 'Eggs'],
    calories: 640,
    modelUrl: "/qhom/burrito.glb",
    imageUrl: "/qhom/borrito.jpg",
    category: 'FastFood'
  },
  {
    id: 'ff-2',
    name: 'Dagi Special Burrito • እስፔሻል ቦሪቶ',
    price: 300.00,
    description: 'ልዩ ስፔሻል ቦሪቶ: Toasted flour tortilla packed with eggs, crispy falafel, melted cheese, seasoned meat slices, roasted potato cubes, and a fresh cabbage-carrot salad. All combined with signature spices for a rich, bold, and filling street-style flavor experience.',
    ingredients: ['Flour Tortilla', 'Eggs', 'Falafel', 'Cheese', 'Meat Slices', 'Potatoes', 'Cabbage', 'Carrot', 'Spices', 'Salt', 'Vegetable Oil'],
    allergens: ['Gluten', 'Eggs', 'Dairy', 'Soy/Legumes (Falafel)', 'Meat'],
    calories: 1020,
    modelUrl: "/qhom/burnt_egg_burrito.glb",
    imageUrl: "/qhom/special borrito.jpg",
    category: 'FastFood'
  },
  {
    id: 'ff-3',
    name: 'Pasta • ፓስታ',
    price: 100.00,
    description: 'መደበኛ ቡሪቶ: A classic toasted flour tortilla stuffed with seasoned warm yellow rice, savory black beans, fresh sweet corn, and mild melted Cheddar cheese. Served with a premium 3D insulated canteen! (Preview the sleek 3D water container model below!)',
    ingredients: ['Flour Tortilla', 'Seasoned Yellow Rice', 'Savory Black Beans', 'Sweet Corn', 'Melted Cheddar'],
    allergens: ['Gluten', 'Dairy'],
    calories: 540,
    modelUrl: "/qhom/spaghetti_dish_3d_scanned.glb",
    imageUrl: "/qhom/pasta.jpg",
    category: 'main dish'
  },
  
  /*
  ========================================================================
  LOCAL 'QHOM' ASSETS TEMPLATE EXAMPLE (Uncomment & Customize!):
  Place your custom images (e.g., ertibb.png) and 3D models (e.g., ertib.glb or ertib.obj)
  inside your newly created /public/qhom/ folder, then reference them as shown below:
  ========================================================================
  ,
  {
    id: 'ff-qhom-example',
    name: 'Dagi Custom Qhom Meal • የቤትዎ ልዩ ምግብ',
    price: 15.00,
    description: 'ልዩ የቤትዎ ምግብ: This model and picture are served directly from your local /public/qhom/ folder! Change the files inside "qhom" in your workspace to instantly update the visual interface.',
    ingredients: ['Custom Ingredients', 'Local Sourced Veggies', 'Chef Secret Blend'],
    allergens: [],
    calories: 450,
    modelUrl: "/qhom/burrito.glb",
    imageUrl: "/qhom/borrito.jpg",
    category: 'FastFood'
  }
  */
];
