import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { CustomInput } from '../components/CustomInput';
import { safeAlert, safeConfirm } from '../utils/safeAlert';
import { NavigationHeader } from '../components/NavigationHeader';

export const RecordScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [recordType, setRecordType] = useState<'CLEAR' | 'TURBID'>('CLEAR');
  const [actionName, setActionName] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  // 커스텀 카테고리 추가용 상태
  const [customActions, setCustomActions] = useState<any[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newActionName, setNewActionName] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  // 디폴트 추천 키워드들
  const clearDefaults = ['산책하기', '일기 쓰기', '명상하기', '차 마시기', '운동하기'];
  const turbidDefaults = ['불안감', '슬픔', '화남', '무기력함', '외로움'];

  const fetchCustomActions = async () => {
    try {
      const response = await api.get('/api/v1/cups/custom-actions');
      setCustomActions((response as any).data);
    } catch (e) {
      console.warn('Failed to load custom actions', e);
    }
  };

  useEffect(() => {
    fetchCustomActions();
  }, []);

  const handleAddCustomAction = async () => {
    if (!newActionName.trim()) return;
    setCustomLoading(true);
    try {
      await api.post('/api/v1/cups/custom-actions', {
        actionName: newActionName,
        actionType: recordType,
      });
      setNewActionName('');
      setShowCustomModal(false);
      fetchCustomActions();
    } catch (error: any) {
      safeAlert('Error', error.message || '카테고리 추가 실패');
    } finally {
      setCustomLoading(false);
    }
  };

  const handleDeleteCustomAction = async (actionId: number) => {
    try {
      await api.delete(`/api/v1/cups/custom-actions/${actionId}`);
      fetchCustomActions();
    } catch (error: any) {
      safeAlert('Error', error.message || '카테고리 삭제 실패');
    }
  };

  const handleSubmitRecord = async () => {
    if (!actionName) {
      safeAlert('Info', '행동이나 감정 명칭을 선택하거나 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/cups/records', {
        recordType,
        actionName,
        intensity,
        memo,
      });

      safeAlert('Success', '기록이 마음컵에 반영되었습니다.', () => {
        navigation.goBack();
      });
    } catch (error: any) {
      safeAlert('Error', error.message || '기록 저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const currentDefaults = recordType === 'CLEAR' ? clearDefaults : turbidDefaults;
  const currentCustoms = customActions.filter((act) => act.actionType === recordType);

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <NavigationHeader title={t('record.title')} navigation={navigation} />
        
        {/* 1. 타입 선택 */}
        <Typography variant="h2" style={styles.sectionTitle}>{t('record.typeSelection')}</Typography>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, recordType === 'CLEAR' && styles.selectedClear]}
            onPress={() => { setRecordType('CLEAR'); setActionName(''); }}
          >
            <Typography variant="body" color={recordType === 'CLEAR' ? '#FFFFFF' : '#3A4D62'} style={{ fontWeight: '600' }}>
              {t('record.clear')}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeBtn, recordType === 'TURBID' && styles.selectedTurbid]}
            onPress={() => { setRecordType('TURBID'); setActionName(''); }}
          >
            <Typography variant="body" color={recordType === 'TURBID' ? '#FFFFFF' : '#3A4D62'} style={{ fontWeight: '600' }}>
              {t('record.turbid')}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* 2. 태그 리스트 */}
        <Typography variant="h2" style={styles.sectionTitle}>추천 행동 / 감정</Typography>
        <View style={styles.tagsContainer}>
          {currentDefaults.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, actionName === tag && styles.selectedTag]}
              onPress={() => setActionName(tag)}
            >
              <Typography variant="caption" color={actionName === tag ? '#FFFFFF' : '#5A6E7F'}>
                {tag}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {/* 2.1. 커스텀 태그 리스트 */}
        <View style={styles.sectionHeader}>
          <Typography variant="h2" style={styles.sectionTitle}>나만의 카테고리</Typography>
          <TouchableOpacity onPress={() => setShowCustomModal(true)}>
            <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '700' }}>
              {t('record.customActionBtn')}
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {currentCustoms.map((act) => (
            <TouchableOpacity
              key={act.actionId}
              style={[styles.tag, actionName === act.actionName && styles.selectedTag]}
              onPress={() => setActionName(act.actionName)}
              onLongPress={() => {
                safeConfirm(
                  'Info',
                  '이 카테고리를 삭제하시겠습니까?',
                  () => handleDeleteCustomAction(act.actionId)
                );
              }}
            >
              <Typography variant="caption" color={actionName === act.actionName ? '#FFFFFF' : '#5A6E7F'}>
                {act.actionName}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {/* 직접 텍스트 기입 가능 인풋 */}
        <CustomInput
          placeholder={t('record.actionPlaceholder')}
          value={actionName}
          onChangeText={setActionName}
        />

        {/* 3. 영향도 강도 선택 (1~5) */}
        <Typography variant="h2" style={styles.sectionTitle}>{t('record.intensity')}</Typography>
        <View style={styles.intensityRow}>
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = intensity === num;
            return (
              <TouchableOpacity
                key={num}
                style={[styles.intensityBtn, isSelected && styles.selectedIntensity]}
                onPress={() => setIntensity(num)}
              >
                <Typography variant="h2" color={isSelected ? '#FFFFFF' : '#3A4D62'}>
                  {num}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. 세부 메모 */}
        <Typography variant="h2" style={styles.sectionTitle}>메모</Typography>
        <TextInput
          style={styles.memoInput}
          placeholder={t('record.memoPlaceholder')}
          placeholderTextColor="#A0B2C6"
          multiline
          numberOfLines={4}
          value={memo}
          onChangeText={setMemo}
        />

        {/* 커스텀 행동 추가 모달 프레임 */}
        {showCustomModal && (
          <Card style={styles.modalCard}>
            <Typography variant="h2" style={{ marginBottom: 10 }}>{t('record.customActionTitle')}</Typography>
            <CustomInput
              placeholder={t('record.customActionName')}
              value={newActionName}
              onChangeText={setNewActionName}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setShowCustomModal(false)} style={{ marginRight: 20, padding: 10 }}>
                <Typography variant="body" color="#7B8E9F">취소</Typography>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddCustomAction} disabled={customLoading} style={{ padding: 10 }}>
                <Typography variant="body" color="#78A2CC" style={{ fontWeight: '700' }}>
                  {t('record.add')}
                </Typography>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        <CustomButton
          title={t('record.submit')}
          onPress={handleSubmitRecord}
          loading={loading}
          style={styles.submitBtn}
        />
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
  title: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  typeRow: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#E6ECF2',
    borderRadius: 25,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedClear: {
    backgroundColor: '#78A2CC', // 맑음 블루
  },
  selectedTurbid: {
    backgroundColor: '#5A6E7F', // 흐림 그레이
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF2',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
  },
  selectedTag: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIntensity: {
    backgroundColor: '#78A2CC',
    borderColor: '#78A2CC',
  },
  memoInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#3A4D62',
    height: 100,
    textAlignVertical: 'top',
  },
  modalCard: {
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#78A2CC',
  },
  submitBtn: {
    marginTop: 30,
  },
});
