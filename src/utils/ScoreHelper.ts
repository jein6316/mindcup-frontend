export type CupStatus = 'CLEAR' | 'SLIGHTLY_CLOUDY' | 'CLOUDY' | 'VERY_CLOUDY';

export const getCupStatus = (pollutionScore: number): CupStatus => {
  if (pollutionScore <= 20) return 'CLEAR';
  if (pollutionScore <= 40) return 'SLIGHTLY_CLOUDY';
  if (pollutionScore <= 70) return 'CLOUDY';
  return 'VERY_CLOUDY';
};

export const getWaterColor = (pollutionScore: number): string => {
  // 탁도 점수가 높을수록 물의 탁함(회색/녹색 필터 느낌)과 불투명도를 가중
  if (pollutionScore <= 20) {
    return 'rgba(120, 180, 240, 0.15)'; // 깨끗하고 화사한 맑은물
  }
  if (pollutionScore <= 40) {
    return 'rgba(145, 175, 205, 0.35)'; // 약간 뽀얀 연청색
  }
  if (pollutionScore <= 70) {
    return 'rgba(130, 145, 160, 0.55)'; // 탁해지기 시작하는 회푸른색
  }
  return 'rgba(105, 115, 125, 0.8)'; // 깊고 어두운 안개빛 탁한색
};

export const getFishSpeed = (status: CupStatus): number => {
  switch (status) {
    case 'CLEAR': return 1.0;          // 활발함
    case 'SLIGHTLY_CLOUDY': return 0.6; // 차분함
    case 'CLOUDY': return 0.3;          // 잔잔함
    default: return 0.05;               // 숨어서 거의 멈춘 상태
  }
};
