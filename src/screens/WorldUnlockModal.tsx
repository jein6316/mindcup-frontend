import React from 'react';
import { StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';

interface WorldUnlockModalProps {
  visible: boolean;
  worldLevel: string;
  onClose: () => void;
}

export const WorldUnlockModal: React.FC<WorldUnlockModalProps> = ({
  visible,
  worldLevel,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  const levelName = t(`world.${worldLevel.toLowerCase()}`);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.modalContainer}>
          {/* 축하 그래픽 이모지 효과 */}
          <View style={styles.emojiArea}>
            <Typography style={{ fontSize: 48 }}>🌊✨</Typography>
          </View>

          {/* 타이틀 및 힐링 문구 */}
          <Typography
            variant="h1"
            color="#3A4D62"
            style={{ textAlign: 'center', fontWeight: '800', marginBottom: 12 }}
          >
            {t('world.unlocked')}
          </Typography>

          <Typography
            variant="body"
            color="#5A6E7F"
            style={{ textAlign: 'center', lineHeight: 22, marginBottom: 24 }}
          >
            당신의 따스한 셀프케어 돌봄이 모여 {"\n"}
            마음의 물이 새로운 세계로 흘러갔어요.{"\n"}
            <Typography variant="body" color="#78A2CC" style={{ fontWeight: '700' }}>
              [{levelName}]
            </Typography>
            {" "}단계를 지금 만나보세요.
          </Typography>

          <CustomButton
            title="세계 보러가기"
            onPress={onClose}
          />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 48, 56, 0.4)', // 어두운 딤드 필터
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#78A2CC',
    alignItems: 'center',
  },
  emojiArea: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F8FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
