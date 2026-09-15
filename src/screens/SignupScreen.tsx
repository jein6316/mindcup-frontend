import React, { useState } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Typography } from '../components/Typography';

export const SignupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !nickname) {
      Alert.alert('Info', '모든 필드를 입력해 주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Info', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/auth/signup', {
        email,
        password,
        nickname,
      });

      Alert.alert('Success', t('auth.signupSuccess'), [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" color="#78A2CC" style={styles.title}>{t('auth.signup')}</Typography>
        <Typography variant="body" color="#7B8E9F" align="center">
          나만의 컵에 맑은물을 채우기 위한 가입을 시작합니다.
        </Typography>
      </View>

      <View style={styles.form}>
        <CustomInput
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
        />
        <CustomInput
          placeholder={t('auth.nickname')}
          value={nickname}
          onChangeText={setNickname}
        />
        <CustomInput
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <CustomInput
          placeholder={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <CustomButton
          title={t('auth.signup')}
          onPress={handleSignup}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="body" color="#7B8E9F">{t('auth.hasAccount')} </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Typography variant="body" color="#78A2CC" style={styles.loginLink}>{t('auth.login')}</Typography>
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
    marginBottom: 30,
  },
  title: {
    fontWeight: '800',
    fontSize: 26,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginLink: {
    fontWeight: '600',
  },
});
