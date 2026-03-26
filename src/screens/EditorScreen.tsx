import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions, Image, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import { useAppStore } from '../utils/store';
import { generateId } from '../utils/helpers';
import { useDocumentProcessor, FilterMode } from '../hooks/useDocumentProcessor';
import { usePDFExport } from '../hooks/usePDFExport';
import { useOCR } from '../hooks/useOCR';
import ProgressBar from '../components/ProgressBar';
import OCRResultModal from '../components/OCRResultModal';
import Toast from '../components/Toast';

const { width } = Dimensions.get('window');
const PREVIEW_W = width - 80;
const PREVIEW_H = PREVIEW_W * 1.35;

const FILTERS: { id: FilterMode; label: string; icon: string }[] = [
  { id: 'original', label: 'Original', icon: '🖼️' },
  { id: 'auto',     label: 'Auto',     icon: '✨' },
  { id: 'bw',       label: 'P&B',      icon: '⬛' },
  { id: 'enhanced', label: 'Aprimorado', icon: '🌟' },
];

export default function EditorScreen() {
  const navigation = useNavigation<any>();
  const { scanPages, currentDoc, addDocument, updateScanPage, clearScanPages } = useAppStore();
  const { processImage, rotateImage, isProcessing: isImgProc } = useDocumentProcessor();
  const { exportToPDF, sharePDF, shareImage, isExporting, progress } = usePDFExport();
  const { extractText, isProcessing: isOCRProc, result: ocrResult, clearResult } = useOCR();

  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterMode>('auto');
  const [showExport, setShowExport]   = useState(false);
  const [showOCR, setShowOCR]         = useState(false);
  const [toast, setToast]             = useState({ visible: false, message: '', type: 'default' as 'default'|'success'|'error' });
  const docName = `Documento ${new Date().toLocaleDateString('pt-BR')}`;

  const pages       = scanPages.length > 0 ? scanPages : (currentDoc?.pages ?? []);
  const currentPage = pages[currentIdx];
  const isLoading   = isImgProc || isExporting || isOCRProc;

  function showToast(msg: string, type: 'default'|'success'|'error' = 'default') {
    setToast({ visible: true, message: msg, type });
  }

  async function handleFilter(f: FilterMode) {
    if (!currentPage) return;
    setSelectedFilter(f);
    Haptics.selectionAsync();
    const r = await processImage(currentPage.uri, f);
    if (r) { updateScanPage(currentPage.id, { filter: f, uri: r.uri }); showToast('Filtro aplicado', 'success'); }
  }

  async function handleRotate() {
    if (!currentPage) return;
    const uri = await rotateImage(currentPage.uri, 90);
    if (uri) { updateScanPage(currentPage.id, { uri }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); showToast('Página girada'); }
  }

  async function handleOCR() {
    if (!currentPage) return;
    setShowExport(false);
    const r = await extractText(currentPage.uri);
    if (r) setShowOCR(true);
    else showToast('Nenhum texto encontrado', 'error');
  }

  async function handleExportPDF() {
    setShowExport(false);
    const uri = await exportToPDF(pages, { name: docName.replace(/\s+/g,'_'), addPageNumbers: true });
    if (uri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('PDF gerado!', 'success');
      addDocument({ id: generateId(), name: docName, pages: [...pages], createdAt: Date.now(), updatedAt: Date.now(), size: pages.length * 500000, pageCount: pages.length, pdfUri: uri });
      clearScanPages();
      await sharePDF(uri);
      navigation.navigate('Home');
    } else { showToast('Erro ao gerar PDF', 'error'); }
  }

  async function handleShareImage() {
    if (!currentPage) return;
    setShowExport(false);
    await shareImage(currentPage.uri);
  }

  function handleSave() {
    if (pages.length === 0) { navigation.goBack(); return; }
    addDocument({ id: generateId(), name: docName, pages: [...pages], createdAt: Date.now(), updatedAt: Date.now(), size: pages.length * 500000, pageCount: pages.length });
    clearScanPages();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title} numberOfLines={1}>{docName}</Text>
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      {isExporting && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
          <ProgressBar progress={progress} label="Gerando PDF..." />
        </View>
      )}

      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.id} style={[s.chip, selectedFilter === f.id && s.chipActive]} onPress={() => handleFilter(f.id)}>
            <Text style={{ fontSize: 13 }}>{f.icon}</Text>
            <Text style={[s.chipText, selectedFilter === f.id && s.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        {[
          { icon:'↻', label:'Girar', action: handleRotate },
          { icon:'🔤', label:'OCR', action: handleOCR },
          { icon:'✂', label:'Recortar', action: () => Alert.alert('Recortar','Em breve!') },
          { icon:'🔏', label:'Marca', action: () => Alert.alert("Marca d'água",'Em breve!') },
        ].map(t => (
          <TouchableOpacity key={t.label} style={s.chip} onPress={t.action}>
            <Text style={{ fontSize: 13 }}>{t.icon}</Text>
            <Text style={s.chipText}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Preview */}
      <View style={s.preview}>
        {currentPage ? (
          <Image source={{ uri: currentPage.uri }} style={s.previewImg} resizeMode="contain" />
        ) : (
          <View style={s.emptyPreview}>
            <Text style={{ fontSize: 48 }}>📄</Text>
            <Text style={s.emptyText}>Nenhuma página capturada</Text>
            <TouchableOpacity style={s.addPageBtn} onPress={() => navigation.navigate('Camera')}>
              <Text style={s.addPageBtnText}>+ Escanear agora</Text>
            </TouchableOpacity>
          </View>
        )}
        {pages.length > 1 && (
          <View style={s.pageIndicator}>
            <Text style={s.pageIndicatorText}>{currentIdx + 1} / {pages.length}</Text>
          </View>
        )}
      </View>

      {/* Thumbnails */}
      {pages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems:'center' }}>
          {pages.map((p, i) => (
            <TouchableOpacity key={p.id} onPress={() => setCurrentIdx(i)} style={[s.thumb, i === currentIdx && s.thumbActive]}>
              <Image source={{ uri: p.uri }} style={s.thumbImg} />
              <Text style={s.thumbNum}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.addThumb} onPress={() => navigation.navigate('Camera')}>
            <Text style={{ fontSize: 22, color: Colors.accent }}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        {[
          { icon:'◀', label:'Anterior', action:() => setCurrentIdx(Math.max(0, currentIdx-1)), disabled: currentIdx===0 },
          { icon:'➕', label:'Adicionar', action:() => navigation.navigate('Camera'), disabled: false },
          { icon:'⬆', label:'Exportar', action:() => setShowExport(true), disabled: false, accent: true },
          { icon:'▶', label:'Próxima', action:() => setCurrentIdx(Math.min(pages.length-1, currentIdx+1)), disabled: currentIdx>=pages.length-1 },
        ].map(b => (
          <TouchableOpacity key={b.label} style={s.bottomBtn} onPress={b.action} disabled={b.disabled}>
            <Text style={[s.bottomBtnIcon, b.disabled && { opacity:0.3 }]}>{b.icon}</Text>
            <Text style={[s.bottomBtnLabel, b.accent && { color: Colors.accent2 }]}>{b.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Export Modal */}
      <Modal visible={showExport} transparent animationType="slide" onRequestClose={() => setShowExport(false)}>
        <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setShowExport(false)}>
          <View style={s.sheet} onStartShouldSetResponder={() => true}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Exportar como</Text>
            {[
              { icon:'📕', label:'PDF', desc:`${pages.length} pág • Pronto para impressão`, action: handleExportPDF },
              { icon:'🖼️', label:'Imagem JPG', desc:'Compartilhar página atual', action: handleShareImage },
              { icon:'🔤', label:'Texto (OCR)', desc:'Extrair texto do documento', action: handleOCR },
            ].map(o => (
              <TouchableOpacity key={o.label} style={s.exportOpt} onPress={o.action}>
                <Text style={{ fontSize: 26 }}>{o.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.exportLabel}>{o.label}</Text>
                  <Text style={s.exportDesc}>{o.desc}</Text>
                </View>
                <Text style={{ color: Colors.text3, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <OCRResultModal visible={showOCR} result={ocrResult} onClose={() => { setShowOCR(false); clearResult(); }} />

      {isLoading && !isExporting && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={s.loadingText}>{isOCRProc ? 'Extraindo texto...' : 'Processando...'}</Text>
        </View>
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(t => ({ ...t, visible: false }))} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding: Spacing.md, gap: Spacing.md, borderBottomWidth:1, borderBottomColor: Colors.surface3 },
  backBtn: { width:36, height:36, borderRadius:10, backgroundColor: Colors.surface, borderWidth:1, borderColor: Colors.border, alignItems:'center', justifyContent:'center' },
  backBtnText: { fontSize:18, color: Colors.text },
  title: { flex:1, fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  saveBtn: { backgroundColor: Colors.accent, borderRadius:10, paddingHorizontal:16, paddingVertical:8 },
  saveBtnText: { fontSize:13, fontWeight: FontWeight.bold, color:'#fff' },
  filterScroll: { maxHeight:52, flexGrow:0 },
  filterContent: { paddingHorizontal:16, paddingVertical:8, gap:8, borderBottomWidth:1, borderBottomColor: Colors.surface3 },
  chip: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:14, paddingVertical:7, backgroundColor: Colors.surface, borderWidth:1, borderColor: Colors.border, borderRadius:20 },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize:13, fontWeight:'500', color: Colors.text },
  chipTextActive: { color:'#fff' },
  preview: { flex:1, backgroundColor: Colors.surface, alignItems:'center', justifyContent:'center', position:'relative' },
  previewImg: { width: PREVIEW_W, height: PREVIEW_H, borderRadius:8 },
  emptyPreview: { alignItems:'center', gap:12 },
  emptyText: { fontSize:16, color: Colors.text3 },
  addPageBtn: { marginTop:8, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal:20, paddingVertical:10 },
  addPageBtnText: { color:'#fff', fontWeight:'700', fontSize: FontSize.md },
  pageIndicator: { position:'absolute', bottom:12, right:16, backgroundColor:'rgba(0,0,0,0.5)', borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
  pageIndicatorText: { fontSize:12, color:'#fff', fontWeight:'600' },
  thumbRow: { maxHeight:80, flexGrow:0, paddingVertical:10 },
  thumb: { width:44, height:56, borderRadius:6, overflow:'hidden', borderWidth:2, borderColor:'transparent' },
  thumbActive: { borderColor: Colors.accent2 },
  thumbImg: { width:'100%', height:'100%' },
  thumbNum: { position:'absolute', bottom:2, right:2, fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.9)' },
  addThumb: { width:44, height:56, borderRadius:6, backgroundColor:'rgba(108,99,255,0.1)', borderWidth:1.5, borderColor: Colors.accent, borderStyle:'dashed', alignItems:'center', justifyContent:'center' },
  bottomBar: { flexDirection:'row', alignItems:'center', paddingVertical:14, borderTopWidth:1, borderTopColor: Colors.surface3, backgroundColor: Colors.bg },
  bottomBtn: { flex:1, alignItems:'center', gap:4 },
  bottomBtnIcon: { fontSize:20, color: Colors.text2 },
  bottomBtnLabel: { fontSize:11, fontWeight:'500', color: Colors.text2 },
  modalBg: { flex:1, backgroundColor:'rgba(0,0,0,0.65)', justifyContent:'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderRadius:24, paddingBottom:32 },
  sheetHandle: { width:36, height:4, backgroundColor: Colors.surface3, borderRadius:2, alignSelf:'center', marginTop:8, marginBottom:16 },
  sheetTitle: { fontSize:18, fontWeight: FontWeight.bold, color: Colors.text, paddingHorizontal: Spacing.xxl, marginBottom:12 },
  exportOpt: { flexDirection:'row', alignItems:'center', gap:14, marginHorizontal:16, padding:16, backgroundColor: Colors.surface2, borderRadius:12, marginBottom:8 },
  exportLabel: { fontSize:15, fontWeight:'600', color: Colors.text },
  exportDesc: { fontSize:12, color: Colors.text2, marginTop:2 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(10,10,15,0.88)', alignItems:'center', justifyContent:'center', gap:16, zIndex:50 },
  loadingText: { fontSize:15, fontWeight:'600', color: Colors.text2 },
});
