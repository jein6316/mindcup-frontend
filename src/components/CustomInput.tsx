import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string;
  style?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0B2C6"
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setHidePassword(!hidePassword)}
          >
            <Text style={styles.toggleText}>{hidePassword ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  inputContainer: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusedBorder: {
    borderColor: '#78A2CC', // 포커스 시 파스텔 블루 테두리
  },
  errorBorder: {
    borderColor: '#E29797', // 에러 시 소프트 레드 테두리
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#3A4D62',
  },
  toggleBtn: {
    padding: 8,
  },
  toggleText: {
    color: '#78A2CC',
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: '#E29797',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
