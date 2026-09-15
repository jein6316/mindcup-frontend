import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { NavigationHeader } from '../components/NavigationHeader';
import { safeAlert } from '../utils/safeAlert';

export const FriendMindStatusScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const friendUserId = route.params?.friendUserId;

  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [sendLoading, setSendLoading] = useState(false);

  const fetchStatusAndTemplates = async () => {
    try {
      const statusRes = await api.get(`/api/friends/${friendUserId}/mind-status`);
      setFriendStatus((statusRes as any).data);

      const templatesRes = await api.get('/api/comfort/templates');
      setTemplates((templatesRes as any).data);
    } catch (e: any) {
      safeAlert('Error', e.message || '상태 조회 실패', () => {
        navigation.goBack();
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndTemplates();
  }, [friendUserId]);

  const handleSendComfort = async () => {
    if (selectedTemplateId === null) {
      safeAlert('Info', '보낼 위로 문구를 선택해 주세요.');
      return;
    }

    setSendLoading(true);
    try {
      await api.post('/api/comfort/messages', {
        receiverUserId: friendUserId,
        templateId: selectedTemplateId,
      });

      // 2차 필수 가이드라인 텍스트 연동
      safeAlert(
        'Success', 
        '친구에게 한 방울을 보냈어요. 당신의 마음컵도 조금 맑아졌어요.', 
        () => { navigation.goBack(); }
      );
    } catch (error: any) {
      safeAlert('Error', error.message || '위로 발송 실패');
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </ScreenContainer>
    );
  }

  const isPublic = friendStatus && friendStatus.cupLevel !== null;
  const cupStatusLabel = isPublic ? friendStatus.cupLevel : '비공개 상태';
  const hasRecorded = friendStatus && friendStatus.todayRecorded;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <NavigationHeader title={`${friendStatus?.nickname || '친구'}님의 마음`} navigation={navigation} />

        {/* 마음 시각상태 카드 */}
        <Card style={styles.statusCard}>
          <View style={styles.cupContainer}>
            <View style={[styles.miniCup, !isPublic && styles.miniCupPrivate]}>
              <Typography variant="h2" color={isPublic ? '#78A2CC' : '#A0B2C6'} style={{ fontWeight: '800' }}>
                {cupStatusLabel}
              </Typography>
            </View>
          </View>

          <Typography variant="body" color="#7B8E9F" align="center" style={styles.recordStatusText}>
            오늘 기록 여부: {hasRecorded === null ? '비공개' : (hasRecorded ? '기록 완료' : '아직 기록 없음')}
          </Typography>
        </Card>

        {/* 위로 템플릿 목록 */}
        <Typography variant="h2" style={styles.sectionTitle}>
          맑은 한 방울과 함께 보낼 마음 카드
        </Typography>

        <View style={styles.templatesContainer}>
          {templates.map((temp) => {
            const isSelected = selectedTemplateId === temp.templateId;
            return (
              <TouchableOpacity
                key={temp.templateId}
                style={[styles.templateCard, isSelected && styles.selectedTemplate]}
                onPress={() => setSelectedTemplateId(temp.templateId)}
                activeOpacity={0.8}
              >
                <Typography variant="body" color={isSelected ? '#FFFFFF' : '#3A4D62'} style={styles.tempText}>
                  "{temp.content}"
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        <CustomButton
          title="한 방울 보내기"
          onPress={handleSendComfort}
          loading={sendLoading}
          disabled={selectedTemplateId === null}
          style={styles.submitBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 40,
  },
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
  statusCard: {
    padding: 24,
    alignItems: 'center',
    marginVertical: 15,
  },
  cupContainer: {
    marginBottom: 16,
  },
  miniCup: {
    width: 140,
    height: 110,
    borderWidth: 4,
    borderColor: '#D4E2F0',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 180, 240, 0.1)',
  },
  miniCupPrivate: {
    borderColor: '#E6ECF2',
    backgroundColor: '#F8FAFC',
  },
  recordStatusText: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  templatesContainer: {
    marginVertical: 5,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    borderRadius: 14,
    padding: 16,
    marginVertical: 5,
  },
  selectedTemplate: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
  },
  tempText: {
    fontStyle: 'italic',
    fontWeight: '600',
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: 25,
  },
});
