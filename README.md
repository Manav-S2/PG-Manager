# AI PG Manager

A dashboard app for managing PG (paying guest) accommodations, built with Expo (SDK 51) + React Navigation.

## What's built

- **Home / Dashboard** (`src/app/(tabs)/index.tsx`) — full implementation of the provided design: purple header, Overview stat grid, AI Assistant card with a working input + tappable suggestion chips, Quick Actions grid, and an AI Insights list.
- **Bottom nav bar** with a custom tab bar (`src/components/navigation/CustomTabBar.tsx`) — Home / Tenants / Chat / Profile, plus a floating "+" button that opens a Quick Add modal.
- **Tenants, Chat, Profile** — clean placeholder screens (same header style) ready for you to build out.
- **Quick Add modal** (`src/app/add-modal.tsx`) — opens when the "+" button is tapped.

All dashboard numbers and text live in `src/data/dashboard.ts` and the color palette in `src/constants/colors.ts` — edit those first if you want to reskin or reconnect to real data.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (iOS/Android), or press `i` / `a` for a simulator, or `w` for web.

## Project structure

```
App.tsx                    # root native-stack: RoleSelect + role tab groups + quick-add modal
src/
  navigation/
    types.ts               # RootStackParamList + global navigation typing
  app/
    index.tsx             # role selection screen (entry)
    add-modal.tsx         # the "+" button's quick add sheet
    owner/(tabs)/         # owner bottom-tab group (_layout.tsx = Tab.Navigator)
    manager/(tabs)/       # manager bottom-tab group
    student/(tabs)/       # student bottom-tab group
      _layout.tsx         # Tab.Navigator wired to the custom tab bar
      index.tsx           # Home / Dashboard screen
      ...
  components/
    dashboard/            # Header, Overview grid, AI Assistant, Quick Actions, Insights
    navigation/
      CustomTabBar.tsx     # 4 tabs + floating add button
    AppIcon.tsx            # picks the right icon set (Ionicons / MaterialCommunityIcons / FontAwesome5)
    PlaceholderScreen.tsx
  constants/
    colors.ts              # brand palette
  data/
    dashboard.ts            # mock stats / quick actions / insights / AI suggestions
```

## Next steps

- Wire `src/data/dashboard.ts` up to a real API instead of the mock numbers.
- Replace the hamburger menu / notification bell handlers in `DashboardHeader` with real navigation.
- Build out the Tenants, Chat, and Profile screens — the placeholders are styled and ready to be replaced.
- Hook the AI Assistant's input and quick-reply chips up to an actual model/endpoint.
