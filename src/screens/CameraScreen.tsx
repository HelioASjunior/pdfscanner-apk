import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Dimensions, Animated, Easing,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAppStore, ScannedPage } from '../utils/store';
import { generateId } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { scanPages, addScanPage, clearScanPages } = useAppStore();
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Scan line animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1, duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0, duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  async function capture() {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Flash effect
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, base64: false });
      if (!photo) return;

      // Auto-enhance for document scanning
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1240 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      const page: ScannedPage = {
        id: generateId(),
        uri: manipulated.uri,
        filter: 'auto',
        rotation: 0,
        createdAt: Date.now(),
      };

      addScanPage(page);
      setSelectedPage(scanPages.length);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    } finally {
      setIsCapturing(false);
    }
  }

  function handleDone() {
    if (scanPages.length === 0) {
      Alert.alert('Atenção', 'Capture pelo menos uma página antes de continuar.');
      return;
    }
    navigation.navigate('Editor');
  }

  function handleClose() {
    if (scanPages.length > 0) {
      Alert.alert(
        'Descartar páginas?',
        'Você tem páginas capturadas. Deseja descartar?',
        [
          { text: 'Continuar escaneando', style: 'cancel' },
          {
            text: 'Descartar', style: 'destructive',
            onPress: () => { clearScanPages(); navigation.goBack(); }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }

  function toggleFlash() {
    const modes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];
    const next = modes[(modes.indexOf(flashMode) + 1) % modes.length];
    setFlashMode(next);
    Haptics.selectionAsync();
  }

  const flashIcons = { off: '⚡', on: '⚡', auto: '⚡' };
  const flashLabels = { off: 'Desligado', on: 'Ligado', auto: 'Auto' };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Permissão de câmera</Text>
        <Text style={styles.permText}>
          ScanPDF precisa da câmera para digitalizar documentos.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir acesso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashMode}
      />

      {/* Flash overlay */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleClose}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.pageCountBadge}>
          <Text style={styles.pageCountText}>
            {scanPages.length} página{scanPages.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, flashMode !== 'off' && { backgroundColor: Colors.warning }]}
          onPress={toggleFlash}
        >
          <Text style={styles.iconBtnText}>⚡</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Scan frame overlay */}
      <View style={styles.frameContainer} pointerEvents="none">
        <View style={styles.scanFrame}>
          {/* Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Animated scan line */}
          <Animated.View style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslate }] }
          ]} />
        </View>
        <Text style={styles.frameHint}>Posicione o documento dentro do quadro</Text>
      </View>

      {/* Thumbnail strip */}
      {scanPages.length > 0 && (
        <View style={styles.thumbStrip}>
          {scanPages.map((page, idx) => (
            <TouchableOpacity
              key={page.id}
              style={[styles.thumb, selectedPage === idx && styles.thumbSelected]}
              onPress={() => setSelectedPage(idx)}
            >
              <Image source={{ uri: page.uri }} style={styles.thumbImg} />
              <Text style={styles.thumbNum}>{idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom toolbar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => Alert.alert('Modo', 'Selecione o modo de captura:\n• Auto\n• Documento\n• Foto')}
        >
          <Text style={styles.toolBtnText}>🎨</Text>
          <Text style={styles.toolBtnLabel}>Modo</Text>
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity
          style={[styles.shutter, isCapturing && styles.shutterActive]}
          onPress={capture}
          disabled={isCapturing}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={handleDone}
        >
          <Text style={styles.toolBtnText}>✅</Text>
          <Text style={styles.toolBtnLabel}>Pronto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FRAME_W = width * 0.78;
const FRAME_H = FRAME_W * 1.35;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  permContainer: {
    flex: 1, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  permIcon: { fontSize: 64, marginBottom: 20 },
  permTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  permText: { fontSize: 15, color: Colors.text2, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  permBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  flashOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 10,
  },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: '#fff' },
  pageCountBadge: {
    backgroundColor: Colors.accent, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  pageCountText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  frameContainer: {
    position: 'absolute', inset: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  scanFrame: {
    width: FRAME_W, height: FRAME_H,
    position: 'relative', overflow: 'hidden',
  },
  corner: {
    position: 'absolute', width: 28, height: 28,
    borderColor: Colors.accent2, borderStyle: 'solid',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: Colors.accent2,
    shadowColor: Colors.accent2, shadowOpacity: 0.8, shadowRadius: 4,
  },
  frameHint: {
    marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center',
  },

  thumbStrip: {
    position: 'absolute', bottom: 110, left: 0, right: 0,
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  thumb: {
    width: 44, height: 56, borderRadius: 6,
    backgroundColor: '#333', overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent',
  },
  thumbSelected: { borderColor: Colors.accent2 },
  thumbImg: { width: '100%', height: '100%' },
  thumbNum: {
    position: 'absolute', bottom: 2, right: 3,
    fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)',
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingVertical: 24,
    paddingBottom: 36, backgroundColor: 'rgba(0,0,0,0.7)',
  },
  toolBtn: { alignItems: 'center', gap: 4, width: 60 },
  toolBtnText: { fontSize: 24 },
  toolBtnLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  shutter: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  shutterActive: { opacity: 0.7, transform: [{ scale: 0.95 }] },
  shutterInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddd',
  },
});
