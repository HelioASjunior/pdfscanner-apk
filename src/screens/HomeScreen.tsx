import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { useAppStore } from '../utils/store';
import { formatBytes, formatDate, getDocIcon } from '../utils/helpers';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { documents, deleteDocument, setCurrentDoc } = useAppStore();
  const recent = documents.slice(0, 4);

  const totalPages = documents.reduce((s, d) => s + d.pageCount, 0);
  const totalSize = documents.reduce((s, d) => s + d.size, 0);

  function openDoc(doc: typeof documents[0]) {
    setCurrentDoc(doc);
    navigation.navigate('Editor');
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      'Excluir documento',
      `Deseja excluir "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteDocument(id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>
              Scan<Text style={{ color: Colors.accent2 }}>PDF</Text>
            </Text>
            <Text style={styles.appSub}>Digitalize qualquer documento</Text>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Documents')}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Buscar documentos...</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderRadius: 0, borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md }]}>
            <Text style={styles.statVal}>{documents.length}</Text>
            <Text style={styles.statLbl}>Docs</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 0, borderRightWidth: 0 }]}>
            <Text style={styles.statVal}>{totalPages}</Text>
            <Text style={styles.statLbl}>Páginas</Text>
          </View>
          <View style={[styles.statCard, { borderRadius: 0, borderTopRightRadius: Radius.md, borderBottomRightRadius: Radius.md }]}>
            <Text style={styles.statVal}>{formatBytes(totalSize)}</Text>
            <Text style={styles.statLbl}>Usados</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Ações rápidas</Text>
        <View style={styles.quickActions}>
          {/* Main scan */}
          <TouchableOpacity
            style={[styles.qaBtn, styles.qaPrimary]}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.85}
          >
            <View style={[styles.qaIcon, { backgroundColor: Colors.accent, width: 52, height: 52, borderRadius: 14 }]}>
              <Text style={{ fontSize: 24 }}>📷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qaLabel}>Escanear Documento</Text>
              <Text style={styles.qaDesc}>Use a câmera para digitalizar</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.qaGrid}>
            <TouchableOpacity style={styles.qaBtn} activeOpacity={0.8}
              onPress={() => Alert.alert('Galeria', 'Abrir seletor de imagens da galeria')}>
              <View style={styles.qaIcon}><Text style={{ fontSize: 20 }}>🖼️</Text></View>
              <Text style={styles.qaLabel}>Da Galeria</Text>
              <Text style={styles.qaDesc}>Importar imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.qaBtn} activeOpacity={0.8}
              onPress={() => Alert.alert('Importar', 'Abrir seletor de arquivos PDF')}>
              <View style={styles.qaIcon}><Text style={{ fontSize: 20 }}>📁</Text></View>
              <Text style={styles.qaLabel}>Importar PDF</Text>
              <Text style={styles.qaDesc}>Arquivo existente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent */}
        <Text style={styles.sectionTitle}>Documentos recentes</Text>
        {recent.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>Nenhum documento ainda</Text>
            <Text style={styles.emptyDesc}>Escaneie seu primeiro documento para começar</Text>
          </View>
        ) : (
        <View style={styles.docList}>
          {recent.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.docCard}
              onPress={() => openDoc(doc)}
              activeOpacity={0.8}
            >
              <View style={styles.docThumb}>
                <Text style={{ fontSize: 22 }}>{getDocIcon(doc.name)}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaText}>{doc.pageCount} pág • {formatBytes(doc.size)}</Text>
                  <View style={styles.docBadge}><Text style={styles.docBadgeText}>PDF</Text></View>
                </View>
                <Text style={styles.docDate}>{formatDate(doc.updatedAt)}</Text>
              </View>
              <View style={styles.docActions}>
                <TouchableOpacity
                  style={styles.docActionBtn}
                  onPress={() => Alert.alert('Compartilhar', `Compartilhar "${doc.name}"?`)}
                >
                  <Text style={{ fontSize: 14 }}>⬆</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.docActionBtn}
                  onPress={() => confirmDelete(doc.id, doc.name)}
                >
                  <Text style={{ fontSize: 14 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },
  appTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.5 },
  appSub: { fontSize: FontSize.sm, color: Colors.text3, marginTop: 2 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: Spacing.md,
  },
  searchIcon: { fontSize: FontSize.md },
  searchPlaceholder: { fontSize: FontSize.md, color: Colors.text3 },

  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl },
  statCard: {
    flex: 1, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.md, alignItems: 'center',
  },
  statVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.accent2 },
  statLbl: { fontSize: FontSize.xs, color: Colors.text3, marginTop: 2 },

  sectionTitle: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.md,
    fontSize: FontSize.sm, fontWeight: FontWeight.bold,
    color: Colors.text3, textTransform: 'uppercase', letterSpacing: 1,
  },

  quickActions: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.xl, gap: Spacing.sm },
  qaGrid: { flexDirection: 'row', gap: Spacing.sm },

  qaBtn: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.lg, padding: Spacing.xl, flex: 1,
  },
  qaPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.lg,
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderColor: 'rgba(108,99,255,0.4)',
  },
  qaIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.surface3,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  qaLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  qaDesc: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },

  docList: { paddingHorizontal: Spacing.xxl, gap: Spacing.sm },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  docThumb: {
    width: 44, height: 52, borderRadius: Radius.sm,
    backgroundColor: Colors.surface2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3 },
  docMetaText: { fontSize: FontSize.sm, color: Colors.text2 },
  docBadge: {
    backgroundColor: 'rgba(108,99,255,0.2)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  docBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent2 },
  docDate: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  docActions: { flexDirection: 'row', gap: 6 },
  docActionBtn: {
    width: 32, height: 32, backgroundColor: Colors.surface3,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center', paddingVertical: 40,
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.text2, marginBottom: 6,
  },
  emptyDesc: {
    fontSize: FontSize.sm, color: Colors.text3, textAlign: 'center', lineHeight: 20,
  },
});
