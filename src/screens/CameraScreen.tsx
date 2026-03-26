import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Dimensions, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';
import { Colors, Spacing, Radius } from '../utils/theme';
import { useAppStore } from '../utils/store';
import {
  detectDocumentEdges,
  isDocumentStable,
  DocumentCorners,
} from '../utils/imageProcessing';
import { EdgeDetectionOverlay } from '../components/EdgeDetectionOverlay';

const { width, height } = Dimensions.get('window');

const TOP_BAR_H = 80;
const BOTTOM_BAR_H = 130;
const FRAME_W = width * 0.78;
const FRAME_H = FRAME_W * 1.35;

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { scanPages, clearScanPages } = useAppStore();

  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [detectedCorners, setDetectedCorners] = useState<DocumentCorners>({
    topLeft: { x: FRAME_W * 0.1, y: FRAME_H * 0.1 },
    topRight: { x: FRAME_W * 0.9, y: FRAME_H * 0.1 },
    bottomLeft: { x: FRAME_W * 0.1, y: FRAME_H * 0.9 },
    bottomRight: { x: FRAME_W * 0.9, y: FRAME_H * 0.9 },
  });
  const [isStable, setIsStable] = useState(false);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Continuous edge detection loop
  useEffect(() => {
    detectionInterval.current = setInterval(async () => {
      if (!cameraRef.current) return;
      try {
        const corners = await detectDocumentEdges('', FRAME_W, FRAME_H);
        if (corners) {
          setDetectedCorners(corners);
          const stable = isDocumentStable(corners);
          setIsStable(stable);
        }
      } catch (error) {
        // Edge detection fallback
      }
    }, 500);

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  async function capture() {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.95,
        base64: false,
      });

      if (!photo) {
        throw new Error('Photo is null');
      }

      const resized = await ImageManipulator.manipulateAsync(photo.uri, [
        { resize: { width: 1240 } },
      ]);

      // Navigate to crop adjustment
      navigation.navigate('CropAdjustment', {
        imageUri: resized.uri,
        initialCorners: detectedCorners,
      });
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
      setIsCapturing(false);
    }
  }

  function handleDone() {
    if (scanPages.length === 0) {
      Alert.alert(
        'Atenção',
        'Capture pelo menos uma página antes de continuar.'
      );
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
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              clearScanPages();
              navigation.goBack();
            },
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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flashMode}
      />

      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} />

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

      <View
        style={[
          styles.frameContainer,
          { top: TOP_BAR_H, bottom: BOTTOM_BAR_H },
        ]}
        pointerEvents="none"
      >
        <EdgeDetectionOverlay
          corners={{
            topLeft: {
              x: detectedCorners.topLeft.x + (width - FRAME_W) / 2,
              y: detectedCorners.topLeft.y + TOP_BAR_H,
            },
            topRight: {
              x: detectedCorners.topRight.x + (width - FRAME_W) / 2,
              y: detectedCorners.topRight.y + TOP_BAR_H,
            },
            bottomLeft: {
              x: detectedCorners.bottomLeft.x + (width - FRAME_W) / 2,
              y: detectedCorners.bottomLeft.y + TOP_BAR_H,
            },
            bottomRight: {
              x: detectedCorners.bottomRight.x + (width - FRAME_W) / 2,
              y: detectedCorners.bottomRight.y + TOP_BAR_H,
            },
          }}
          isStable={isStable}
        />
      </View>

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

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() =>
            Alert.alert(
              'Modo',
              'Selecione o modo de captura:\n• Automático\n• Documento\n• Foto'
            )
          }
        >
          <Text style={styles.toolBtnText}>🎨</Text>
          <Text style={styles.toolBtnLabel}>Modo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shutter, isCapturing && styles.shutterActive]}
          onPress={capture}
          disabled={isCapturing}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={handleDone}>
          <Text style={styles.toolBtnText}>✅</Text>
          <Text style={styles.toolBtnLabel}>Pronto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    zIndex: 20,
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
