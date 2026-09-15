import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { formatDate } from '../utils/DateFormatter';
import { NavigationHeader } from '../components/NavigationHeader';
import { safeAlert } from '../utils/safeAlert';

export const ReceivedComfortScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchReceivedMessages = async () => {
    try {
      const response = await api.get('/api/comfort/messages/received');
      const list = (response as any).data;
      setMessages(list);

      // 읽지 않은 메시지 자동 읽음 처리
      list.forEach(async (msg: any) => {
        if (msg.readYn === 'N') {
          try {
            await api.patch(`/api/comfort/messages/${msg.comfortId}/read`);
          } catch (e) {
            console.warn('Failed to mark read message', msg.comfortId, e);
          }
        }
      });
    } catch (e) {
      console.warn('Failed to load received messages', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchReceivedMessages();
    }, [])
  );

  const handlePour = async (comfortId: number) => {
    try {
      await api.post(`/api/comfort/messages/${comfortId}/pour`);
      safeAlert('Success', '맑은 한 방울을 컵에 부었습니다. 탁도가 개선되었습니다!');
      fetchReceivedMessages();
    } catch (error: any) {
      safeAlert('Error', error.message || '붓기 실패');
    }
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
      <NavigationHeader title="한 방울 우체통" navigation={navigation} />

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.comfortId)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isPoured = item.pouredYn === 'Y';

          return (
            <Card style={styles.msgCard}>
              <View style={styles.msgBody}>
                <Typography variant="caption" color="#7B8E9F" style={{ fontWeight: '600' }}>
                  From: {item.senderNickname}
                </Typography>
                <Typography variant="body" style={styles.content}>
                  "{item.content}"
                </Typography>
                <Typography variant="hint" color="#A0B2C6" style={{ marginTop: 8 }}>
                  {formatDate(item.createdAt)}
                </Typography>
              </View>

              <View style={styles.actionArea}>
                {isPoured ? (
                  <View style={styles.pouredLabel}>
                    <Typography variant="caption" color="#A0B2C6" style={{ fontWeight: '700' }}>
                      부음 완료
                    </Typography>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.pourBtn}
                    onPress={() => handlePour(item.comfortId)}
                  >
                    <Typography variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                      컵에 붓기
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
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
    marginVertical: 10,
  },
  backBtn: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  msgCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  msgBody: {
    flex: 1,
    paddingRight: 15,
  },
  content: {
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 6,
    color: '#3A4D62',
    lineHeight: 20,
  },
  actionArea: {
    justifyContent: 'center',
  },
  pourBtn: {
    backgroundColor: '#78A2CC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pouredLabel: {
    backgroundColor: '#E6ECF2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
