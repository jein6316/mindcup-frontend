import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { safeAlert } from '../utils/safeAlert';
import { useAuthStore } from '../store/authStore';

interface UserItem {
  userId: number;
  email: string;
  nickname: string;
  friendCode: string;
  role: string;
}

export const AdminScreen = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [regularUserCount, setRegularUserCount] = useState(0);

  const fetchAdminData = async () => {
    try {
      setError(null);
      const response = await api.get('/api/v1/admin/users');
      const data = (response as any).data;

      setUsers(data.users || []);
      setTotalUsers(data.totalUsers || 0);
      setAdminCount(data.adminCount || 0);
      setRegularUserCount(data.regularUserCount || 0);
    } catch (err: any) {
      setError(err?.message || '관리자 대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleRole = (user: UserItem) => {
    const nextRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    const actionText = nextRole === 'ROLE_ADMIN' ? '관리자로 지정' : '일반 유저로 변경';

    safeAlert(
      '권한 변경 확인',
      `${user.nickname}(${user.email}) 님을 ${actionText}하시겠습니까?`,
      async () => {
        try {
          await api.patch(`/api/v1/admin/users/${user.userId}/role`, {
            role: nextRole,
          });
          safeAlert('완료', '권한이 변경되었습니다.');
          fetchAdminData();
        } catch (e: any) {
          safeAlert('오류', e?.message || '권한 변경 실패');
        }
      }
    );
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color="#78A2CC" />
        <Typography variant="body" color="#7B8E9F" style={{ marginTop: 12 }}>
          관리자 대시보드 데이터를 불러오는 중...
        </Typography>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdminData(); }} />}
      >
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Typography variant="h1" color="#3A4D62" style={styles.headerTitle}>
            ⚙️ 서비스 관리자 대시보드
          </Typography>
          <Typography variant="body" color="#7B8E9F">
            마음컵 전체 사용자 및 시스템 권한을 관리합니다.
          </Typography>
        </View>

        <ErrorMessage message={error} />

        {/* 요약 통계 카운터 카드 */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: '#EBF3FA' }]}>
            <Typography variant="h2" color="#78A2CC">{totalUsers}</Typography>
            <Typography variant="caption" color="#5A789A">전체 가입자</Typography>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#FDE8E8' }]}>
            <Typography variant="h2" color="#9B1C1C">{adminCount}</Typography>
            <Typography variant="caption" color="#9B1C1C">관리자 수</Typography>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#E6F4EA' }]}>
            <Typography variant="h2" color="#137333">{regularUserCount}</Typography>
            <Typography variant="caption" color="#137333">일반 유저 수</Typography>
          </Card>
        </View>

        {/* 사용자 목록 섹션 */}
        <Typography variant="h2" color="#3A4D62" style={styles.sectionTitle}>
          👥 가입 사용자 목록 ({users.length}명)
        </Typography>

        {users.map((item) => {
          const isAdmin = item.role === 'ROLE_ADMIN';
          const isSelf = item.userId === currentUser?.userId;

          return (
            <Card key={item.userId} style={styles.userCard}>
              <View style={styles.userInfoLeft}>
                <View style={styles.nameRow}>
                  <Typography variant="h2" color="#3A4D62" style={styles.nicknameText}>
                    {item.nickname}
                  </Typography>
                  <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.userBadge]}>
                    <Typography variant="caption" color={isAdmin ? '#FFFFFF' : '#5A789A'}>
                      {isAdmin ? 'ADMIN' : 'USER'}
                    </Typography>
                  </View>
                  {isSelf && (
                    <View style={styles.selfBadge}>
                      <Typography variant="caption" color="#78A2CC">나</Typography>
                    </View>
                  )}
                </View>
                <Typography variant="body" color="#7B8E9F" style={styles.emailText}>
                  {item.email}
                </Typography>
                <Typography variant="caption" color="#A0B2C6">
                  친구코드: {item.friendCode}
                </Typography>
              </View>

              {!isSelf && (
                <TouchableOpacity
                  style={[styles.toggleBtn, isAdmin ? styles.demoteBtn : styles.promoteBtn]}
                  onPress={() => handleToggleRole(item)}
                >
                  <Typography variant="caption" color={isAdmin ? '#9B1C1C' : '#1B66C9'}>
                    {isAdmin ? '일반으로' : '관리자로'}
                  </Typography>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 14,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  userInfoLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nicknameText: {
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
  emailText: {
    fontSize: 13,
    marginBottom: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  adminBadge: {
    backgroundColor: '#E53E3E',
  },
  userBadge: {
    backgroundColor: '#EDF2F7',
  },
  selfBadge: {
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 12,
  },
  promoteBtn: {
    borderColor: '#BEE3F8',
    backgroundColor: '#EBF8FF',
  },
  demoteBtn: {
    borderColor: '#FEB2B2',
    backgroundColor: '#FFF5F5',
  },
});
