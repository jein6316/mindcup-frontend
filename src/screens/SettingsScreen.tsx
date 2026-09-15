import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [langLoading, setLangLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [visibility, setVisibility] = useState<string>('RECORD_STATUS_ONLY');
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  // 친구 공개 범위 로드 (1회성 로드)
  const fetchMySettings = async () => {
    try {
      const response = await api.get('/api/v1/friends/visibility');
      if (response && (response as any).data) {
        setVisibility((response as any).data);
      }
    } catch (e) {
      console.warn('Failed to load friend visibility settings', e);
    }
  };

  useEffect(() => {
    fetchMySettings();
  }, []);

  const handleLanguageToggle = async () => {
    if (!user) return;
    const currentLang = user.languageSetting;
    const targetLang = currentLang === 'KO' ? 'EN' : 'KO';

    setLangLoading(true);
    try {
      const response = await api.put('/api/v1/users/me/language', {
        languageSetting: targetLang,
      });

      const updatedUser = (response as any).data;
      updateUser(updatedUser);
      await setLanguage(targetLang.toLowerCase() as 'ko' | 'en');
      Alert.alert('Success', '언어 설정이 변경되었습니다. / Language updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message || '언어 설정 변경 실패');
    } finally {
      setLangLoading(false);
    }
  };

  const handleVisibilityChange = async (level: string) => {
    setVisibilityLoading(true);
    try {
      await api.post('/api/v1/friends/visibility', {
        visibilityLevel: level,
      });
      setVisibility(level);
      Alert.alert('Success', '공개 범위 설정이 업데이트되었습니다.');
    } catch (error: any) {
      Alert.alert('Error', error.message || '설정 변경 실패');
    } finally {
      setVisibilityLoading(false);
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      setLogoutLoading(true);
      try {
        await api.post('/api/v1/auth/logout');
      } catch (e) {
        console.warn('Failed to call backend logout api', e);
      } finally {
        await logout();
        setLogoutLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('로그아웃 하시겠습니까?')) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', '로그아웃 하시겠습니까?', [
        { text: 'Cancel' },
        {
          text: 'OK',
          onPress: performLogout,
        },
      ]);
    }
  };

  const visibilityOptions = [
    { key: 'PRIVATE', label: '비공개', desc: '아무 상태도 친구에게 노출하지 않습니다.' },
    { key: 'RECORD_STATUS_ONLY', label: '오늘 기록 여부만', desc: '오늘 물을 돌봤는지 여부만 노출합니다.' },
    { key: 'CUP_LEVEL_ONLY', label: '마음컵 단계까지', desc: '오늘의 마음컵 탁도 등급을 노출합니다.' },
  ];

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Typography variant="h1" style={styles.title}>{t('settings.title')}</Typography>

        {/* 사용자 프로필 카드 */}
        {user && (
          <Card style={styles.profileCard}>
            <Typography variant="h2" style={styles.nickname}>
              {user.nickname}
            </Typography>
            <Typography variant="body" color="#7B8E9F" style={styles.email}>
              {user.email}
            </Typography>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Typography variant="caption" color="#7B8E9F">친구 코드</Typography>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {user.friendCode}
              </Typography>
            </View>
          </Card>
        )}

        {/* 1. 언어 설정 */}
        <Typography variant="h2" style={styles.sectionTitle}>일반 설정</Typography>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLanguageToggle}
            disabled={langLoading}
          >
            <View>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {t('settings.language')}
              </Typography>
              <Typography variant="hint" color="#7B8E9F">
                KO / EN
              </Typography>
            </View>
            <Typography variant="body" color="#78A2CC" style={{ fontWeight: '600' }}>
              {user?.languageSetting === 'KO' ? '한국어' : 'English'}
            </Typography>
          </TouchableOpacity>
        </Card>

        {/* 2. 친구 공개 범위 설정 (2차 스펙 보강) */}
        <Typography variant="h2" style={styles.sectionTitle}>친구 공개 범위 설정</Typography>
        <Card style={styles.menuCard}>
          {visibilityLoading ? (
            <ActivityIndicator size="small" color="#78A2CC" style={{ padding: 20 }} />
          ) : (
            visibilityOptions.map((opt) => {
              const isSelected = visibility === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.visibilityRow, isSelected && styles.selectedRow]}
                  onPress={() => handleVisibilityChange(opt.key)}
                >
                  <View>
                    <Typography variant="body" style={{ fontWeight: '600' }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="hint" color="#7B8E9F" style={{ marginTop: 2 }}>
                      {opt.desc}
                    </Typography>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioSelected]} />
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* 로그아웃 */}
        <CustomButton
          title={t('settings.logout')}
          onPress={handleLogout}
          loading={logoutLoading}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  title: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 10,
  },
  profileCard: {
    padding: 20,
    marginVertical: 10,
  },
  nickname: {
    fontWeight: '700',
    fontSize: 20,
  },
  email: {
    marginTop: 4,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F0F4F8',
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    backgroundColor: '#FFFFFF',
  },
  selectedRow: {
    backgroundColor: '#F4F7FA',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#A0B2C6',
  },
  radioSelected: {
    borderColor: '#78A2CC',
    backgroundColor: '#78A2CC',
  },
  logoutBtn: {
    marginTop: 40,
  },
});
