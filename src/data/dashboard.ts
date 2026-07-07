import { Colors } from '@/constants/colors';

export type IconFamily = 'ionicons' | 'material-community' | 'font-awesome5';

export interface StatTileData {
  id: string;
  label: string;
  value: string;
  valueColor?: string;
  iconFamily: IconFamily;
  iconName: string;
  iconColor: string;
  iconBg: string;
  /** Either a footer link (e.g. "View all") or a colored note (e.g. "94.0%") */
  footerText: string;
  footerColor?: string;
  footerIsLink?: boolean;
}

export const overviewStats: StatTileData[] = [
  {
    id: 'total-pgs',
    label: 'Total PGs',
    value: '6',
    iconFamily: 'ionicons',
    iconName: 'business-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
    footerText: 'View all',
    footerIsLink: true,
  },
  {
    id: 'total-beds',
    label: 'Total Beds',
    value: '420',
    iconFamily: 'material-community',
    iconName: 'bed-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
    footerText: 'View all',
    footerIsLink: true,
  },
  {
    id: 'occupied',
    label: 'Occupied',
    value: '395',
    valueColor: Colors.green,
    iconFamily: 'ionicons',
    iconName: 'people-outline',
    iconColor: Colors.blue,
    iconBg: Colors.blueLight,
    footerText: '94.0%',
    footerColor: Colors.green,
  },
  {
    id: 'vacant-beds',
    label: 'Vacant Beds',
    value: '25',
    iconFamily: 'material-community',
    iconName: 'bed-empty',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
    footerText: '6.0%',
    footerColor: Colors.red,
  },
  {
    id: 'collection',
    label: 'This Month Collection',
    value: '\u20B912,45,000',
    iconFamily: 'font-awesome5',
    iconName: 'rupee-sign',
    iconColor: Colors.white,
    iconBg: Colors.green,
    footerText: 'View details',
    footerIsLink: true,
  },
  {
    id: 'pending-rent',
    label: 'Pending Rent',
    value: '\u20B91,15,000',
    iconFamily: 'font-awesome5',
    iconName: 'rupee-sign',
    iconColor: Colors.white,
    iconBg: Colors.red,
    footerText: 'View details',
    footerIsLink: true,
  },
];

export interface QuickActionData {
  id: string;
  label: string;
  iconFamily: IconFamily;
  iconName: string;
  iconColor: string;
  iconBg: string;
}

export const quickActions: QuickActionData[] = [
  {
    id: 'add-tenant',
    label: 'Add Tenant',
    iconFamily: 'ionicons',
    iconName: 'person-add',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
  },
  {
    id: 'room-management',
    label: 'Room Management',
    iconFamily: 'ionicons',
    iconName: 'home',
    iconColor: Colors.green,
    iconBg: Colors.greenLight,
  },
  {
    id: 'rent-collection',
    label: 'Rent Collection',
    iconFamily: 'font-awesome5',
    iconName: 'rupee-sign',
    iconColor: Colors.orange,
    iconBg: Colors.orangeLight,
  },
  {
    id: 'expenses',
    label: 'Expenses',
    iconFamily: 'ionicons',
    iconName: 'document-text',
    iconColor: Colors.red,
    iconBg: Colors.redLight,
  },
  {
    id: 'reports',
    label: 'Reports',
    iconFamily: 'ionicons',
    iconName: 'bar-chart',
    iconColor: Colors.blue,
    iconBg: Colors.blueLight,
  },
  {
    id: 'send-reminder',
    label: 'Send Reminder',
    iconFamily: 'ionicons',
    iconName: 'paper-plane',
    iconColor: Colors.violet,
    iconBg: Colors.violetLight,
  },
  {
    id: 'complaints',
    label: 'Complaints',
    iconFamily: 'ionicons',
    iconName: 'construct',
    iconColor: Colors.orange,
    iconBg: Colors.orangeLight,
  },
  {
    id: 'notices',
    label: 'Notices',
    iconFamily: 'ionicons',
    iconName: 'notifications',
    iconColor: Colors.blue,
    iconBg: Colors.blueLight,
  },
];

export interface InsightData {
  id: string;
  text: string;
  iconFamily: IconFamily;
  iconName: string;
  iconColor: string;
}

export const aiInsights: InsightData[] = [
  {
    id: 'occupancy',
    text: 'PG-2 occupancy 98%',
    iconFamily: 'ionicons',
    iconName: 'arrow-up-circle',
    iconColor: Colors.green,
  },
  {
    id: 'rent-due',
    text: '12 tenants rent due',
    iconFamily: 'ionicons',
    iconName: 'warning',
    iconColor: Colors.red,
  },
  {
    id: 'vacant-rooms',
    text: 'PG-4 me 3 rooms vacant',
    iconFamily: 'material-community',
    iconName: 'bed-outline',
    iconColor: Colors.blue,
  },
  {
    id: 'profit',
    text: 'Estimated monthly profit \u20B94.2 lakh',
    iconFamily: 'ionicons',
    iconName: 'trending-up',
    iconColor: Colors.green,
  },
];

export const aiSuggestions: string[] = [
  'Kaun kaun rent due hai?',
  'PG-3 ka collection batao',
  'Kaunsa room khali hai?',
  'Is mahine profit kitna hua?',
];
