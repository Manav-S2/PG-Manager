// Central navigation types. The global augmentation makes `useNavigation()`
// strongly typed everywhere without per-call generics.
export type RootStackParamList = {
  RoleSelect: undefined;
  Owner: undefined;
  Manager: undefined;
  Student: undefined;
  // Student screens
  rooms: undefined;
  'my-stay': undefined;
  payments: undefined;
  complaints: undefined;
  notices: undefined;
  invoices: undefined;
  support: undefined;
  // Manager screens
  'rent-collection': undefined;
  'room-management': undefined;
  expenses: undefined;
  'send-reminder': undefined;
  'notices-mgr': undefined;
  // Owner screens
  'pg-management': undefined;
  'profit-loss': undefined;
  'staff-management': undefined;
  // Shared
  AddModal: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
