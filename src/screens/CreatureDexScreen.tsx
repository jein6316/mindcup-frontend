import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, FlatList, Dimensions, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { NavigationHeader } from '../components/NavigationHeader';

export const CreatureDexScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [allCreatures, setAllCreatures] = useState<any[]>([]);
  const [myCreatures, setMyCreatures] = useState<any[]>([]);

  const fetchDexData = async () => {
    setLoading(true);
    try {
      const [resAll, resMy] = await Promise.all([
        api.get('/api/v1/worlds/creatures'),
        api.get('/api/v1/worlds/creatures/me'),
      ]);
      setAllCreatures((resAll as any).data || []);
      setMyCreatures((resMy as any).data || []);
    } catch (e) {
      console.warn('Failed to load dex data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDexData();
  }, []);

  if (loading && allCreatures.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#78A2CC" />
        </View>
      </ScreenContainer>
    );
  }

  // 내 생물 코드로 빠르게 획득 여부를 파악하기 위한 Set 구성
  const myCodes = new Set(myCreatures.map((c) => c.creatureCode));

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NavigationHeader title={t('world.dexBtn')} navigation={navigation} />

        <View style={styles.dexContainer}>
          {allCreatures.map((item) => {
            const isAcquired = myCodes.has(item.creatureCode);
            return (
              <Card
                key={item.creatureCode}
                style={[styles.dexCard, !isAcquired ? styles.lockedCard : null] as any}
              >
                {/* 획득 시 이모지 노출, 미획득 시 자물쇠 실루엣 */}
                <View style={styles.avatarArea}>
                  <Typography style={{ fontSize: 32, opacity: isAcquired ? 1.0 : 0.2 }}>
                    {isAcquired ? (item.creatureCode === 'FROG' ? '🐸' : '🐟') : '🔒'}
                  </Typography>
                </View>

                {/* 생물 텍스트 정보 */}
                <Typography
                  variant="body"
                  color={isAcquired ? '#3A4D62' : '#A0B2C6'}
                  style={{ fontWeight: '700', marginTop: 8 }}
                >
                  {isAcquired
                    ? (t(`creature.${item.creatureCode.toLowerCase()}`, item.creatureNameKey) as string)
                    : (t('creature.silhouette') as string)}
                </Typography>

                <Typography variant="caption" color="#7B8E9F" style={{ marginTop: 4 }}>
                  {t(`world.${item.worldLevelCode.toLowerCase()}`)}
                </Typography>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dexContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  dexCard: {
    width: '47%',
    aspectRatio: 1.0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 16,
  },
  lockedCard: {
    backgroundColor: '#F4F7FA',
    borderColor: '#E6ECF2',
  },
  avatarArea: {
    width: 60,
    height: 60,
    backgroundColor: '#F4F7FA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
