import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from './Typography';

interface CreatureInfo {
  creatureCode: string;
  creatureName: string;
  creatureType: string;
}

interface ItemInfo {
  itemCode: string;
  itemName: string;
  itemType: string;
  slotType: string;
}

interface MindWorldProps {
  worldLevel: string;
  pollutionScore: number;
  clarityScore: number;
  creatureState: 'ACTIVE' | 'SLOW' | 'RESTING' | 'HIDDEN';
  creatures: CreatureInfo[];
  equippedItems: ItemInfo[];
  loading?: boolean;
}

export const MindWorld: React.FC<MindWorldProps> = ({
  worldLevel,
  pollutionScore,
  clarityScore,
  creatureState,
  creatures,
  equippedItems,
  loading = false,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#78A2CC" />
      </View>
    );
  }

  // 1. 탁도 수준에 따른 물 그라데이션 및 분위기 섀도우 연출
  let waterBgColor = '#E3F2FD'; // 디폴트
  let waterGlowStyle = {};

  if (pollutionScore <= 20) {
    // CLEAR
    waterBgColor = 'linear-gradient(180deg, #E0F7FA 0%, #80DEEA 100%)';
    waterGlowStyle = { shadowColor: '#00E5FF', shadowRadius: 20, shadowOpacity: 0.15 };
  } else if (pollutionScore <= 40) {
    // SLIGHTLY_CLOUDY
    waterBgColor = 'linear-gradient(180deg, #E0F2F1 0%, #B2DFDB 100%)';
    waterGlowStyle = { shadowColor: '#4DB6AC', shadowRadius: 15, shadowOpacity: 0.1 };
  } else if (pollutionScore <= 70) {
    // CLOUDY
    waterBgColor = 'linear-gradient(180deg, #ECEFF1 0%, #CFD8DC 100%)';
    waterGlowStyle = { shadowColor: '#90A4AE', shadowRadius: 10, shadowOpacity: 0.08 };
  } else {
    // VERY_CLOUDY
    waterBgColor = 'linear-gradient(180deg, #37474F 0%, #263238 100%)';
    waterGlowStyle = { shadowColor: '#1A3038', shadowRadius: 8, shadowOpacity: 0.05 };
  }

  // 2. 월드 레벨에 따른 아우터 테두리 스타일 변형 (모바일 섀도우 및 프레임 형태)
  let worldFrameStyle: any = styles.smallCupFrame;
  let worldTitle = t('world.smallCup');

  if (worldLevel === 'LARGE_CUP') {
    worldFrameStyle = styles.largeCupFrame;
    worldTitle = t('world.largeCup');
  } else if (worldLevel === 'AQUARIUM') {
    worldFrameStyle = styles.aquariumFrame;
    worldTitle = t('world.aquarium');
  } else if (worldLevel === 'POND') {
    worldFrameStyle = styles.pondFrame;
    worldTitle = t('world.pond');
  } else if (worldLevel === 'STREAM') {
    worldFrameStyle = styles.streamFrame;
    worldTitle = t('world.stream');
  } else if (worldLevel === 'RIVER') {
    worldFrameStyle = styles.riverFrame;
    worldTitle = t('world.river');
  } else if (worldLevel === 'LAKE') {
    worldFrameStyle = styles.lakeFrame;
    worldTitle = t('world.lake');
  } else if (worldLevel === 'SEA') {
    worldFrameStyle = styles.seaFrame;
    worldTitle = t('world.sea');
  }

  // 조경 기물 장착 여부 검사
  const hasWarmLight = equippedItems.some((item) => item.itemCode === 'WARM_LIGHT');
  const hasLotusLeaf = equippedItems.some((item) => item.itemCode === 'LOTUS_LEAF');
  const hasPebble = equippedItems.some((item) => item.itemCode === 'BASIC_PEBBLE');
  const hasSprout = equippedItems.some((item) => item.itemCode === 'BABY_SPROUT');
  const hasStreamLeaf = equippedItems.some((item) => item.itemCode === 'STREAM_LEAF');
  const hasRiverReed = equippedItems.some((item) => item.itemCode === 'RIVER_REED');
  const hasLakeMoon = equippedItems.some((item) => item.itemCode === 'LAKE_MOON');
  const hasSeaCoral = equippedItems.some((item) => item.itemCode === 'SEA_CORAL');

  return (
    <View style={[styles.cardContainer, waterGlowStyle]}>
      {/* 2단계 성장 명칭 헤더 */}
      <View style={styles.headerRow}>
        <Typography variant="body" color="#5A6E7F" style={{ fontWeight: '700' }}>
          {worldTitle}
        </Typography>
        <Typography variant="caption" color="#78A2CC" style={{ fontWeight: '600' }}>
          {t('home.clarity')}: {clarityScore}%
        </Typography>
      </View>

      {/* 수중 시각화 프레임 */}
      <View
        style={[
          styles.aquaticFrame,
          worldFrameStyle,
          Platform.OS === 'web' ? ({ backgroundImage: waterBgColor } as any) : { backgroundColor: '#B2DFDB' },
        ]}
      >
        {/* WARM_LIGHT 조명 장착 시 밤하늘 필터 광원 효과 오버레이 */}
        {hasWarmLight && <View style={styles.warmLightOverlay} />}

        {/* 수중 조경 장식 렌더링 */}
        <View style={styles.decorationsLayer}>
          {hasPebble && <View style={styles.pebbleDecor} />}
          {hasSprout && <View style={styles.sproutDecor} />}
          {hasLotusLeaf && <View style={styles.lotusDecor} />}
          {hasLakeMoon && <View style={styles.lakeMoonDecor} />}
          {hasStreamLeaf && <View style={styles.streamLeafDecor} />}
          {hasRiverReed && <View style={styles.riverReedDecor} />}
          {hasSeaCoral && <View style={styles.seaCoralDecor} />}
        </View>

        {/* 생물 레이어 */}
        <View style={styles.creaturesLayer}>
          {creatures.length === 0 ? (
            <View style={styles.emptyCreatureBubble}>
              <Typography variant="caption" color="#7B8E9F" style={{ textAlign: 'center' }}>
                {t('creature.hidden')}
              </Typography>
            </View>
          ) : (
            creatures.map((c, index) => {
              // 탁도에 따른 생물별 애니메이션 동작 연출 (CSS 전환 속도 및 투명도)
              let creatureStyle = {};
              let statusLabel = '';

              if (creatureState === 'ACTIVE') {
                creatureStyle = styles.creatureActive;
                statusLabel = '🏊';
              } else if (creatureState === 'SLOW') {
                creatureStyle = styles.creatureSlow;
                statusLabel = '🐢';
              } else if (creatureState === 'RESTING') {
                creatureStyle = styles.creatureResting;
                statusLabel = 'Resting 💤';
              } else {
                // HIDDEN
                creatureStyle = styles.creatureHidden;
                statusLabel = 'Sleeping 💤';
              }

              return (
                <View
                  key={c.creatureCode + index}
                  style={[styles.creatureBubble, creatureStyle, { top: 40 + index * 45 }]}
                >
                  <Typography variant="caption" color={pollutionScore > 70 ? '#A0B2C6' : '#3A4D62'} style={{ fontWeight: '700' }}>
                    {statusLabel} {t(`creature.${c.creatureCode.toLowerCase()}`, c.creatureName) as string}
                  </Typography>
                </View>
              );
            })
          )}
        </View>

        {/* 연못 테두리나 조경 풀잎 레이아웃 입체 효과 */}
        {worldLevel === 'POND' && <View style={styles.pondShoreBorder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 24px rgba(26, 48, 56, 0.05)',
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  aquaticFrame: {
    height: 240,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 월드 등급별 프레임 변형 보정
  smallCupFrame: {
    borderWidth: 4,
    borderColor: '#D8E2EC',
    borderRadius: 16,
    marginHorizontal: 40,
  },
  largeCupFrame: {
    borderWidth: 5,
    borderColor: '#78A2CC',
    borderRadius: 20,
    marginHorizontal: 15,
  },
  aquariumFrame: {
    borderWidth: 6,
    borderColor: '#3A4D62',
    borderRadius: 12,
  },
  pondFrame: {
    borderWidth: 8,
    borderColor: '#81C784',
    borderRadius: 30,
  },
  streamFrame: {
    borderWidth: 6,
    borderColor: '#4DB6AC',
    borderRadius: 20,
  },
  riverFrame: {
    borderWidth: 6,
    borderColor: '#FFB74D',
    borderRadius: 16,
  },
  lakeFrame: {
    borderWidth: 8,
    borderColor: '#9575CD',
    borderRadius: 24,
  },
  seaFrame: {
    borderWidth: 8,
    borderColor: '#0288D1',
    borderRadius: 32,
  },
  center: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },
  // 조경 오버레이 필터 효과
  warmLightOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 235, 59, 0.12)',
    zIndex: 2,
  },
  decorationsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  // 개별 조경 그래픽 요소
  pebbleDecor: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 25,
    height: 12,
    backgroundColor: '#90A4AE',
    borderRadius: 6,
  },
  sproutDecor: {
    position: 'absolute',
    bottom: 10,
    right: 35,
    width: 14,
    height: 35,
    backgroundColor: '#81C784',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  lotusDecor: {
    position: 'absolute',
    top: 15,
    left: 40,
    width: 45,
    height: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  lakeMoonDecor: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 35,
    height: 35,
    backgroundColor: '#FFF59D',
    borderRadius: 18,
    ...Platform.select({
      web: {
        boxShadow: '0 0 10px #FFF59D',
      },
    }),
  },
  streamLeafDecor: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    width: 22,
    height: 12,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 11,
  },
  riverReedDecor: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 6,
    height: 40,
    backgroundColor: '#A1887F',
    borderRadius: 3,
  },
  seaCoralDecor: {
    position: 'absolute',
    bottom: 10,
    left: 50,
    width: 25,
    height: 20,
    backgroundColor: '#E57373',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  creaturesLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
    justifyContent: 'center',
  },
  creatureBubble: {
    position: 'absolute',
    left: '25%',
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6ECF2',
  },
  emptyCreatureBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E6ECF2',
    marginHorizontal: 30,
  },
  creatureActive: {
    opacity: 1.0,
  },
  creatureSlow: {
    opacity: 0.85,
  },
  creatureResting: {
    opacity: 0.6,
  },
  creatureHidden: {
    opacity: 0.2,
  },
  pondShoreBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 4,
    borderColor: '#C8E6C9',
    borderRadius: 26,
    pointerEvents: 'none',
  },
});
