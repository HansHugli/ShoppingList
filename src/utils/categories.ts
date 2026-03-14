import { ShoppingItemData, CategoryGroup } from '../types/shopping';

/** Client-side category assignment based on ingredient name keywords.
 *  Not persisted — the eCookbook schema has no category field. */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Produce: [
    'lettuce', 'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'celery',
    'potato', 'broccoli', 'spinach', 'kale', 'cucumber', 'zucchini', 'squash',
    'mushroom', 'avocado', 'lemon', 'lime', 'orange', 'apple', 'banana',
    'berry', 'berries', 'strawberry', 'blueberry', 'grape', 'mango', 'pineapple',
    'corn', 'peas', 'beans', 'green bean', 'cabbage', 'cauliflower', 'asparagus',
    'eggplant', 'beet', 'radish', 'turnip', 'parsley', 'cilantro', 'basil',
    'mint', 'dill', 'chive', 'scallion', 'shallot', 'ginger', 'jalapeño',
    'serrano', 'habanero', 'bell pepper', 'sweet potato', 'yam',
  ],
  Dairy: [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'egg',
    'eggs', 'cottage cheese', 'cream cheese', 'mozzarella', 'cheddar',
    'parmesan', 'ricotta', 'whipping cream', 'half and half', 'buttermilk',
  ],
  Meat: [
    'chicken', 'beef', 'pork', 'turkey', 'lamb', 'sausage', 'bacon',
    'ham', 'steak', 'ground beef', 'ground turkey', 'ground pork',
    'ribs', 'roast', 'tenderloin', 'thigh', 'breast', 'wing', 'drumstick',
  ],
  Seafood: [
    'salmon', 'tuna', 'shrimp', 'cod', 'tilapia', 'crab', 'lobster',
    'scallop', 'clam', 'mussel', 'oyster', 'fish', 'anchovy', 'sardine',
  ],
  Bakery: [
    'bread', 'baguette', 'roll', 'tortilla', 'pita', 'naan', 'bun',
    'croissant', 'muffin', 'bagel', 'wrap',
  ],
  Pantry: [
    'flour', 'sugar', 'salt', 'oil', 'olive oil', 'vegetable oil', 'vinegar',
    'soy sauce', 'rice', 'pasta', 'noodle', 'broth', 'stock', 'tomato sauce',
    'tomato paste', 'coconut milk', 'honey', 'maple syrup', 'peanut butter',
    'jam', 'jelly', 'cereal', 'oat', 'oats', 'quinoa', 'lentil', 'chickpea',
    'canned', 'baking soda', 'baking powder', 'yeast', 'cornstarch',
    'vanilla', 'chocolate', 'cocoa', 'nuts', 'almond', 'walnut', 'pecan',
  ],
  Spices: [
    'cumin', 'paprika', 'oregano', 'thyme', 'rosemary', 'cinnamon',
    'nutmeg', 'cloves', 'turmeric', 'cayenne', 'chili powder', 'curry',
    'bay leaf', 'sage', 'coriander', 'cardamom', 'allspice', 'mustard',
    'black pepper', 'white pepper', 'red pepper flakes',
  ],
  Frozen: [
    'frozen', 'ice cream', 'popsicle', 'frozen pizza', 'frozen vegetable',
  ],
  Beverages: [
    'juice', 'soda', 'water', 'coffee', 'tea', 'wine', 'beer',
  ],
  Condiments: [
    'ketchup', 'mustard', 'mayonnaise', 'mayo', 'hot sauce', 'salsa',
    'bbq sauce', 'ranch', 'dressing', 'relish', 'worcestershire',
  ],
};

export function assignCategory(itemName: string): string {
  const lower = itemName.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
}

export function groupByCategory(items: ShoppingItemData[]): CategoryGroup[] {
  const groups = new Map<string, ShoppingItemData[]>();

  for (const item of items) {
    const category = assignCategory(item.item);
    const existing = groups.get(category);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(category, [item]);
    }
  }

  // Sort categories alphabetically, but put "Other" last
  const entries = Array.from(groups.entries());
  entries.sort(([a], [b]) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return entries.map(([category, items]) => ({ category, items }));
}
