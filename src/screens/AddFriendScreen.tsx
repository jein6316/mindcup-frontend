import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { NavigationHeader } from '../components/NavigationHeader';
import { safeAlert } from '../utils/safeAlert';

export const AddFriendScreen = ({ navigation }: any) => {
  const [myCode, setMyCode] = useState('');
  const [targetCode, setTargetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(true);

  const fetchMyCode = async () => {
    try {
      const response = await api.get('/api/users/me/friend-code');
      setMyCode((response as any).data.friendCode);
    } catch (e) {
      console.warn('Failed to load my friend code', e);
    } finally {
      setCodeLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCode();
  }, []);

  const handleSendRequest = async () => {
    if (!targetCode.trim()) {
      safeAlert('Info', '친구 코드를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/friends/requests/by-code', {
        targetFriendCode: targetCode.trim(),
      });
      safeAlert('Success', '친구 요청을 성공적으로 보냈습니다.', () => {
        navigation.goBack();
      });
    } catch (error: any) {
      safeAlert('Error', error.message || '친구 요청 전송 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <NavigationHeader title="친구 추가" navigation={navigation} />

      {/* 내 코드 확인 */}
      <Card style={styles.codeCard}>
        <Typography variant="caption" color="#7B8E9F" style={{ marginBottom: 4 }}>
          나의 친구 코드
        </Typography>
        {codeLoading ? (
          <ActivityIndicator size="small" color="#78A2CC" />
        ) : (
          <Typography variant="h1" color="#78A2CC" align="center" style={styles.myCodeText}>
            {myCode}
          </Typography>
        )}
        <Typography variant="hint" color="#A0B2C6" align="center" style={{ marginTop: 6 }}>
          이 코드를 복사해서 친구에게 공유해 보세요.
        </Typography>
      </Card>

      {/* 친구 코드 입력 검색 */}
      <View style={styles.searchSection}>
        <Typography variant="h2" style={styles.sectionTitle}>친구 코드로 찾기</Typography>
        <CustomInput
          placeholder="MIND-XXXX-XXXX 형식 코드 입력"
          value={targetCode}
          onChangeText={setTargetCode}
        />
        <CustomButton
          title="친구 신청 보내기"
          onPress={handleSendRequest}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 10,
  },
  backBtn: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  codeCard: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 15,
  },
  myCodeText: {
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: 1,
    marginTop: 8,
  },
  searchSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  submitBtn: {
    marginTop: 15,
  },
});
