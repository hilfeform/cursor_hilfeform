import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

interface IconProps {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = '#fff' }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}