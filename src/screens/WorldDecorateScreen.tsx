import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { NavigationHeader } from '../components/NavigationHeader';
import { safeAlert } from '../utils/safeAlert';

export const WorldDecorateScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const [resAll, resMy] = await Promise.all([
        api.get('/api/v1/worlds/items'),
        api.get('/api/v1/worlds/items/me'),
      ]);
      setAllItems((resAll as any).data || []);
      setMyItems((resMy as any).data || []);
    } catch (e) {
      console.warn('Failed to load decorate items', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsData();
  }, []);

  const handleToggleEquip = async (itemId: number, isCurrentlyEquipped: boolean) => {
    setLoading(true);
    try {
      if (isCurrentlyEquipped) {
        await api.post(`/api/v1/worlds/items/${itemId}/unequip`);
      } else {
        await api.post(`/api/v1/worlds/items/${itemId}/equip`);
      }
      fetchItemsData();
    } catch (e: any) {
      safeAlert('Error', e.message || '장착 설정 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  if (loading && allItems.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#78A2CC" />
        </View>
      </ScreenContainer>
    );
  }

  // 내 아이템 맵핑 정보 (itemId -> equippedYn)
  const myItemsMap = new Map<number, string>();
  myItems.forEach((item) => {
    myItemsMap.set(item.itemId, item.equippedYn);
  });

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NavigationHeader title={t('world.decorateBtn')} navigation={navigation} />

        <View style={styles.listContainer}>
          {allItems.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Typography variant="body" color="#7B8E9F" style={{ textAlign: 'center' }}>
                {t('world.noItem')}
              </Typography>
            </Card>
          ) : (
            allItems.map((item) => {
              const isAcquired = myItemsMap.has(item.itemId);
              const isEquipped = myItemsMap.get(item.itemId) === 'Y';

              return (
                <Card
                  key={item.itemId}
                  style={[
                    styles.itemCard,
                    isEquipped ? styles.equippedItemCard : null,
                    !isAcquired ? styles.lockedItemCard : null,
                  ] as any}
                >
                  <View style={styles.itemHeader}>
                    <Typography variant="body" style={{ fontWeight: '700' }} color={isAcquired ? '#3A4D62' : '#A0B2C6'}>
                      {isAcquired
                        ? (t(`item.${item.itemCode.toLowerCase()}`, item.itemNameKey) as string)
                        : `🔒 미획득 (${t(`world.${item.worldLevelCode.toLowerCase()}`) as string})`}
                    </Typography>
                    <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '600' }}>
                      {item.slotType}
                    </Typography>
                  </View>

                  <View style={styles.itemFooter}>
                    <Typography variant="caption" color="#7B8E9F">
                      소속: {t(`world.${item.worldLevelCode.toLowerCase()}`)}
                    </Typography>

                    {isAcquired ? (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          isEquipped ? styles.unequipBtn : styles.equipBtn,
                        ]}
                        onPress={() => handleToggleEquip(item.itemId, isEquipped)}
                      >
                        <Typography
                          variant="caption"
                          color={isEquipped ? '#5A6E7F' : '#FFFFFF'}
                          style={{ fontWeight: '700' }}
                        >
                          {isEquipped ? t('world.unequip') : t('world.equip')}
                        </Typography>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.actionBtn, styles.disabledBtn]}>
                        <Typography variant="caption" color="#A0B2C6">
                          잠김
                        </Typography>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })
          )}
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
  listContainer: {
    paddingTop: 16,
  },
  emptyCard: {
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  equippedItemCard: {
    borderColor: '#78A2CC',
    backgroundColor: '#F7FAFD',
  },
  lockedItemCard: {
    backgroundColor: '#F4F7FA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECF2',
    paddingBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equipBtn: {
    backgroundColor: '#78A2CC',
  },
  unequipBtn: {
    backgroundColor: '#E6ECF2',
  },
  disabledBtn: {
    backgroundColor: '#E6ECF2',
  },
});
