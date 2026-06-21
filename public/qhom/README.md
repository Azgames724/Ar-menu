# Qhom Assets Directory (`/public/qhom`)

Welcome to your custom assets folder! You can put all your pictures, 3D models (`.glb`, `.gltf`, `.obj`), and other static dining assets in here so that they are served locally from your web server.

## How to refer to files in this folder

Files created in `/public/qhom` are accessible directly from the browser's root URL path `/qhom/`.

For example:
- **Image file**: Upload `ertibb.png` to `/public/qhom/ertibb.png`. You can reference it in your code or in `menu.ts` as:
  `"/qhom/ertibb.png"`
- **3D model file**: Upload `ertib.glb` or `ertib.obj` to `/public/qhom/ertib.glb`. You can reference it in your code or in `menu.ts` as:
  `"/qhom/ertib.glb"`

---

## Example Custom Menu Item Integration

You can easily edit `/src/data/menu.ts` and add or modify items to reference your custom assets. For instance:

```json
{
  "id": "custom-dish-1",
  "name": "Custom Gourmet Wrap • ልዩ መክሰስ",
  "price": 14.99,
  "description": "Your custom crafted wrap made with premium local ingredients.",
  "ingredients": ["Handrolled Flatbread", "Organic Tomatoes", "Prime Protein"],
  "allergens": ["Gluten"],
  "calories": 420,
  "modelUrl": "/qhom/ertib.glb", // Loads from /public/qhom/ertib.glb
  "imageUrl": "/qhom/ertibb.png", // Loads from /public/qhom/ertibb.png
  "category": "Wrap"
}
```

Simply drag-and-drop or upload your `.png`, `.jpg`, `.glb`, or other asset files into the `public/qhom` folder in your file explorer!
