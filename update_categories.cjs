const pool = require('./src/database/connection');

async function run() {
  try {
    console.log('Starting categories update...');

    // 1. Soft-delete old categories
    await pool.execute('UPDATE menu_categories SET deletedAt = NOW()');

    // 2. Insert new categories
    const categories = [
      { name: 'Breakfast', icon: '🍳' },
      { name: 'Lunch', icon: '🍽️' },
      { name: 'Dinner', icon: '🥩' },
      { name: 'Bar', icon: '🍹' }
    ];

    const catIds = {};
    for (const cat of categories) {
      // Check if already exists (active or soft-deleted)
      const [exist] = await pool.execute('SELECT id FROM menu_categories WHERE category_name = ?', [cat.name]);
      if (exist.length > 0) {
        const id = exist[0].id;
        await pool.execute('UPDATE menu_categories SET deletedAt = NULL, icon = ? WHERE id = ?', [cat.icon, id]);
        catIds[cat.name] = id;
      } else {
        const [result] = await pool.execute('INSERT INTO menu_categories (category_name, icon) VALUES (?, ?)', [cat.name, cat.icon]);
        catIds[cat.name] = result.insertId;
      }
    }

    console.log('New categories initialized:', catIds);

    // 3. Map items to their new categories
    // Dinner items:
    const dinnerItems = ['Margherita Pizza', 'white pizza', 'pesto pizza'];
    // Breakfast items:
    const breakfastItems = ['veg sandwich', 'coco desert'];
    // Bar items:
    const barItems = ['lemon cooler', 'pink velly cooler', 'Blue lagune'];
    // Lunch items (all others):
    const lunchItems = ['chessy burger', 'Beef humburger', 'Garlic pasta', 'pasta salad with frozen vegtables pasta', 'masala fries', 'creamy chessy fries', 'salted fries'];

    for (const name of dinnerItems) {
      await pool.execute("UPDATE menu_items SET category_id = ? WHERE TRIM(LOWER(item_name)) = ?", [catIds['Dinner'], name.toLowerCase().trim()]);
    }

    for (const name of breakfastItems) {
      await pool.execute("UPDATE menu_items SET category_id = ? WHERE TRIM(LOWER(item_name)) = ?", [catIds['Breakfast'], name.toLowerCase().trim()]);
    }

    for (const name of barItems) {
      await pool.execute("UPDATE menu_items SET category_id = ? WHERE TRIM(LOWER(item_name)) = ?", [catIds['Bar'], name.toLowerCase().trim()]);
    }

    for (const name of lunchItems) {
      await pool.execute("UPDATE menu_items SET category_id = ? WHERE TRIM(LOWER(item_name)) = ?", [catIds['Lunch'], name.toLowerCase().trim()]);
    }

    console.log('✅ Items mapped successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}
run();
