import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, ViewStyle, Platform } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FA" />
      <View style={styles.outerWrapper}>
        <View style={[styles.container, style]}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6ECF2', // 브라우저 전체 바깥 영역 배경색
  },
  outerWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    // 조언에 따라 자식 ScrollView의 높이 인식을 방해할 수 있는 justifyContent: 'center' 제거
  },
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...Platform.select({
      web: {
        maxWidth: 480,
        backgroundColor: '#F4F7FA', // 앱 내부 전용 배경색
        shadowColor: '#1A3038',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 30,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#D8E2EC',
        // 조언에 따라 스크롤 한계 감지를 방해하는 overflow: 'hidden' 제거
      },
      default: {
        backgroundColor: '#F4F7FA',
      }
    }),
  },
});
