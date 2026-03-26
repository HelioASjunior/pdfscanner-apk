import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { Document } from '../utils/store';
import { formatBytes, formatDate, getDocIcon } from '../utils/helpers';

interface Props {
  doc: Document;
  onPress: () => void;
  onDelete: () => void;
}

export default function DocumentCard({ doc, onPress, onDelete }: Props) {
  async function handleShare() {
    if (doc.pdfUri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(doc.pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartilhar ${doc.name}`,
      });
    } else {
      Alert.alert('Compartilhar', `"${doc.name}" ainda não foi exportado como PDF. Abra-o e exporte primeiro.`);
    }
  }

  function handleMore() {
    Alert.alert(doc.name, 'Escolha uma ação', [
      { text: 'Compartilhar', onPress: handleShare },
      { text: 'Renomear', onPress: () => Alert.alert('Renomear', 'Em breve!') },
      { text: 'Excluir', style: 'destructive', onPress: onDelete },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumb}>
        <Text style={styles.thumbIcon}>{getDocIcon(doc.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{doc.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{doc.pageCount} pág • {formatBytes(doc.size)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PDF</Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(doc.updatedAt)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Text style={styles.actionIcon}>⬆</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleMore}>
          <Text style={styles.actionIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg, padding: Spacing.md,
  },
  thumb: {
    width: 44, height: 52, borderRadius: Radius.sm,
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  thumbIcon: { fontSize: 22 },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3 },
  metaText: { fontSize: FontSize.sm, color: Colors.text2 },
  badge: {
    backgroundColor: 'rgba(108,99,255,0.2)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent2 },
  date: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  actionBtn: {
    width: 32, height: 32, backgroundColor: Colors.surface3,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
  },
  actionIcon: { fontSize: 14, color: Colors.text2 },
});
