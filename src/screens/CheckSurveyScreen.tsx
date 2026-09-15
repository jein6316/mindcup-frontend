import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ScreenContainer } from '../components/ScreenContainer';
import { Typography } from '../components/Typography';
import { CustomButton } from '../components/CustomButton';
import { NavigationHeader } from '../components/NavigationHeader';
import { safeAlert } from '../utils/safeAlert';

export const CheckSurveyScreen = ({ route, navigation }: any) => {
  const { t } = useTranslation();
  const onComplete = route.params?.onComplete;

  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const surveyOptions = [
    { score: 0, label: '맑음 (0)', desc: '마음이 가볍고 맑은 상태예요.' },
    { score: 25, label: '평온 (25)', desc: '큰 요동 없이 무난하고 편안해요.' },
    { score: 50, label: '평범 (50)', desc: '맑지도 탁하지도 않은 보통의 날이에요.' },
    { score: 75, label: '지침 (75)', desc: '걱정이나 스트레스가 조금 차올라요.' },
    { score: 100, label: '탁함 (100)', desc: '생각이 복잡하고 무거운 상태예요.' },
  ];

  const handleSubmit = async () => {
    if (selectedScore === null) {
      safeAlert('Info', '오늘의 마음 날씨를 선택해 주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/cups/survey', {
        pollutionScore: selectedScore,
      });

      if (onComplete) {
        onComplete();
      }
      navigation.goBack();
    } catch (error: any) {
      safeAlert('Error', error.message || '설문 제출 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <NavigationHeader title="마음 날씨 진단" navigation={navigation} />
      <View style={styles.header}>
        <Typography variant="body" color="#7B8E9F" align="center" style={styles.desc}>
          {t('survey.description')}
        </Typography>
      </View>

      <View style={styles.optionsContainer}>
        {surveyOptions.map((opt) => {
          const isSelected = selectedScore === opt.score;
          return (
            <TouchableOpacity
              key={opt.score}
              style={[
                styles.optionCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => setSelectedScore(opt.score)}
              activeOpacity={0.8}
            >
              <Typography
                variant="h2"
                color={isSelected ? '#FFFFFF' : '#3A4D62'}
                style={styles.optionLabel}
              >
                {opt.label}
              </Typography>
              <Typography
                variant="caption"
                color={isSelected ? '#E0F0FF' : '#7B8E9F'}
              >
                {opt.desc}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 격려 팁 */}
      {selectedScore !== null && selectedScore >= 50 && (
        <View style={styles.tipBox}>
          <Typography variant="caption" color="#5A6E7F" align="center">
            "{t('survey.cloudyTip')}"
          </Typography>
        </View>
      )}

      <CustomButton
        title={t('survey.submit')}
        onPress={handleSubmit}
        loading={loading}
        disabled={selectedScore === null}
        style={styles.submitBtn}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 20,
  },
  title: {
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#3A4D62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  selectedCard: {
    backgroundColor: '#78A2CC', // 활성 파스텔 블루
    borderColor: '#78A2CC',
  },
  optionLabel: {
    fontWeight: '700',
    marginBottom: 4,
  },
  tipBox: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  submitBtn: {
    marginBottom: 20,
  },
});
