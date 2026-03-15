# eCookbook Shopping List — iOS Companion App

A React Native (Expo) app that syncs your shopping list from the eCookbook desktop app via OneDrive. Add recipe ingredients from the desktop, check them off at the store on your phone.

See [FEATURES.md](FEATURES.md) for app features and usage guide.
See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, commit conventions, and deployment.

## Tech Stack

- **React Native** (Expo managed workflow, SDK 54)
- **TypeScript**
- **Zustand** — state management
- **expo-router** — file-based routing
- **expo-auth-session** — Microsoft OAuth2 with PKCE
- **Microsoft Graph API** — OneDrive file read/write (no backend server needed)

## Project Structure

```
app/                              # Screens (expo-router, file-based routing)
  _layout.tsx                     # Root layout with auth guard + redirect logic
  index.tsx                       # Main shopping list screen
  login.tsx                       # Microsoft sign-in screen
  settings.tsx                    # Account, sync info, sign out

src/
  types/shopping.ts               # ShoppingItemData interface (matches eCookbook)
  stores/
    auth-store.ts                 # Zustand: auth tokens, login/logout, auto-refresh
    shopping-store.ts             # Zustand: shopping items, CRUD, debounced sync
  services/
    auth.ts                       # OAuth2 config, token storage (expo-secure-store)
    graph-client.ts               # Microsoft Graph API wrapper
    onedrive-sync.ts              # Sync orchestrator with eTag conflict resolution
  utils/
    format.ts                     # formatQty, normalizeUnit (ported from eCookbook)
    categories.ts                 # Ingredient-to-category keyword mapping
  components/
    ShoppingItemRow.tsx           # Item row with checkbox and delete
    CategoryHeader.tsx            # Section header for category groups
    AddItemForm.tsx               # Add/edit item modal with unit picker chips
    SyncIndicator.tsx             # Sync status indicator (dot + label)
  hooks/
    useSync.ts                    # Auto-sync: polling, foreground refresh, init
```

## Prerequisites

- **Node.js** 18+
- **Expo Go** app on your iPhone (from the App Store — must support SDK 54)
- **Microsoft account** (the same one your OneDrive/eCookbook files are on)
- **Azure account** (free — see setup below)
- **Apple Developer account** ($99/year — only needed for deployment, not development)

## Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ShoppingList
npm install
```

### 2. Azure App Registration

#### Why Azure?

Your eCookbook recipes and shopping list live in your OneDrive Documents folder. To let the
iPhone app read and write that file, it needs permission from Microsoft. Azure Active Directory
(now called Microsoft Entra ID) is Microsoft's identity platform — it's how any app gets
authorized to access OneDrive, Outlook, Teams, etc. via the Microsoft Graph API.

The registration is free. You do NOT need a paid Azure subscription — just a free account
linked to your Microsoft account.

#### Creating a free Azure account

If you've never used Azure before, your personal Microsoft account (live.com, outlook.com,
hotmail.com) won't have access to the Azure Portal by default.

1. Go to https://azure.microsoft.com/free and click **"Start free"**
2. Sign in with your personal Microsoft account
3. Complete verification (phone number + credit card for identity — you will NOT be charged)
4. Once created, you can access https://portal.azure.com

#### Registering the app

1. Go to https://portal.azure.com and sign in

2. In the **search bar at the top**, type **"App registrations"** and click the result
   (it's under Microsoft Entra ID / Azure Active Directory)

3. Click **"+ New registration"**

4. Fill in:
   - **Name**: `eCookbook Shopping List`
   - **Supported account types**: Choose **"Personal Microsoft accounts only"**
     (unless you use a work/school OneDrive, then choose "Accounts in any organizational
     directory and personal Microsoft accounts")
   - **Redirect URI**:
     - Platform: **"Mobile and desktop applications"**
     - URI: `com.ecookbook.shoppinglist://auth`

5. Click **Register**

6. Copy the **Application (client) ID** from the overview page (a UUID like `a1b2c3d4-e5f6-...`)

7. Go to **"API permissions"** in the left sidebar:
   - Click **"+ Add a permission"** > **"Microsoft Graph"** > **"Delegated permissions"**
   - Search and add: `Files.ReadWrite` and `User.Read`
   - Click **"Add permissions"**
   - (No admin consent needed for personal accounts)

#### Adding redirect URIs for development

When running in Expo Go during development, the app uses an `exp://` redirect URI instead of
the custom scheme. You need to add these in Azure:

1. In your app registration, go to **Authentication**
2. Click **"+ Add Redirect URI"** and add:
   - `exp://localhost:8081/--/auth`
   - `exp://<YOUR_LOCAL_IP>:<PORT>/--/auth` (e.g., `exp://192.168.1.42:8082/--/auth`)
3. Find your local IP and port in the Expo terminal output when you run `npm start`
   (it shows something like `Metro waiting on exp://192.168.1.42:8082`)
4. Keep the original `com.ecookbook.shoppinglist://auth` — it's needed for production builds

**Important:** The `consumers` tenant endpoint is used for personal Microsoft accounts. This is
configured in `src/services/auth.ts`. If you use a work/school account, change it to `common`.

### 3. Configure the Client ID

Paste your Application (client) ID into these two files:

- **`src/services/auth.ts`** — the `CLIENT_ID` constant (line 5)
- **`app/login.tsx`** — the `clientId` field in `useAuthRequest` (line 15)

### 4. Run in development

```bash
npm start
```

This starts the Expo dev server (Metro bundler). To load the app on your iPhone:

1. Make sure your PC and iPhone are on the **same WiFi network**
2. Open the **Expo Go** app on your iPhone
3. Scan the QR code shown in the terminal

If port 8081 is in use, Expo will prompt to use another port. You can also specify one:

