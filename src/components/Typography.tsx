import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'body' | 'caption' | 'hint';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = '#3A4D62', // 가독성 높으면서 부드러운 네이비 그레이
  align = 'left',
  style,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'caption':
        return styles.caption;
      case 'hint':
        return styles.hint;
      default:
        return styles.body;
    }
  };

  return (
    <Text style={[getStyles(), { color, textAlign: align }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 16,
  },
});
