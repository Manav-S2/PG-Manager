# Stack

This project runs on **Expo SDK 54** (React Native 0.81, React 19) with **React Navigation v7**
for routing — **not** expo-router. Before writing any code, read the versioned docs:

- Expo SDK 54: https://docs.expo.dev/versions/v54.0.0/
- React Navigation v7: https://reactnavigation.org/docs/getting-started

Routing lives in `App.tsx` (native-stack: RoleSelect → Owner/Manager/Student tab groups → AddModal
modal) and `src/app/**/(tabs)/_layout.tsx` (bottom-tab navigators). The `src/app` folder names are
plain directories, **not** file-based routes.

**Keep every dependency on ONE consistent SDK version.** Mixing SDKs (e.g. `babel-preset-expo@56`
on a SDK 54 / RN 0.81 project) causes a runtime Hermes crash: `SyntaxError: private properties are
not supported`. To change SDK, bump `expo` then run `npx expo install --fix` — never hand-edit
individual package versions. The device's Expo Go must run this same SDK (54); the latest store Expo
Go runs the latest SDK only. After dependency changes, start with `npx expo start -c`.
