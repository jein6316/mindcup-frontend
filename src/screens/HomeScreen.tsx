import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { MindWorld } from '../components/MindWorld';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { WorldUnlockModal } from './WorldUnlockModal';

export const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [worldDisplay, setWorldDisplay] = useState<any>(null);
  const [hasSurveyed, setHasSurveyed] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);

  // 모달 제어용 상태
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [modalLevel, setModalLevel] = useState('');

  const fetchWorldDisplay = async () => {
    try {
      const response = await api.get('/api/v1/worlds/me/display');
      const data = (response as any).data;
      setWorldDisplay(data);

      // 오늘 마음 진단 여부 판정
      if (data.pollutionScore !== 50) {
        setHasSurveyed(true);
      }

      // 로컬스토리지를 이용해 신규 세계 해금 여부 판정 및 모달 팝업 기동
      if (data.unlockedWorldLevel) {
        const key = 'mindcup_last_unlocked_world';
        const lastUnlocked = Platform.OS === 'web' ? localStorage.getItem(key) : null;

        if (lastUnlocked && lastUnlocked !== data.unlockedWorldLevel) {
          // 최고 레벨이 변경(성장)되었음을 감지
          setModalLevel(data.unlockedWorldLevel);
          setShowUnlockModal(true);
        }
        // 최신 최고 상태 저장
        if (Platform.OS === 'web') {
          localStorage.setItem(key, data.unlockedWorldLevel);
        }
      }
    } catch (error: any) {
      console.warn('Failed to fetch world display data', error);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await api.get('/api/v1/daily-missions/today');
      setMissions(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch missions', e);
    }
  };

  const completeMission = async (missionId: number) => {
    try {
      setLoading(true);
      await api.post(`/api/v1/daily-missions/${missionId}/complete`);
      await fetchWorldDisplay();
      await fetchMissions();
    } catch (e) {
      console.warn('Failed to complete mission', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchWorldDisplay(), fetchMissions()]);
        setLoading(false);
      };
      loadAll();
    }, [])
  );

  if (loading && !worldDisplay) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </ScreenContainer>
    );
  }

  const pollution = worldDisplay ? worldDisplay.pollutionScore : 50;
  const clarity = worldDisplay ? worldDisplay.clarityScore : 50;
  
  // 탁도별 동적 설명문 출력
  const statusMsgKey = worldDisplay?.messageKey || 'creature.slow';
  const fishDesc = t(`creature.${statusMsgKey.split('.')[1]}`, '생물들이 조용히 노닐고 있습니다.');

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* 상단 타이틀 */}
        <View style={styles.header}>
          <Typography variant="h1">{t('home.title')}</Typography>
          <Typography variant="caption" color="#7B8E9F" style={styles.dateText}>
            {new Date().toLocaleDateString()}
          </Typography>
        </View>

        {/* 첫 진단 설문 배너 */}
        {!hasSurveyed && (
          <Card style={styles.bannerCard}>
            <View style={styles.bannerRow}>
              <Typography variant="h2" color="#FFFFFF" style={{ flex: 1 }}>
                {t('survey.title')}
              </Typography>
              <TouchableOpacity 
                style={styles.bannerBtn} 
                onPress={() => {
                  navigation.navigate('CheckSurvey', {
                    onComplete: () => setHasSurveyed(true)
                  });
                }}
              >
                <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
                  GO
                </Typography>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 2단계 확장형 마인드월드 렌더러 */}
        <MindWorld
          worldLevel={worldDisplay?.displayWorldLevel || 'SMALL_CUP'}
          pollutionScore={pollution}
          clarityScore={clarity}
          creatureState={worldDisplay?.creatureState || 'SLOW'}
          creatures={worldDisplay?.creatures || []}
          equippedItems={worldDisplay?.equippedItems || []}
        />

        {/* 3대 바로가기 메뉴 단추 바 (꾸미기, 도감, 상세정보) */}
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuItemBtn}
            onPress={() => navigation.navigate('WorldDecorate')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              🎨 {t('world.decorateBtn')}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItemBtn}
            onPress={() => navigation.navigate('CreatureDex')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              📖 {t('world.dexBtn')}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItemBtn}
            onPress={() => navigation.navigate('WorldDetail')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              🌊 {t('world.detailBtn')}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* 업적 & 리포트 바로가기 버튼 */}
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuItemBtn}
            onPress={() => navigation.navigate('Achievement')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              🏆 {t('achievement.title')}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItemBtn}
            onPress={() => navigation.navigate('WeeklyReport')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              📊 {t('report.weeklyTitle')}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* 오늘의 작은 맑은물 미션 카드 */}
        {missions.length > 0 && (
          <Card style={styles.missionCard}>
            <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700', marginBottom: 12 }}>
              🌱 {t('mission.todayTitle')}
            </Typography>
            {missions.map((m) => (
              <View key={m.missionId} style={styles.missionRow}>
                <View style={{ flex: 1 }}>
                  <Typography 
                    variant="body" 
                    color={m.completedYn ? '#B0BEC5' : '#3A4D62'} 
                    style={{ textDecorationLine: m.completedYn ? 'line-through' : 'none', fontWeight: '600' }}
                  >
                    {t(`mission.${m.missionCode.split('_')[1]}.title`, m.title) as string}
                  </Typography>
                  <Typography variant="caption" color="#7B8E9F" style={{ marginTop: 2 }}>
                    {t(`mission.${m.missionCode.split('_')[1]}.desc`, m.description) as string}
                  </Typography>
                </View>
                {m.completedYn ? (
                  <View style={styles.completedBadge}>
                    <Typography variant="caption" color="#4CAF50" style={{ fontWeight: '700' }}>
                      완료
                    </Typography>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.completeBtn} onPress={() => completeMission(m.missionId)}>
                    <Typography variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                      완료
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* 맑음 상태 메세지 카드 */}
        <Card style={styles.descCard}>
          <Typography variant="body" color="#5A6E7F" align="center" style={styles.descText}>
            "{fishDesc}"
          </Typography>
        </Card>

        {/* 기록 입력 바로가기 */}
        <CustomButton
          title={t('home.addRecordBtn')}
          onPress={() => navigation.navigate('Record')}
          style={styles.recordBtn}
        />
        
      </ScrollView>

      {/* 세계 성장 알림 모달 */}
      <WorldUnlockModal
        visible={showUnlockModal}
        worldLevel={modalLevel}
        onClose={() => setShowUnlockModal(false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  dateText: {
    fontWeight: '600',
  },
  bannerCard: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
    paddingVertical: 18,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  menuItemBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  missionCard: {
    padding: 16,
    marginVertical: 10,
    borderRadius: 20,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completeBtn: {
    backgroundColor: '#78A2CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  descCard: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
    marginVertical: 10,
  },
  descText: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
  recordBtn: {
    marginTop: 10,
  },
});
