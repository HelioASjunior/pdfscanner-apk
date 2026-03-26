import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { useAppStore } from '../utils/store';
import { formatBytes } from '../utils/helpers';

export default function SettingsScreen() {
  const { documents } = useAppStore();
  const [autoDetect, setAutoDetect] = useState(true);
  const [autoOCR, setAutoOCR] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const totalSize = documents.reduce((s, d) => s + d.size, 0);
  const usedPercent = Math.min(100, (totalSize / (5 * 1024 * 1024 * 1024)) * 100);

  function Row({
    icon, title, desc, value, onToggle, onPress, rightLabel,
  }: {
    icon: string; title: string; desc?: string;
    value?: boolean; onToggle?: (v: boolean) => void;
    onPress?: () => void; rightLabel?: string;
  }) {
    return (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress ?? (() => onToggle && onToggle(!value))}
        activeOpacity={onToggle || onPress ? 0.7 : 1}
      >
        <Text style={{ fontSize: 20, width: 30 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{title}</Text>
          {desc && <Text style={styles.rowDesc}>{desc}</Text>}
        </View>
        {onToggle !== undefined && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: Colors.surface3, true: Colors.accent }}
            thumbColor="#fff"
          />
        )}
        {rightLabel && (
          <Text style={styles.rowRight}>{rightLabel} ›</Text>
        )}
        {onPress && !rightLabel && (
          <Text style={{ color: Colors.text3, fontSize: 18 }}>›</Text>
        )}
      </TouchableOpacity>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
  }

  function Divider() {
    return <View style={styles.divider} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Configurações</Text>

        {/* Profile */}
        <TouchableOpacity style={styles.profileCard} onPress={() => Alert.alert('Perfil', 'Gerenciar conta')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>João Silva</Text>
            <Text style={styles.profileEmail}>joao@email.com</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Gratuito</Text>
          </View>
        </TouchableOpacity>

        {/* Upgrade */}
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => Alert.alert('Pro', 'Upgrade para o plano Pro!')}
        >
          <Text style={{ fontSize: 20 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>Upgrade para Pro</Text>
            <Text style={styles.upgradeDesc}>OCR ilimitado • Sem anúncios • 50 GB na nuvem</Text>
          </View>
          <Text style={{ color: Colors.accent2, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Scan settings */}
        <SectionHeader title="Digitalização" />
        <View style={styles.group}>
          <Row
            icon="🎯" title="Detecção automática"
            desc="Detectar bordas do documento automaticamente"
            value={autoDetect} onToggle={setAutoDetect}
          />
          <Divider />
          <Row
            icon="📸" title="Alta qualidade"
            desc="Capturar em máxima resolução"
            value={highQuality} onToggle={setHighQuality}
          />
          <Divider />
          <Row
            icon="🔤" title="OCR automático"
            desc="Extrair texto ao salvar o documento"
            value={autoOCR} onToggle={setAutoOCR}
          />
          <Divider />
          <Row
            icon="🎨" title="Filtro padrão"
            desc="Modo de processamento padrão"
            rightLabel="Auto"
            onPress={() => Alert.alert('Filtro padrão', 'Selecione:\n• Auto\n• Preto & Branco\n• Aprimorado\n• Original')}
          />
        </View>

        {/* Storage */}
        <SectionHeader title="Armazenamento" />
        <View style={styles.group}>
          <View style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Text style={styles.rowTitle}>Espaço usado</Text>
              <Text style={styles.storageVal}>{formatBytes(totalSize)} / 5 GB</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.max(0.5, usedPercent)}%` as any }]} />
            </View>
            <Text style={styles.storageDocs}>{documents.length} documento{documents.length !== 1 ? 's' : ''}</Text>
          </View>
          <Divider />
          <Row
            icon="☁️" title="Google Drive"
            desc="Backup automático na nuvem"
            value={autoBackup} onToggle={setAutoBackup}
          />
          <Divider />
          <Row
            icon="🗑" title="Limpar cache"
            onPress={() => Alert.alert('Cache limpo', 'O cache do app foi limpo.')}
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="Aparência" />
        <View style={styles.group}>
          <Row
            icon="🌙" title="Modo escuro"
            value={darkMode} onToggle={setDarkMode}
          />
          <Divider />
          <Row
            icon="📐" title="Tamanho do PDF"
            rightLabel="A4"
            onPress={() => Alert.alert('Tamanho', 'A4, Letter, A3...')}
          />
        </View>

        {/* About */}
        <SectionHeader title="Sobre" />
        <View style={styles.group}>
          <Row icon="ℹ️" title="Versão" rightLabel="1.0.0" />
          <Divider />
          <Row
            icon="⭐" title="Avaliar o app"
            onPress={() => Alert.alert('Obrigado!', 'Avalie-nos na Play Store!')}
          />
          <Divider />
          <Row
            icon="📧" title="Suporte"
            onPress={() => Alert.alert('Suporte', 'suporte@scanpdf.app')}
          />
          <Divider />
          <Row
            icon="📜" title="Política de privacidade"
            onPress={() => Alert.alert('Política', 'Ver política de privacidade...')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  pageTitle: {
    fontSize: FontSize.xxxl, fontWeight: FontWeight.bold,
    color: Colors.text, letterSpacing: -0.5,
    paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
  },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg, padding: Spacing.md,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: FontWeight.bold, color: '#fff' },
  profileName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  profileEmail: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },
  planBadge: {
    backgroundColor: Colors.surface3, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  planBadgeText: { fontSize: FontSize.sm, color: Colors.text2, fontWeight: '600' },

  upgradeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.xxl,
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)',
    borderRadius: Radius.lg, padding: Spacing.md,
  },
  upgradeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.accent2 },
  upgradeDesc: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },

  sectionHeader: {
    paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.sm,
    fontSize: FontSize.xs, fontWeight: FontWeight.bold,
    color: Colors.text3, textTransform: 'uppercase', letterSpacing: 1,
  },
  group: {
    marginHorizontal: Spacing.xxl, marginBottom: Spacing.xl,
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.lg, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: Spacing.md,
  },
  rowTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  rowDesc: { fontSize: FontSize.sm, color: Colors.text2, marginTop: 2 },
  rowRight: { fontSize: FontSize.md, color: Colors.accent2 },
  divider: { height: 1, backgroundColor: Colors.surface3, marginLeft: 58 },

  storageCard: { padding: Spacing.md },
  storageRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  storageVal: { fontSize: FontSize.sm, color: Colors.text2, fontWeight: '500' },
  progressBg: {
    height: 6, backgroundColor: Colors.surface3, borderRadius: 3, marginBottom: 6,
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  storageDocs: { fontSize: FontSize.sm, color: Colors.text3 },
});
