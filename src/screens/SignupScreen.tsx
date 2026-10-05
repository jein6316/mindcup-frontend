import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Typography } from '../components/Typography';
import { ErrorMessage } from '../components/ErrorMessage';
import { safeAlert } from '../utils/safeAlert';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateNickname,
} from '../utils/validation';
import { parseErrorMessage } from '../utils/errorUtils';

export const SignupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 에러 상태
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // 1. 에러 상태 초기화
    setEmailError(null);
    setNicknameError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setServerError(null);

    // 2. 클라이언트 사전 유효성 검사 (Pre-validation)
    const errEmail = validateEmail(email);
    const errNickname = validateNickname(nickname);
    const errPassword = validatePassword(password);
    const errConfirmPassword = validateConfirmPassword(password, confirmPassword);

    if (errEmail || errNickname || errPassword || errConfirmPassword) {
      setEmailError(errEmail);
      setNicknameError(errNickname);
      setPasswordError(errPassword);
      setConfirmPasswordError(errConfirmPassword);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/auth/signup', {
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      });

      safeAlert('Success', t('auth.signupSuccess'), () => {
        navigation.navigate('Login');
      });
    } catch (error: any) {
      const parsedMsg = parseErrorMessage(error);
      setServerError(parsedMsg);
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
        <ErrorMessage message={serverError} />

        <CustomInput
          placeholder={t('auth.email')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(null);
            if (serverError) setServerError(null);
          }}
          error={emailError || undefined}
        />
        <CustomInput
          placeholder={t('auth.nickname')}
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            if (nicknameError) setNicknameError(null);
            if (serverError) setServerError(null);
          }}
          error={nicknameError || undefined}
        />
        <CustomInput
          placeholder={t('auth.password')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(null);
            if (serverError) setServerError(null);
          }}
          secureTextEntry
          error={passwordError || undefined}
        />
        <CustomInput
          placeholder={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError(null);
            if (serverError) setServerError(null);
          }}
          secureTextEntry
          error={confirmPasswordError || undefined}
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
