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
    name: 'Dagi Normal Burrito • ቡሪቶ',
    price: 210.00,
    description: 'ቡሪቶ: A warm, soft flour tortilla wrapped with fresh garden greens, sliced ripe tomatoes, crisp cucumbers, hand-smashed Haas avocado, and a smooth zesty garlic herb dressing. (Examine the 3D model of our fresh organic avocado ingredients!)',
    ingredients: ['Flour Tortilla', 'Garden Greens', 'Haas Avocado', 'Sliced Tomatoes', 'Garlic Herb Dressing'],
    allergens: ['Gluten'],
    calories: 380,
    modelUrl: "/qhom/burrito.glb",
    imageUrl: "/qhom/borrito.jpg",
    category: 'FastFood'
  },
  {
    id: 'ff-2',
    name: 'Dagi Special Burrito • ልዩ ቡሪቶ',
    price: 300.00,
    description: 'ልዩ ዋፕ: Premium crispy hand-battered golden cod fish filet wrapped in a warm spinach tortilla with double melted Swiss cheese, fresh dill tartar cream, and shredded organic cabbage. (Preview our pristine 3D aquatic catch fish model!)',
    ingredients: ['Crispy Cod Filet', 'Spinach Tortilla', 'Double Swiss Cheese', 'Organic Cabbage', 'Dill Tartar Cream'],
    allergens: ['Fish', 'Gluten', 'Dairy'],
    calories: 520,
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
