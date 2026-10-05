import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';

interface ErrorMessageProps {
  message?: string | null;
  style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, style }) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    width: '100%',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: '#9B1C1C',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
