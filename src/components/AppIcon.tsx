import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import type { IconFamily } from '@/data/dashboard';

interface AppIconProps {
  family: IconFamily;
  name: string;
  size: number;
  color: string;
}

/** Renders an icon from whichever @expo/vector-icons family is requested. */
export function AppIcon({ family, name, size, color }: AppIconProps) {
  if (family === 'material-community') {
    return <MaterialCommunityIcons name={name as never} size={size} color={color} />;
  }
  if (family === 'font-awesome5') {
    return <FontAwesome5 name={name as never} size={size * 0.78} color={color} />;
  }
  return <Ionicons name={name as never} size={size} color={color} />;
}
