import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Typography } from '../components/Typography';

export const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Info', t('auth.email') + ', ' + t('auth.password') + '를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { accessToken, refreshToken } = (response as any).data;
      
      // 내 프로필 조회 API 동시 요청
      const profileResponse = await api.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const user = (profileResponse as any).data;

      await setAuth(accessToken, refreshToken, user);
    } catch (error: any) {
      Alert.alert('Error', error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // 로컬 테스트용 Mock Google ID Token 생성 및 백엔드 전송
      const mockToken = `mock_google_id_token_${Date.now()}`;
      const response = await api.post('/api/v1/auth/google', { idToken: mockToken });
      const { accessToken, refreshToken } = (response as any).data;

      const profileResponse = await api.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const user = (profileResponse as any).data;

      await setAuth(accessToken, refreshToken, user);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google 로그인 실패');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" color="#78A2CC" style={styles.title}>마음컵 (Mind Cup)</Typography>
        <Typography variant="body" color="#7B8E9F" align="center">
          흐려진 마음을 알아차리고, 맑은물을 부어보는 회복의 시작
        </Typography>
      </View>

      <View style={styles.form}>
        <CustomInput
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
        />
        <CustomInput
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomButton
          title={t('auth.login')}
          onPress={handleLogin}
          loading={loading}
          style={styles.submitBtn}
        />

        <CustomButton
          title={t('auth.googleLogin')}
          onPress={handleMockGoogleLogin}
          loading={googleLoading}
          variant="secondary"
          style={styles.googleBtn}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="body" color="#7B8E9F">{t('auth.noAccount')} </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Typography variant="body" color="#78A2CC" style={styles.signupLink}>{t('auth.signup')}</Typography>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 20,
  },
  googleBtn: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupLink: {
    fontWeight: '600',
  },
});
