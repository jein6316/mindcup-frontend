import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { getWaterColor, getFishSpeed, getCupStatus, CupStatus } from '../utils/ScoreHelper';
import { Typography } from './Typography';

interface MindCupProps {
  pollutionScore: number;
}

export const MindCup: React.FC<MindCupProps> = ({ pollutionScore }) => {
  const status = getCupStatus(pollutionScore);
  const waterColor = getWaterColor(pollutionScore);
  const fishSpeed = getFishSpeed(status);

  // 물의 출렁임 애니메이션
  const waveAnim = useRef(new Animated.Value(0)).current;
  // 물고기 움직임 (X, Y 좌표)
  const fishAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  // 물고기 좌우 반전 상태 (1: 우측, -1: 좌측)
  const fishDirection = useRef(new Animated.Value(1)).current;

  // 물 출렁임 루프
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 물고기 유영 루프
  useEffect(() => {
    let active = true;

    const swim = () => {
      if (!active) return;

      // VERY_CLOUDY인 경우 거의 움직이지 않고 한곳에서 쉼
      if (status === 'VERY_CLOUDY') {
        Animated.parallel([
          Animated.timing(fishAnim.x, {
            toValue: -50, // 왼쪽 구석 수초 뒤로 숨음
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(fishAnim.y, {
            toValue: 60, // 바닥 구석
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (active) {
            // 숨은 상태로 머무는 루프
            setTimeout(swim, 5000);
          }
        });
        return;
      }

      // 맑음도 속도에 따른 이동시간 조절
      const duration = 4000 / fishSpeed;
      const targetX = (Math.random() - 0.5) * 120; // 컵 안의 가로 반경
      const targetY = (Math.random() - 0.5) * 80 + 20;  // 컵 안의 세로 반경

      // 가로 이동 타겟에 맞춰 방향 설정
      const currentX = (fishAnim.x as any)._value || 0;
      const direction = targetX > currentX ? 1 : -1;
      fishDirection.setValue(direction);

      Animated.parallel([
        Animated.timing(fishAnim.x, {
          toValue: targetX,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(fishAnim.y, {
          toValue: targetY,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (active) {
          swim();
        }
      });
    };

    swim();

    return () => {
      active = false;
    };
  }, [pollutionScore, status]);

  // 물 출렁임 보간
  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });

  return (
    <View style={styles.container}>
      {/* 컵 몸체 아웃라인 */}
      <View style={styles.cupOutline}>
        {/* 채워진 물 */}
        <Animated.View
          style={[
            styles.water,
            {
              backgroundColor: waterColor,
              transform: [{ translateY: waveTranslateY }],
            },
          ]}
        >
          {/* 수초 그래픽 대용 (CLOUDY, VERY_CLOUDY 일 때 숨을 공간 표현) */}
          <View style={styles.plantLeft} />
          <View style={styles.plantRight} />

          {/* 물고기 */}
          <Animated.View
            style={[
              styles.fish,
              {
                transform: [
                  { translateX: fishAnim.x },
                  { translateY: fishAnim.y },
                  { scaleX: fishDirection },
                ],
              },
            ]}
          >
            {/* 은빛 물고기 아이콘 (SVG 대용 심플 형상) */}
            <View style={styles.fishBody}>
              <View style={styles.fishTail} />
              <View style={styles.fishEye} />
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  cupOutline: {
    width: 200,
    height: 240,
    borderWidth: 5,
    borderColor: '#D4E2F0', // 유리 컵 모서리 느낌
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  water: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '30%', // 컵의 70% 정도 채워진 물 높이
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  fish: {
    position: 'absolute',
    left: '50%',
    top: '40%',
    marginLeft: -15,
    marginTop: -10,
    width: 30,
    height: 15,
  },
  fishBody: {
    width: 22,
    height: 12,
    backgroundColor: '#C5D8EB', // 은빛 비늘 색상
    borderRadius: 6,
    position: 'relative',
  },
  fishTail: {
    position: 'absolute',
    left: -8,
    top: 2,
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderTopColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: '#C5D8EB',
  },
  fishEye: {
    position: 'absolute',
    right: 4,
    top: 3,
    width: 3,
    height: 3,
    backgroundColor: '#3A4D62',
    borderRadius: 1.5,
  },
  plantLeft: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    width: 25,
    height: 70,
    backgroundColor: 'rgba(120, 160, 140, 0.4)', // 파스텔그린 수초
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  plantRight: {
    position: 'absolute',
    bottom: -15,
    right: 15,
    width: 30,
    height: 50,
    backgroundColor: 'rgba(120, 160, 140, 0.4)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
});
