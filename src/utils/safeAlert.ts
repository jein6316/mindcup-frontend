import { Platform, Alert } from 'react-native';

export const safeAlert = (
  title: string,
  message: string,
  onPress?: () => void
) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
    if (onPress) {
      onPress();
    }
  } else {
    Alert.alert(
      title,
      message,
      onPress ? [{ text: 'OK', onPress }] : undefined
    );
  }
};

export const safeConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (Platform.OS === 'web') {
    const result = confirm(`${title}\n\n${message}`);
    if (result) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm }
    ]);
  }
};
