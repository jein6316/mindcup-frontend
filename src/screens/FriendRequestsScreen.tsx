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

export const FriendRequestsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/api/friends/requests/received');
      setRequests((response as any).data);
    } catch (e) {
      console.warn('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
    }, [])
  );

  const handleAccept = async (requestId: number) => {
    try {
      await api.post(`/api/friends/requests/${requestId}/accept`);
      safeAlert('Success', '친구 요청을 수락했습니다.');
      fetchRequests();
    } catch (error: any) {
      safeAlert('Error', error.message || '요청 수락 실패');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await api.post(`/api/friends/requests/${requestId}/reject`);
      safeAlert('Success', '친구 요청을 거절했습니다.');
      fetchRequests();
    } catch (error: any) {
      safeAlert('Error', error.message || '요청 거절 실패');
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
      <NavigationHeader title="받은 친구 요청" navigation={navigation} />

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.friendId)}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.reqCard}>
            <View style={styles.reqInfo}>
              <Typography variant="h2">{item.nickname}</Typography>
              <Typography variant="hint" color="#7B8E9F" style={{ marginTop: 2 }}>{item.email}</Typography>
              <Typography variant="hint" color="#A0B2C6" style={{ marginTop: 6 }}>
                요청일: {formatDate(item.createdAt)}
              </Typography>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleReject(item.friendId)}
              >
                <Typography variant="caption" color="#E29797" style={{ fontWeight: '700' }}>
                  거절
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAccept(item.friendId)}
              >
                <Typography variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  수락
                </Typography>
              </TouchableOpacity>
            </View>
          </Card>
        )}
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
  reqCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reqInfo: {
    flex: 1,
    paddingRight: 10,
  },
  btnRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
  },
  rejectBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F2DEDE',
  },
  reqCardContainer: {},
});
