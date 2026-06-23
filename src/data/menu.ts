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
    price: 210.00,
    description: 'ቡሪቶ: A warm, soft flour tortilla wrapped with fresh garden greens, sliced ripe tomatoes, crisp cucumbers, hand-smashed Haas avocado, and a smooth zesty garlic herb dressing. (Examine the 3D model of our fresh organic avocado ingredients!)',
    ingredients: ['Flour Tortilla', 'Garden Greens', 'Haas Avocado', 'Sliced Tomatoes', 'Garlic Herb Dressing'],
    allergens: ['Gluten'],
    calories: 380,
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb",
    imageUrl: "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=800&q=80",
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች'
  },
  {
    id: 'ff-2',
    name: 'Dagi Special Burrito',
    amharicName: 'እስፔሻል በሪቶ',
    price: 300.00,
    description: 'ልዩ ዋፕ: Premium crispy hand-battered golden cod fish filet wrapped in a warm spinach tortilla with double melted Swiss cheese, fresh dill tartar cream, and organic cabbage. (Preview our pristine 3D aquatic catch fish model!)',
    ingredients: ['Crispy Cod Filet', 'Spinach Tortilla', 'Double Swiss Cheese', 'Organic Cabbage', 'Dill Tartar Cream'],
    allergens: ['Fish', 'Gluten', 'Dairy'],
    calories: 520,
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    category: 'FastFood',
    amharicCategory: 'ፈጣን ምግቦች'
  },
  {
    id: 'ff-3',
    name: 'Pasta • ፓስታ',
    amharicName: 'ፓስታ',
    price: 250.00,
    description: 'መደበኛ ቡሪቶ: A classic toasted flour tortilla stuffed with seasoned warm yellow rice, savory black beans, fresh sweet corn, and mild melted Cheddar cheese. Served with a premium 3D insulated canteen! (Preview the sleek 3D water container model below!)',
    ingredients: ['Flour Tortilla', 'Seasoned Yellow Rice', 'Savory Black Beans', 'Sweet Corn', 'Melted Cheddar'],
    allergens: ['Gluten', 'Dairy'],
    calories: 540,
    modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb",
    imageUrl: "https://images.unsplash.com/photo-1574484284002-982dac98677c?auto=format&fit=crop&w=800&q=80",
    category: 'main dish',
    amharicCategory: 'የቤቱ እሰፔሻል'
  }
];
