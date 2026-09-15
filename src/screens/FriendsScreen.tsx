import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';

export const FriendsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/api/friends');
      setFriends((response as any).data);
    } catch (e) {
      console.warn('Failed to load friends', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [])
  );

  const handleDeleteFriend = (friendUserId: number, nickname: string) => {
    Alert.alert('Info', `[${nickname}] 친구를 삭제하시겠습니까?`, [
      { text: 'Cancel' },
      {
        text: t('record.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/friends/${friendUserId}`);
            fetchFriends();
          } catch (error: any) {
            Alert.alert('Error', error.message || '친구 삭제 실패');
          }
        }
      }
    ]);
  };

  const handleBlockFriend = (friendUserId: number, nickname: string) => {
    Alert.alert('Warning', `[${nickname}] 친구를 차단하시겠습니까? 더 이상 물방울을 주고받을 수 없습니다.`, [
      { text: 'Cancel' },
      {
        text: '차단',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/api/friends/${friendUserId}/block`);
            fetchFriends();
          } catch (error: any) {
            Alert.alert('Error', error.message || '친구 차단 실패');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* 상단 탭 헤더 */}
      <View style={styles.header}>
        <Typography variant="h1">{t('settings.title')}</Typography>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerBtn} 
            onPress={() => navigation.navigate('FriendRequests')}
          >
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              요청 대기
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerBtn, styles.primaryHeaderBtn]} 
            onPress={() => navigation.navigate('AddFriend')}
          >
            <Typography variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
              친구 추가
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* 우체통 배너 (받은 물방울 목록 바로가기) */}
      <Card style={styles.mailboxCard}>
        <TouchableOpacity 
          style={styles.mailboxRow}
          onPress={() => navigation.navigate('ReceivedComfort')}
        >
          <Typography variant="body" color="#FFFFFF" style={{ fontWeight: '700' }}>
            📬 한 방울 우체통 확인하기
          </Typography>
          <Typography variant="caption" color="#E0F0FF">
            보러가기 &gt;
          </Typography>
        </TouchableOpacity>
      </Card>

      <FlatList
        data={friends}
        keyExtractor={(item) => String(item.friendUserId)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // 공개 범위(cupLevel)에 따른 컵 시각 상태 매핑
          const hasCupLevel = item.cupLevel !== null;
          const displayStatus = hasCupLevel ? item.cupLevel : '비공개 설정';

          return (
            <Card style={styles.friendCard}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => navigation.navigate('FriendMindStatus', { friendUserId: item.friendUserId })}
                onLongPress={() => {
                  Alert.alert('Info', '친구 관리', [
                    { text: 'Cancel' },
                    { text: '친구 차단', style: 'destructive', onPress: () => handleBlockFriend(item.friendUserId, item.nickname) },
                    { text: '친구 삭제', style: 'destructive', onPress: () => handleDeleteFriend(item.friendUserId, item.nickname) }
                  ]);
                }}
              >
                <View style={styles.infoCol}>
                  <Typography variant="h2">{item.nickname}</Typography>
                  <Typography variant="hint" color="#7B8E9F">{item.email}</Typography>
                  
                  {/* 오늘 기록 작성 여부 태그 */}
                  {item.todayRecorded !== null && (
                    <View style={styles.tagRow}>
                      <View style={[styles.statusTag, item.todayRecorded ? styles.tagActive : styles.tagInactive]}>
                        <Typography variant="hint" color={item.todayRecorded ? '#FFFFFF' : '#7B8E9F'}>
                          {item.todayRecorded ? '오늘 기록 완료' : '아직 기록 없음'}
                        </Typography>
                      </View>
                    </View>
                  )}
                </View>

                {/* 컵 상태 비주얼 대용 간이 뷰 */}
                <View style={styles.visualCol}>
                  <View style={[styles.miniCup, !hasCupLevel && styles.miniCupPrivate]}>
                    <Typography variant="hint" color={hasCupLevel ? '#78A2CC' : '#A0B2C6'} style={{ fontWeight: '800', fontSize: 10 }}>
                      {displayStatus}
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          );
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    marginLeft: 6,
  },
  primaryHeaderBtn: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
  },
  mailboxCard: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
    paddingVertical: 14,
    marginVertical: 10,
  },
  mailboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagActive: {
    backgroundColor: '#78A2CC',
  },
  tagInactive: {
    backgroundColor: '#E6ECF2',
  },
  visualCol: {
    marginLeft: 10,
  },
  miniCup: {
    width: 80,
    height: 60,
    borderWidth: 2.5,
    borderColor: '#D4E2F0',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 180, 240, 0.1)',
  },
  miniCupPrivate: {
    borderColor: '#E6ECF2',
    backgroundColor: '#F8FAFC',
  },
  nickname: {
    fontWeight: '700',
  },
});
