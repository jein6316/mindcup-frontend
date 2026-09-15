import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Typography } from './Typography';

interface NavigationHeaderProps {
  title: string;
  navigation: any;
  showHome?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  navigation,
  showHome = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. 뒤로가기 버튼 */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Typography variant="body" color="#78A2CC" style={styles.arrowText}>
          ←
        </Typography>
        <Typography variant="body" color="#78A2CC" style={styles.backText}>
          이전
        </Typography>
      </TouchableOpacity>

      {/* 2. 중앙 타이틀 */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* 3. 우측 홈으로 바로가기 버튼 */}
      {showHome ? (
        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
          activeOpacity={0.7}
        >
          <Typography variant="body" style={styles.homeIcon}>
            🏠
          </Typography>
        </TouchableOpacity>
      ) : (
        <View style={styles.homePlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F4F8',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#1A3038',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 12,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 4,
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A3C4E',
  },
  homeButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F4F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: {
    fontSize: 16,
  },
  homePlaceholder: {
    width: 32,
  },
});
