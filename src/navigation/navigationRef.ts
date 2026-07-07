import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/**
 * Imperative navigation handle — lets code outside a screen (e.g. the dev role
 * switcher, or later a push-notification handler) navigate without a `navigation`
 * prop. Attach via `<NavigationContainer ref={navigationRef}>`.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
