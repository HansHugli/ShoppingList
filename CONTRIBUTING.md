# Contributing — Development Workflow

## Branch Strategy

- **`main`** — production-ready code, always deployable
- **`dev`** — integration branch for active development
- **Feature branches** — branch off `dev` for individual features/fixes

```
main
 └── dev
      ├── feat/add-item-categories
      ├── fix/sync-conflict-handling
      └── chore/update-dependencies
```

### Branch naming

```
feat/<short-description>     # New feature
fix/<short-description>      # Bug fix
chore/<short-description>    # Maintenance, deps, config
docs/<short-description>     # Documentation only
refactor/<short-description> # Code restructuring, no behavior change
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear history
and potential future automation (changelogs, versioning).

### Format

```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

### Types

| Type | When to use | Example |
|------|------------|---------|
| `feat` | New feature or capability | `feat(list): add swipe-to-delete on items` |
| `fix` | Bug fix | `fix(sync): handle 429 rate limit from Graph API` |
| `chore` | Maintenance, deps, config, CI | `chore(deps): update expo to SDK 54` |
| `docs` | Documentation changes only | `docs: add Azure setup instructions to README` |
| `refactor` | Code change that doesn't fix a bug or add a feature | `refactor(store): extract sync logic to service` |
| `style` | Formatting, whitespace, no code change | `style: fix indentation in login screen` |
| `test` | Adding or fixing tests | `test(categories): add unit tests for groupByCategory` |
| `build` | Build system or deployment changes | `build(eas): add production build profile` |

### Scopes (optional)

Use a short scope to indicate what area of the app is affected:

- `list` — shopping list screen/logic
- `auth` — authentication, OAuth, tokens
- `sync` — OneDrive sync, Graph API
- `store` — Zustand stores
- `ui` — components, styling
- `deps` — dependencies
- `config` — app.json, eas.json, tsconfig

### Examples

```
feat(list): add manual item entry with unit picker
fix(auth): use consumers tenant for personal MS accounts
chore(deps): install react-native-screens
docs: create FEATURES.md with usage guide
refactor(sync): move merge logic to OneDriveSync class
build(eas): configure preview build profile
```

## Development Workflow

### Starting new work

```bash
# Make sure dev is up to date
git checkout dev
git pull origin dev

# Create a feature branch
git checkout -b feat/my-new-feature
```

### Making changes

1. Make your code changes
2. Test in Expo Go on your phone (`npm start`)
3. Stage and commit with a conventional commit message:

```bash
git add <files>
git commit -m "feat(list): add category filter dropdown"
```

4. Push your branch:

```bash
git push -u origin feat/my-new-feature
```

### Merging to dev

```bash
# From your feature branch
git checkout dev
git pull origin dev
git merge feat/my-new-feature
git push origin dev
```

Or create a Pull Request on GitHub for review.

### Releasing to main

When `dev` is stable and tested:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

Then bump the version and build:

```bash
# Update version in app.json and package.json
npm version patch  # or minor/major

# Build for iOS
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

## Version Bumping

Follow [Semantic Versioning](https://semver.org/):

- **patch** (1.0.0 → 1.0.1): Bug fixes, small tweaks
- **minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **major** (1.0.0 → 2.0.0): Breaking changes

```bash
npm version patch -m "chore(release): %s"
npm version minor -m "chore(release): %s"
npm version major -m "chore(release): %s"
```

## Build & Deploy

### Development (Expo Go)

```bash
npm start
# Scan QR code with iPhone
```

### Preview build (TestFlight)

```bash
npx eas build --platform ios --profile preview
npx eas submit --platform ios
```

### Production build (App Store)

```bash
npx eas build --platform ios --profile production
npx eas submit --platform ios
```

## Code Quality Checklist

Before committing:

- [ ] TypeScript compiles cleanly (`npx tsc --noEmit`)
- [ ] App loads without errors in Expo Go
- [ ] New features work on iPhone
- [ ] Shopping list syncs correctly with OneDrive
- [ ] No hardcoded secrets or tokens in committed code
