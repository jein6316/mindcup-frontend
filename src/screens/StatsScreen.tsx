import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { formatDate } from '../utils/DateFormatter';

export const StatsScreen = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/v1/cups/statistics/weekly');
      setStatsData((response as any).data);
    } catch (e) {
      console.warn('Failed to load stats', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </ScreenContainer>
    );
  }

  const average = statsData ? statsData.averageClarity : 50;
  const highest = statsData ? statsData.highestWorldLevel : 'SMALL_CUP';
  const history = statsData ? statsData.history : [];

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Typography variant="h1" style={styles.title}>{t('stats.title')}</Typography>

        {/* 종합 요약 카드 */}
        <Card style={styles.summaryCard}>
          <Typography variant="caption" color="#E0F0FF" style={{ fontWeight: '600' }}>
            {t('stats.weeklyAvg')}
          </Typography>
          <Typography variant="h1" color="#FFFFFF" style={styles.avgText}>
            {average.toFixed(1)}%
          </Typography>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Typography variant="hint" color="#78A2CC" style={{ fontWeight: '700' }}>
                {t('home.unlockedWorld')}: {highest}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 커스텀 그래프 (순수 React Native 스타일 기반) */}
        <Typography variant="h2" style={styles.chartTitle}>7일간의 마음 변화</Typography>
        <Card style={styles.chartCard}>
          <View style={styles.graphContainer}>
            {history.map((day: any, index: number) => {
              // 맑음도 점수를 높이 백분율로 반영 (최대 100px 높이 가상 차트바)
              const barHeight = Math.max(10, day.clarityScore);
              const isToday = index === history.length - 1;

              return (
                <View key={day.date} style={styles.barColumn}>
                  {/* 점수 텍스트 */}
                  <Typography variant="hint" color={isToday ? '#78A2CC' : '#7B8E9F'} style={styles.barScore}>
                    {day.clarityScore}%
                  </Typography>
                  {/* 차트 세로바 */}
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeight}%`,
                          backgroundColor: isToday ? '#78A2CC' : '#C5D8EB',
                        },
                      ]}
                    />
                  </View>
                  {/* 요일 라벨 (예: "09" 일자만 심플 표시) */}
                  <Typography variant="hint" color={isToday ? '#3A4D62' : '#7B8E9F'} style={styles.barLabel}>
                    {day.date.substring(8, 10)}
                  </Typography>
                </View>
              );
            })}
          </View>
        </Card>

        {/* 상세 내역 타임라인 */}
        <Typography variant="h2" style={styles.chartTitle}>일자별 요약</Typography>
        {history.map((day: any) => (
          <Card key={day.date} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Typography variant="body" style={{ fontWeight: '600' }}>
                {formatDate(day.date)}
              </Typography>
              <Typography variant="h2" color="#78A2CC">
                {day.clarityScore}%
              </Typography>
            </View>
          </Card>
        ))}
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
  title: {
    marginVertical: 10,
  },
  summaryCard: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
    padding: 20,
    alignItems: 'center',
  },
  avgText: {
    fontSize: 42,
    fontWeight: '800',
    marginVertical: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 10,
  },
  chartCard: {
    paddingVertical: 24,
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180, // 고정 그래프 영역 높이
  },
  barColumn: {
    alignItems: 'center',
    width: '12%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barScore: {
    fontSize: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  barBackground: {
    width: 14,
    height: '70%',
    backgroundColor: '#F0F4F8',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    marginTop: 8,
    fontWeight: '600',
  },
  historyCard: {
    paddingVertical: 14,
    marginVertical: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
