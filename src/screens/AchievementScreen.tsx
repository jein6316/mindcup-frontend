import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NavigationHeader } from '../components/NavigationHeader';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { api } from '../api/api';

interface AchievementDto {
  achievementId: number;
  achievementCode: string;
  title: string;
  description: string;
  achievedYn: boolean;
  achievedAt: string;
}

export const AchievementScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<AchievementDto[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/achievements');
      setList(res.data || []);
    } catch (e) {
      console.warn('Failed to load achievements', e);
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
        <NavigationHeader title={t('achievement.title') as string} navigation={navigation} />

        {loading ? (
          <ActivityIndicator size="large" color="#78A2CC" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {list.map((item) => (
              <Card
                key={item.achievementId}
                style={[
                  styles.achCard,
                  item.achievedYn ? styles.achievedCard : styles.lockedCard,
                ] as any}
              >
                <View style={styles.iconArea}>
                  <Typography style={{ fontSize: 28, opacity: item.achievedYn ? 1.0 : 0.25 }}>
                    {item.achievedYn ? '🏆' : '🔒'}
                  </Typography>
                </View>
                <View style={styles.infoArea}>
                  <Typography
                    variant="body"
                    color={item.achievedYn ? '#3A4D62' : '#90A4AE'}
                    style={{ fontWeight: '700' }}
                  >
                    {t(`${item.title}.title`, item.title) as string}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={item.achievedYn ? '#5A6E7F' : '#B0BEC5'}
                    style={{ marginTop: 4 }}
                  >
                    {t(`${item.title}.desc`, item.description) as string}
                  </Typography>
                </View>
              </Card>
            ))}
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
  listContainer: {
    padding: 16,
  },
  achCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  achievedCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFE082',
  },
  lockedCard: {
    backgroundColor: '#ECEFF1',
    borderColor: '#CFD8DC',
  },
  iconArea: {
    width: 48,
    alignItems: 'center',
  },
  infoArea: {
    flex: 1,
    marginLeft: 12,
  },
});
