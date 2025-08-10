import React, { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface NeonBoxProps {
  style?: ViewStyle | ViewStyle[];
}

export function NeonBox({ children, style }: PropsWithChildren<NeonBoxProps>) {
  return (
    <View
      style={[
        {
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.neon,
          backgroundColor: 'rgba(0,0,0,0.2)',
          shadowColor: colors.neon,
          shadowOpacity: 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
        },
        // @ts-ignore
        style,
      ]}
    >
      {children}
    </View>
  );
}