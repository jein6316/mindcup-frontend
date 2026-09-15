import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NavigationHeader } from '../components/NavigationHeader';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { api } from '../api/api';

interface WeeklyReportDto {
  weeklyReportId: number;
  startDate: string;
  endDate: string;
  averageClarityScore: number;
  averagePollutionScore: number;
  mostCommonCloudyAction: string;
  mostCommonClearAction: string;
  mostEffectiveClearAction: string;
  sentDropCount: number;
  pouredDropCount: number;
  completedMissionCount: number;
  unlockedWorldLevel: string;
  reportMessage: string;
}

export const WeeklyReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<WeeklyReportDto | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/reports/weekly/latest');
      setReport(res.data);
    } catch (e) {
      console.warn('Failed to load weekly report', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      await api.post('/api/v1/reports/weekly/generate');
      await loadReport();
    } catch (e) {
      console.warn('Failed to regenerate report', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <NavigationHeader title={t('report.weeklyTitle') as string} navigation={navigation} />

        {loading ? (
          <ActivityIndicator size="large" color="#78A2CC" style={{ marginTop: 40 }} />
        ) : report ? (
          <View style={styles.reportArea}>
            {/* 회고 및 격려의 다정한 코멘트 카드 */}
            <Card style={styles.messageCard}>
              <Typography variant="body" color="#3A4D62" style={{ lineHeight: 22, fontWeight: '600' }}>
                {report.reportMessage}
              </Typography>
              <Typography variant="caption" color="#7B8E9F" style={{ marginTop: 8 }}>
                기간: {report.startDate} ~ {report.endDate}
              </Typography>
            </Card>

            {/* 통계 요약 목록 */}
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Typography variant="caption" color="#7B8E9F">평균 맑음도</Typography>
                <Typography variant="body" color="#78A2CC" style={{ fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                  {report.averageClarityScore}%
                </Typography>
              </Card>

              <Card style={styles.statCard}>
                <Typography variant="caption" color="#7B8E9F">평균 탁도</Typography>
                <Typography variant="body" color="#90A4AE" style={{ fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                  {report.averagePollutionScore}%
                </Typography>
              </Card>
            </View>

            {/* 행동 요약 리포트 */}
            {report.mostCommonCloudyAction || report.mostCommonClearAction || report.mostEffectiveClearAction ? (
              <Card style={styles.detailsCard}>
                <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700', marginBottom: 12 }}>
                  이번 주 내 마음의 흔적들
                </Typography>

                {report.mostCommonCloudyAction && (
                  <View style={styles.detailRow}>
                    <Typography variant="body" color="#5A6E7F">가장 빈번했던 흐림 요인</Typography>
                    <Typography variant="body" color="#E57373" style={{ fontWeight: '700' }}>
                      {report.mostCommonCloudyAction}
                    </Typography>
                  </View>
                )}

                {report.mostCommonClearAction && (
                  <View style={styles.detailRow}>
                    <Typography variant="body" color="#5A6E7F">가장 잦았던 나만의 맑음 실천</Typography>
                    <Typography variant="body" color="#4CAF50" style={{ fontWeight: '700' }}>
                      {report.mostCommonClearAction}
                    </Typography>
                  </View>
                )}

                {report.mostEffectiveClearAction && (
                  <View style={styles.detailRow}>
                    <Typography variant="body" color="#5A6E7F">가장 효과적이었던 맑음 돌봄</Typography>
                    <Typography variant="body" color="#00E5FF" style={{ fontWeight: '700' }}>
                      {report.mostEffectiveClearAction}
                    </Typography>
                  </View>
                )}
              </Card>
            ) : null}

            {/* 물방울 & 미션 요약 */}
            <Card style={styles.detailsCard}>
              <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700', marginBottom: 12 }}>
                이번 주 보살핌 통계
              </Typography>
              <View style={styles.detailRow}>
                <Typography variant="body" color="#5A6E7F">완료한 작은 미션</Typography>
                <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700' }}>
                  {report.completedMissionCount}회
                </Typography>
              </View>
              <View style={styles.detailRow}>
                <Typography variant="body" color="#5A6E7F">보낸 맑은 물방울</Typography>
                <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700' }}>
                  {report.sentDropCount}회
                </Typography>
              </View>
              <View style={styles.detailRow}>
                <Typography variant="body" color="#5A6E7F">내 컵에 부은 물방울</Typography>
                <Typography variant="body" color="#3A4D62" style={{ fontWeight: '700' }}>
                  {report.pouredDropCount}회
                </Typography>
              </View>
            </Card>

            {/* 리포트 재생성(새로고침) 버튼 */}
            <TouchableOpacity style={styles.regenerateBtn} onPress={handleRegenerate}>
              <Typography variant="body" color="#FFFFFF" style={{ fontWeight: '700' }}>
                리포트 새로 계산하기
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <Typography variant="body" color="#7B8E9F">리포트를 불러올 수 없습니다.</Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  reportArea: {
    padding: 16,
  },
  messageCard: {
    padding: 20,
    backgroundColor: '#EBF8FF',
    borderColor: '#BEE3F8',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  detailsCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  regenerateBtn: {
    height: 52,
    backgroundColor: '#78A2CC',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
