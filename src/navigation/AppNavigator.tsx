import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../store/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CheckSurveyScreen } from '../screens/CheckSurveyScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { FriendRequestsScreen } from '../screens/FriendRequestsScreen';
import { AddFriendScreen } from '../screens/AddFriendScreen';
import { FriendMindStatusScreen } from '../screens/FriendMindStatusScreen';
import { ReceivedComfortScreen } from '../screens/ReceivedComfortScreen';
import { WorldDetailScreen } from '../screens/WorldDetailScreen';
import { CreatureDexScreen } from '../screens/CreatureDexScreen';
import { WorldDecorateScreen } from '../screens/WorldDecorateScreen';
import { AchievementScreen } from '../screens/AchievementScreen';
import { WeeklyReportScreen } from '../screens/WeeklyReportScreen';
import { Typography } from '../components/Typography';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 1. 인증이 안 된 경우 (Auth Navigator)
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

// 2. 메인 서비스 (Bottom Tab)
const MainTabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#78A2CC',
        tabBarInactiveTintColor: '#7B8E9F',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E6ECF2',
        },
        tabBarLabel: ({ color }) => {
          let label = '';
          if (route.name === 'HomeTab') label = t('home.title');
          else if (route.name === 'FriendsTab') label = "친구";
          else if (route.name === 'StatsTab') label = t('stats.title');
          else if (route.name === 'SettingsTab') label = t('settings.title');

          return (
            <Typography variant="hint" color={color} style={{ fontWeight: '700' }}>
              {label}
            </Typography>
          );
        },
        tabBarIcon: () => null, // 벡터 아이콘 설치 충돌 방지를 위해 라벨만 노출
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="FriendsTab" component={FriendsScreen} />
      <Tab.Screen name="StatsTab" component={StatsScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// 3. 전체 통합 라우팅
export const AppNavigator = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: Platform.OS === 'web' ? { overflow: 'visible', flex: 1 } : undefined
        }}
      >
        {accessToken ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="CheckSurvey" component={CheckSurveyScreen} />
            <Stack.Screen name="Record" component={RecordScreen} />
            <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
            <Stack.Screen name="AddFriend" component={AddFriendScreen} />
            <Stack.Screen name="FriendMindStatus" component={FriendMindStatusScreen} />
            <Stack.Screen name="ReceivedComfort" component={ReceivedComfortScreen} />
            <Stack.Screen name="WorldDetail" component={WorldDetailScreen} />
            <Stack.Screen name="CreatureDex" component={CreatureDexScreen} />
            <Stack.Screen name="WorldDecorate" component={WorldDecorateScreen} />
            <Stack.Screen name="Achievement" component={AchievementScreen} />
            <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FA',
  },
});