```bash
npx expo start --port 8082
```

The app will hot-reload as you edit code.

### 5. Common development issues

| Issue | Fix |
|-------|-----|
| "Project is incompatible with this version of Expo Go" | Your Expo Go app doesn't support SDK 54. Update from the App Store. |
| "Unable to resolve react-native-screens" | Run `npx expo install react-native-screens` |
| SafeAreaView deprecation warning | Already fixed — using `react-native-safe-area-context` |
| OAuth redirect_uri mismatch | Add your exact `exp://IP:PORT/--/auth` to Azure redirect URIs |
| "Please use the /consumers endpoint" | `src/services/auth.ts` should have `TENANT = 'consumers'` for personal MS accounts |
| Port already in use | Use `npx expo start --port <different-port>` |

## Deployment

### Prerequisites

- **Apple Developer account** ($99/year) — required for any iOS deployment outside Expo Go.
  Sign up at https://developer.apple.com/programs/enroll/ (Individual enrollment).
  After paying, it may take a few hours for App Store Connect access to activate.
- **EAS CLI** — Expo's cloud build service
- **Expo account** — free, sign up at https://expo.dev/signup

### First-time setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to Expo (use browser auth if interactive login fails)
npx eas login --browser

# Configure build profiles
npx eas build:configure
```

### Register your devices

Each physical iOS device (iPhone, iPad) must be registered with EAS before it can install
preview builds. The provisioning profile is baked into the build and only allows registered
devices.

#### Option A: Website registration

```bash
npx eas device:create
```

This generates a URL. Open it **in Safari** on each device you want to register. It installs
a temporary profile that sends the device UDID to EAS.

#### Option B: Manual registration (if the website hangs)

Find your device UDID:
- Go to https://udid.tech **in Safari** on the device
- It will prompt you to download a profile — allow it
- Go to **Settings → General → VPN & Device Management** and install the profile
- Copy the UDID shown on the website

Then register manually:

```bash
npx eas device:create --name "My iPhone" --udid YOUR_UDID_HERE
```

#### Verify registered devices

```bash
npx eas device:list
```

### Building and installing

#### Ship script (recommended)

The `ship` script type-checks, commits, pushes, and builds in one command:

```bash
npm run ship "feat(list): add new feature description"
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit message conventions.

#### Manual build

```bash
npx eas build --platform ios --profile preview
```

EAS builds in the cloud — no Mac needed. The first time, it will walk you through linking
your Apple Developer account and creating provisioning profiles.

#### Installing on your device

After the build completes:

1. Go to **https://expo.dev** → your project → **Builds**
2. Find the latest build and tap **Install** or scan the QR code
3. Open the link **in Safari** on your device (Chrome won't work)
4. When prompted, tap **Install**
5. The app will appear on your home screen
6. **First launch:** Go to **Settings → General → VPN & Device Management**, tap the
   developer profile, and tap **Trust**
7. **Developer Mode** must be enabled: **Settings → Privacy & Security → Developer Mode → On**
   (requires restart)

#### Troubleshooting installs

| Issue | Fix |
|-------|-----|
| "Unable to Install — integrity could not be verified" | Your device UDID is not in the provisioning profile. Register the device and rebuild. |
| Install page hangs | Make sure you're using **Safari**, not Chrome or another browser. |
| App crashes on launch | Enable **Developer Mode** in Settings → Privacy & Security. |
| New device not working after registration | The provisioning profile must be regenerated. Run `npx eas credentials --platform ios`, select Build credentials, re-select all devices, then rebuild. |

#### Regenerating provisioning profiles

If you add a new device after a build, the old build won't work on that device. You must
regenerate the provisioning profile:

```bash
# Interactive: select Build credentials, then re-select ALL devices
npx eas credentials --platform ios

# Then rebuild
npm run ship "chore: regenerate provisioning profile"
```

Make sure to **select all devices** (iPhone AND iPad) when prompted.

### Build for App Store (public release)

```bash
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

Then complete the listing in App Store Connect and submit for review.

### Updating the production redirect URI

For production builds (not Expo Go), the app uses the custom scheme redirect:
`com.ecookbook.shoppinglist://auth` — this is already registered in Azure from the initial setup.

## How Sync Works

1. **Sign in** — OAuth2 PKCE flow gets an access token for Microsoft Graph
2. **Fetch** — `GET /me/drive/root:/Documents/eCookbook/_data/shopping-list.json:/content`
3. **Cache** — Items are saved locally (expo-file-system) for offline access
4. **Display** — Items are grouped by auto-detected category, split into unchecked/checked
5. **Mutate** — Tapping a checkbox or adding an item updates local state immediately (optimistic)
6. **Sync** — After 2 seconds of inactivity, changes are uploaded via `PUT` with eTag
7. **Conflict** — If eTag doesn't match (file was modified remotely), the app re-fetches,
   merges (local checked state wins, new items from both sides kept), and retries
8. **Poll** — Every 30 seconds and on app foreground, the app checks for remote changes

## Data Format

The app reads and writes eCookbook's exact schema — a bare JSON array:

```json
[
  {
    "id": "1710000000000-abc123",
    "item": "chicken breast",
    "unit": "lb",
    "quantity": 2,
    "style": "boneless",
    "checked": false,
    "sources": ["Chicken Parmesan"]
  },
  {
    "id": "1710000000001-def456",
    "item": "milk",
    "unit": "cup",
    "quantity": 1,
    "style": "",
    "checked": false,
    "sources": ["Manual"]
  }
]
```

- Items from eCookbook recipes have recipe names in `sources`
- Items added manually on the phone use `sources: ["Manual"]`
- Everything lives in one `shopping-list.json` for full desktop compatibility
- There is no `category` field — category grouping is done client-side only
