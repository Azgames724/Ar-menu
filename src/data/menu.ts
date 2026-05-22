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
  category: 'Wrap' | 'Burrito';
}

export const MENU_DATA: MenuItem[] = [
  {
    id: 'ff-1',
    name: 'Dagi Normal Wrap • መደበኛ ዋፕ',
    price: 8.50,
    description: 'መደበኛ ዋፕ: A warm, soft flour tortilla wrapped with fresh garden greens, sliced ripe tomatoes, crisp cucumbers, hand-smashed Haas avocado, and a smooth zesty garlic herb dressing. (Examine the 3D model of our fresh organic avocado ingredients!)',
    ingredients: ['Flour Tortilla', 'Garden Greens', 'Haas Avocado', 'Sliced Tomatoes', 'Garlic Herb Dressing'],
    allergens: ['Gluten'],
    calories: 380,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=800&q=80',
    category: 'Wrap'
  },
  {
    id: 'ff-2',
    name: 'Dagi Special Wrap • ልዩ ዋፕ',
    price: 12.00,
    description: 'ልዩ ዋፕ: Premium crispy hand-battered golden cod fish filet wrapped in a warm spinach tortilla with double melted Swiss cheese, fresh dill tartar cream, and shredded organic cabbage. (Preview our pristine 3D aquatic catch fish model!)',
    ingredients: ['Crispy Cod Filet', 'Spinach Tortilla', 'Double Swiss Cheese', 'Organic Cabbage', 'Dill Tartar Cream'],
    allergens: ['Fish', 'Gluten', 'Dairy'],
    calories: 520,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    category: 'Wrap'
  },
  {
    id: 'ff-3',
    name: 'Dagi Normal Burrito • መደበኛ ቡሪቶ',
    price: 9.50,
    description: 'መደበኛ ቡሪቶ: A classic toasted flour tortilla stuffed with seasoned warm yellow rice, savory black beans, fresh sweet corn, and mild melted Cheddar cheese. Served with a premium 3D insulated canteen! (Preview the sleek 3D water container model below!)',
    ingredients: ['Flour Tortilla', 'Seasoned Yellow Rice', 'Savory Black Beans', 'Sweet Corn', 'Melted Cheddar'],
    allergens: ['Gluten', 'Dairy'],
    calories: 540,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-982dac98677c?auto=format&fit=crop&w=800&q=80',
    category: 'Burrito'
  },
  {
    id: 'ff-4',
    name: 'Dagi Special Burrito • ልዩ ቡሪቶ',
    price: 13.50,
    description: 'ልዩ ቡሪቶ: An oversized toasted flour tortilla stuffed with tender marinated grilled chicken breast, black beans, seasoned cilantro rice, melted cheddar, and zesty fresh salsa. Served with our famous 3D duck collectible mascot! (Spin our adorable golden mascot toy in 3D below!)',
    ingredients: ['Grilled Chicken Breast', 'Oversized Flour Tortilla', 'Cilantro Rice', 'Black Beans', 'Cheddar Cheese', 'Zesty Salsa'],
    allergens: ['Gluten', 'Dairy'],
    calories: 680,
    modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
    imageUrl: 'https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?auto=format&fit=crop&w=800&q=80',
    category: 'Burrito'
  }
];
