import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { useAppStore, Document } from '../utils/store';
import { formatBytes, formatDate, getDocIcon } from '../utils/helpers';

type SortMode = 'recent' | 'name' | 'size';

export default function DocumentsScreen() {
  const navigation = useNavigation<any>();
  const { documents, deleteDocument, setCurrentDoc } = useAppStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('recent');
  const [showSort, setShowSort] = useState(false);

  const filtered = documents
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'size') return b.size - a.size;
      return b.updatedAt - a.updatedAt;
    });

  function openDoc(doc: Document) {
    setCurrentDoc(doc);
    navigation.navigate('Editor');
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert('Excluir documento', `Deseja excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteDocument(id) },
    ]);
  }

  async function shareDoc(doc: Document) {
    if (doc.pdfUri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(doc.pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartilhar ${doc.name}`,
      });
    } else {
      Alert.alert('Compartilhar', `Compartilhar "${doc.name}"`);
    }
  }

  const sortLabels: Record<SortMode, string> = {
    recent: 'Mais recentes',
    name: 'Nome',
    size: 'Tamanho',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Documentos</Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
          <Text style={styles.sortBtnText}>{sortLabels[sort]} ↓</Text>
        </TouchableOpacity>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View style={styles.sortDropdown}>
          {(Object.keys(sortLabels) as SortMode[]).map(s => (
            <TouchableOpacity key={s} style={styles.sortOpt} onPress={() => { setSort(s); setShowSort(false); }}>
              <Text style={[styles.sortOptText, sort === s && { color: Colors.accent2 }]}>
                {sort === s ? '✓ ' : '  '}{sortLabels[s]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={`Buscar em ${documents.length} documentos...`}
          placeholderTextColor={Colors.text3}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: Colors.text3, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Doc list */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📂</Text>
            <Text style={styles.emptyTitle}>Nenhum documento</Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Nenhum resultado para sua busca.' : 'Escaneie seu primeiro documento!'}
            </Text>
          </View>
        ) : (
          filtered.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.card}
              onPress={() => openDoc(doc)}
              activeOpacity={0.8}
            >
              <View style={styles.thumb}>
                <Text style={{ fontSize: 22 }}>{getDocIcon(doc.name)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <View style={styles.meta}>
                  <Text style={styles.metaText}>{doc.pageCount} pág</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{formatBytes(doc.size)}</Text>
                  <View style={styles.badge}><Text style={styles.badgeText}>PDF</Text></View>
                </View>
                <Text style={styles.date}>{formatDate(doc.updatedAt)}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => shareDoc(doc)}>
                  <Text style={{ fontSize: 13 }}>⬆</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(doc.id, doc.name)}>
                  <Text style={{ fontSize: 13 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text, letterSpacing: -0.5 },
  sortBtn: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, paddingHorizontal: 14, paddingVertical: 8,
  },
  sortBtnText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },

  sortDropdown: {
    position: 'absolute', top: 70, right: 20, zIndex: 100,
    backgroundColor: Colors.surface2, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  sortOpt: { paddingHorizontal: 20, paddingVertical: 12 },
  sortOptText: { fontSize: FontSize.md, color: Colors.text },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, paddingVertical: 12 },

  list: { flex: 1, paddingHorizontal: Spacing.xxl },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  thumb: {
    width: 44, height: 52, borderRadius: Radius.sm,
    backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0 },
  docName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  metaText: { fontSize: FontSize.sm, color: Colors.text2 },
  metaDot: { fontSize: FontSize.sm, color: Colors.text3 },
  badge: { backgroundColor: 'rgba(108,99,255,0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent2 },
  date: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 32, height: 32, backgroundColor: Colors.surface3,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: FontWeight.semibold, color: Colors.text },
  emptyDesc: { fontSize: 14, color: Colors.text3, textAlign: 'center' },
});
