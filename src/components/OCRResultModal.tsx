import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Share,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { OCRResult } from '../hooks/useOCR';

interface Props {
  visible: boolean;
  result: OCRResult | null;
  onClose: () => void;
}

export default function OCRResultModal({ visible, result, onClose }: Props) {
  async function handleShare() {
    if (!result) return;
    await Share.share({ message: result.text, title: 'Texto extraído' });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Texto extraído (OCR)</Text>
            <View style={styles.confidence}>
              <Text style={styles.confidenceText}>
                {Math.round((result?.confidence ?? 0) * 100)}% confiança
              </Text>
            </View>
          </View>

          <ScrollView style={styles.textBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.extractedText} selectable>
              {result?.text ?? 'Nenhum texto encontrado.'}
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnText}>📤 Compartilhar texto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={onClose}>
              <Text style={[styles.actionBtnText, { color: Colors.text2 }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 24, paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 36, height: 4, backgroundColor: Colors.surface3,
    borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, marginBottom: 12,
  },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  confidence: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  confidenceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.success },

  textBox: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md, padding: Spacing.md,
    maxHeight: 300,
  },
  extractedText: {
    fontSize: FontSize.md, color: Colors.text,
    lineHeight: 22,
  },

  actions: { paddingHorizontal: Spacing.xl, marginTop: 16, gap: 8 },
  actionBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
});
