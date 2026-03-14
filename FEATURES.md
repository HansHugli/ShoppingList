# eCookbook Shopping List — Features & Usage Guide

## Overview

The Shopping List app is a companion to the eCookbook desktop application. It puts your grocery
list on your iPhone so you can check off items while shopping. Items added from recipes on the
desktop automatically appear on your phone, and you can add your own items too.

## Screens

### Login Screen

The first time you open the app, you'll see a sign-in screen.

- Tap **"Sign in with Microsoft"** to authenticate with your Microsoft account
- This is the same account where your OneDrive/eCookbook data lives
- You only need to sign in once — the app remembers your session

### Shopping List (Main Screen)

This is where you spend most of your time. It shows all your shopping list items organized
by grocery category.

#### Viewing items

- Items are automatically grouped into categories like **Produce**, **Dairy**, **Meat**,
  **Pantry**, **Spices**, etc. based on the ingredient name
- Each category section shows a header with the category name and item count
- Unchecked items appear first, checked items are grouped at the bottom under "Checked"
- Each item shows:
  - A checkbox (circle) on the left
  - The quantity, unit, item name, and preparation style (e.g., "2 lb chicken breast (boneless)")
  - The source — which recipe it came from, or "Manual" if you added it yourself
  - A delete button (x) on the right

#### Checking off items

- **Tap any item** to check or uncheck it
- Checked items get a strikethrough and move to the "Checked" section
- Changes sync back to OneDrive automatically (after a brief 2-second delay to batch
  rapid taps)

#### Deleting items

- Tap the **x button** on the right side of any item
- A confirmation dialog appears before the item is removed
- Deletions sync back to OneDrive

#### Clearing checked items

- When you have checked items, a **"Clear (N)"** button appears in the top-right header
- Tap it to remove all checked items at once (with confirmation)
- This is useful after a shopping trip to clean up your list

#### Adding manual items

- Tap the blue **+ button** (floating action button) in the bottom-right corner
- Fill in the form:
  - **Item name** (required) — e.g., "paper towels", "chicken breast"
  - **Quantity** — defaults to 1, supports decimals
  - **Unit** — type one or tap a quick-select chip (cup, tbsp, tsp, oz, lb, can, piece, etc.)
  - **Style/prep** (optional) — e.g., "diced", "boneless", "extra firm"
- Tap **"Add"** to add the item to your list
- Manual items show "Manual" as their source

#### Editing manual items

- **Long-press** on any manually-added item to open the edit form
- Change any field and tap **"Save"**
- Only manual items can be edited — recipe items should be edited in eCookbook on the desktop

#### Refreshing

- **Pull down** on the list to force a refresh from OneDrive
- The app also automatically checks for changes every 30 seconds
- When you switch back to the app after using other apps, it refreshes automatically

#### Sync status

The header shows a small sync indicator below the title:

- **Green dot** + "Just synced" / "Synced Xm ago" — everything is up to date
- **Orange dot** + "Syncing..." — currently communicating with OneDrive
- **Red dot** + "Sync error" — something went wrong (pull to refresh to retry)
- **Gray dot** + "Offline" — no internet connection (changes are saved locally and
  will sync when you're back online)

### Settings Screen

Tap the **gear icon** in the top-right of the shopping list to open settings.

- **Account** — shows your Microsoft account name and email
- **Sync info** — library path (Documents/eCookbook), item count, last sync time
- **About** — app version and eCookbook compatibility
- **Sign Out** — disconnects your Microsoft account

## How Items Get to Your List

### From eCookbook (desktop)

1. Open a recipe in eCookbook on your computer
2. Click "Add to Shopping List" — ingredients are added to `shopping-list.json`
3. The file syncs to OneDrive
4. Open the Shopping List app on your iPhone — items appear automatically
5. If the app is already open, they'll appear within 30 seconds (or pull to refresh)

### Manually (phone)

1. Tap the **+** button on the shopping list screen
2. Enter the item details
3. Tap **"Add"**
4. The item syncs to OneDrive and will also appear in eCookbook's shopping list on desktop

## Category Grouping

Items are automatically sorted into grocery store sections based on ingredient keywords:

| Category | Example items |
|----------|--------------|
| **Produce** | lettuce, tomato, onion, garlic, avocado, lemon, basil |
| **Dairy** | milk, cheese, butter, cream, eggs, yogurt |
| **Meat** | chicken, beef, pork, bacon, sausage, ground turkey |
| **Seafood** | salmon, shrimp, tuna, cod, scallops |
| **Bakery** | bread, tortilla, baguette, rolls, pita |
| **Pantry** | flour, sugar, rice, pasta, oil, broth, canned goods |
| **Spices** | cumin, paprika, oregano, cinnamon, cayenne |
| **Frozen** | frozen vegetables, ice cream |
| **Beverages** | juice, coffee, tea, wine |
| **Condiments** | ketchup, mustard, mayo, hot sauce, salsa |
| **Other** | anything that doesn't match a known category |

Categories are assigned automatically — you don't need to set them. They are not stored in the
file and won't affect eCookbook on the desktop.

## Quantity Formatting

Quantities are displayed with unicode fraction characters for readability:

| Stored value | Displayed as |
|-------------|-------------|
| 0.25 | 1/4 |
| 0.333 | 1/3 |
| 0.5 | 1/2 |
| 0.667 | 2/3 |
| 0.75 | 3/4 |
| 1.5 | 1 1/2 |
| 2 | 2 |

## Offline Support

The app works without an internet connection:

- On first successful sync, items are cached locally on your phone
- If you open the app offline, you'll see the last cached version
- You can check/uncheck and add items while offline
- Changes are saved locally and synced to OneDrive when connectivity returns

## Conflict Resolution

If both the desktop and phone edit the shopping list at the same time:

- The app detects the conflict using OneDrive's eTag versioning
- It re-downloads the remote version and merges changes:
  - Your phone's checked/unchecked state wins (you just tapped it)
  - New items from both sides are kept
- The merged result is uploaded back to OneDrive

This means you can safely use eCookbook on the desktop and the Shopping List app on your
phone simultaneously without losing data.
