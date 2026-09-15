import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { NavigationHeader } from '../components/NavigationHeader';
import { CustomButton } from '../components/CustomButton';
import { safeAlert } from '../utils/safeAlert';

export const WorldDetailScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [worldData, setWorldData] = useState<any>(null);

  const fetchWorldDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/worlds/me');
      setWorldData((res as any).data);
    } catch (e: any) {
      console.warn('Failed to load world detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await api.post('/api/v1/worlds/me/recalculate');
      safeAlert('Info', '세계 성장을 다시 계산하여 최신화했습니다.');
      fetchWorldDetail();
    } catch (e: any) {
      safeAlert('Error', '다시 계산 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorldDetail();
  }, []);

  if (loading && !worldData) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#78A2CC" />
        </View>
      </ScreenContainer>
    );
  }

  const {
    unlockedWorldLevel = 'SMALL_CUP',
    displayWorldLevel = 'SMALL_CUP',
    averageClarityScore = 0.0,
    nextWorldLevel,
    nextRequiredClarityScore,
  } = worldData || {};

  const currentLevelLabel = t(`world.${displayWorldLevel.toLowerCase()}`);
  const nextLevelLabel = nextWorldLevel ? t(`world.${nextWorldLevel.toLowerCase()}`) : null;

  // 다음 해금까지의 퍼센트 바 계산
  const progressRatio = nextRequiredClarityScore
    ? Math.min(1, averageClarityScore / nextRequiredClarityScore)
    : 1;

  // 8대 월드 전체 정보 및 임계점
  const WORLD_GUIDES = [
    { code: 'SMALL_CUP', score: 0 },
    { code: 'LARGE_CUP', score: 30 },
    { code: 'AQUARIUM', score: 45 },
    { code: 'POND', score: 60 },
    { code: 'STREAM', score: 70 },
    { code: 'RIVER', score: 80 },
    { code: 'LAKE', score: 88 },
    { code: 'SEA', score: 92 },
  ];

  // 내 최고 unlocked 레벨의 순서
  const unlockedIndex = WORLD_GUIDES.findIndex(w => w.code === unlockedWorldLevel);

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NavigationHeader title={t('world.detailBtn')} navigation={navigation} />

        {/* 1. 현재 세계 레벨 */}
        <Card style={styles.statusCard}>
          <Typography variant="caption" color="#7B8E9F" style={{ marginBottom: 4 }}>
            {t('world.currentLevel')}
          </Typography>
          <Typography variant="h1" color="#3A4D62" style={{ fontSize: 24, fontWeight: '800' }}>
            {currentLevelLabel}
          </Typography>
          <Typography variant="body" color="#5A6E7F" style={{ marginTop: 8 }}>
            최고 해금 세계: {t(`world.${unlockedWorldLevel.toLowerCase()}`)}
          </Typography>
        </Card>

        {/* 2. 7일 평균 점수 정보 */}
        <Card style={styles.statsCard}>
          <Typography variant="h2" style={{ marginBottom: 12 }}>
            {t('world.avgClarity')}
          </Typography>
          <Typography variant="h1" color="#78A2CC" style={{ fontSize: 36, fontWeight: '800' }}>
            {averageClarityScore.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="#A0B2C6" style={{ marginTop: 6 }}>
            * 최근 7일 중 기록이 존재하는 날의 맑음도만 추출하여 평균을 냅니다.
          </Typography>
        </Card>

        {/* 3. 다음 세계 해금 진척 안내 */}
        {nextWorldLevel ? (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Typography variant="body" style={{ fontWeight: '700' }}>
                {nextLevelLabel} 해금
              </Typography>
              <Typography variant="caption" color="#78A2CC">
                {averageClarityScore.toFixed(0)} / {nextRequiredClarityScore}%
              </Typography>
            </View>

            {/* 게이지 바 */}
            <View style={styles.gaugeOuter}>
              <View style={[styles.gaugeInner, { width: `${progressRatio * 100}%` }]} />
            </View>

            <Typography variant="caption" color="#7B8E9F" style={{ marginTop: 10 }}>
              {t('world.nextGuide')}
            </Typography>
          </Card>
        ) : (
          <Card style={styles.progressCard}>
            <Typography variant="body" color="#4CAF50" style={{ fontWeight: '700' }}>
              🎉 모든 세계가 해금되었습니다!
            </Typography>
            <Typography variant="caption" color="#5A6E7F" style={{ marginTop: 6 }}>
              현재 버전의 최종 세계인 바다까지 도달하셨습니다. 당신의 맑은 마음이 깊은 세계를 열었습니다.
            </Typography>
          </Card>
        )}

        {/* 4. 8대 세계 성장 가이드 라인바 */}
        <Card style={styles.guidesCard}>
          <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700', marginBottom: 14 }}>
            마음 세계 성장 가이드 (SMALL_CUP ~ SEA)
          </Typography>
          {WORLD_GUIDES.map((w, index) => {
            const isUnlocked = index <= unlockedIndex;
            return (
              <View key={w.code} style={styles.guideRow}>
                <View style={styles.guideLeft}>
                  <Typography variant="body" color={isUnlocked ? '#4CAF50' : '#B0BEC5'} style={{ fontWeight: '700' }}>
                    {isUnlocked ? '✅' : '🔒'}
                  </Typography>
                  <Typography 
                    variant="body" 
                    color={isUnlocked ? '#3A4D62' : '#90A4AE'} 
                    style={{ marginLeft: 10, fontWeight: isUnlocked ? '700' : '500' }}
                  >
                    {t(`world.${w.code.toLowerCase()}`)}
                  </Typography>
                </View>
                <Typography variant="caption" color={isUnlocked ? '#4CAF50' : '#B0BEC5'} style={{ fontWeight: '700' }}>
                  {w.score}% 이상
                </Typography>
              </View>
            );
          })}
        </Card>

        <CustomButton
          title="성장 갱신하기"
          onPress={handleRecalculate}
          style={styles.recalcBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    padding: 20,
    marginVertical: 10,
  },
  statsCard: {
    padding: 20,
    marginVertical: 10,
  },
  progressCard: {
    padding: 20,
    marginVertical: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gaugeOuter: {
    height: 12,
    backgroundColor: '#ECEFF1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  gaugeInner: {
    height: '100%',
    backgroundColor: '#78A2CC',
    borderRadius: 6,
  },
  guidesCard: {
    padding: 20,
    marginVertical: 10,
  },
  guideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  guideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recalcBtn: {
    marginVertical: 15,
    marginHorizontal: 16,
  },
});
