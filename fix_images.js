const fs = require('fs');
const path = require('path');
const pool = require('./src/database/connection');

function getBase64Image(filename) {
  const filepath = path.join(__dirname, '../Frontend/public', filename);
  if (fs.existsSync(filepath)) {
    const data = fs.readFileSync(filepath);
    const ext = path.extname(filepath).substring(1);
    return `data:image/${ext};base64,${data.toString('base64')}`;
  }
  return null;
}

async function fixImages() {
  const images = {
    burger: getBase64Image('burger_featured_1778218636790.png'),
    pizza: getBase64Image('pizza_featured_1778218619659.png'),
    pasta: getBase64Image('pasta_featured_1778218655333.png'),
    drinks: getBase64Image('drinks_featured_1778218694577.png'),
    dessert: getBase64Image('dessert_featured_1778218675867.png')
  };

  const [items] = await pool.query("SELECT id, item_name, image FROM menu_items WHERE image LIKE '/uploads%'");
  
  console.log(`Found ${items.length} broken items`);

  for (const item of items) {
    const name = item.item_name.toLowerCase();
    let img = images.burger; // default
    if (name.includes('pizza')) img = images.pizza;
    else if (name.includes('pasta') || name.includes('mac')) img = images.pasta;
    else if (name.includes('drink') || name.includes('cooler') || name.includes('lagune')) img = images.drinks;
    else if (name.includes('desert') || name.includes('dessert') || name.includes('cake') || name.includes('ice')) img = images.dessert;
    else if (name.includes('burger')) img = images.burger;

    if (img) {
      await pool.query("UPDATE menu_items SET image = ? WHERE id = ?", [img, item.id]);
      console.log(`Updated item ${item.id} (${item.item_name})`);
    }
  }

  console.log("Done");
  process.exit();
}

fixImages();
