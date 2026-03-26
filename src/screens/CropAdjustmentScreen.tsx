import React, { useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, Animated, PanResponder, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../utils/theme';
import {
  DocumentCorners,
  applyPerspectiveTransform,
  applyMagicColorFilter,
  distance,
  isPointNear,
} from '../utils/imageProcessing';
import { useAppStore, ScannedPage } from '../utils/store';
import { generateId } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

const MAGNIFIER_SIZE = 100;
const CORNER_RADIUS = 12;

interface CropAdjustmentScreenProps {
  route?: {
    params?: {
      imageUri: string;
      initialCorners?: DocumentCorners;
    };
  };
}

export default function CropAdjustmentScreen({
  route,
}: CropAdjustmentScreenProps) {
  const navigation = useNavigation<any>();
  const { addScanPage } = useAppStore();

  const imageUri = route?.params?.imageUri || '';
  const [corners, setCorners] = useState<DocumentCorners>(
    route?.params?.initialCorners || {
      topLeft: { x: width * 0.1, y: 60 },
      topRight: { x: width * 0.9, y: 60 },
      bottomLeft: { x: width * 0.1, y: height - 150 },
      bottomRight: { x: width * 0.9, y: height - 150 },
    }
  );

  const [draggingCorner, setDraggingCorner] = useState<keyof DocumentCorners | null>(null);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const point = { x: locationX, y: locationY };

        // Check which corner is being touched
        const cornerKeys: (keyof DocumentCorners)[] = [
          'topLeft',
          'topRight',
          'bottomLeft',
          'bottomRight',
        ];

        for (const key of cornerKeys) {
          if (isPointNear(point, corners[key], 50)) {
            setDraggingCorner(key);
            Haptics.selectionAsync();
            return true;
          }
        }

        return false;
      },
      onMoveShouldSetPanResponder: () => !!draggingCorner,
      onPanResponderMove: (evt) => {
        if (!draggingCorner) return;

        const { locationX, locationY } = evt.nativeEvent;
        const newPoint = {
          x: Math.max(0, Math.min(width, locationX)),
          y: Math.max(0, Math.min(height, locationY)),
        };

        setCorners((prev) => ({
          ...prev,
          [draggingCorner]: newPoint,
        }));

        // Show magnifier while dragging
        setMagnifierPos(newPoint);
      },
      onPanResponderTerminate: () => {
        setDraggingCorner(null);
        setMagnifierPos(null);
      },
      onPanResponderRelease: () => {
        setDraggingCorner(null);
        setMagnifierPos(null);
      },
    })
  ).current;

  async function handleApply() {
    if (!imageUri) return;

    setIsProcessing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Apply perspective transform with user-adjusted corners
      const transformedUri = await applyPerspectiveTransform(imageUri, corners);

      // Apply magic color filter
      const enhancedUri = await applyMagicColorFilter(transformedUri);

      // Create scan page
      const page: ScannedPage = {
        id: generateId(),
        uri: enhancedUri,
        filter: 'auto',
        rotation: 0,
        createdAt: Date.now(),
      };

      addScanPage(page);

      // Navigate back to camera
      navigation.navigate('Camera');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Crop apply error:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem.');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDiscard() {
    Alert.alert(
      'Descartar imagem?',
      'Esta imagem será removida.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajustar Bordas</Text>
        <Text style={styles.headerDesc}>
          Arraste os cantos para o enquadramento correto
        </Text>
      </View>

      {/* Image with crop handles */}
      <View style={styles.imageContainer} {...panResponder.panHandlers}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        {/* Semi-transparent overlay outside quad */}
        <View style={styles.outerOverlay} />

        {/* Corner anchor points */}
        {Object.entries(corners).map(([key, corner]) => (
          <Animated.View
            key={`anchor-${key}`}
            style={[
              styles.cornerHandle,
              {
                left: corner.x - CORNER_RADIUS,
                top: corner.y - CORNER_RADIUS,
                backgroundColor: draggingCorner === key ? Colors.accent2 : Colors.accent,
              },
            ]}
          />
        ))}
      </View>

      {/* Magnifier zoom when dragging */}
      {magnifierPos && draggingCorner && (
        <View
          style={[
            styles.magnifier,
            {
              left: Math.min(width - MAGNIFIER_SIZE - 8, magnifierPos.x + 20),
              top: Math.max(100, magnifierPos.y - MAGNIFIER_SIZE - 20),
            },
          ]}
        >
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.magnifierImage,
              {
                width: width * 3,
                height: height * 3,
                marginLeft: -magnifierPos.x * 3 + MAGNIFIER_SIZE / 2,
                marginTop: -magnifierPos.y * 3 + MAGNIFIER_SIZE / 2,
              },
            ]}
          />
          <View style={styles.magnifierCrosshair} />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={handleDiscard}
          disabled={isProcessing}
        >
          <Text style={styles.btnTextSecondary}>Descartar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleApply}
          disabled={isProcessing}
        >
          <Text style={styles.btnText}>
            {isProcessing ? 'Processando...' : 'Aplicar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: FontSize.sm,
    color: Colors.text2,
  },

  imageContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  outerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  cornerHandle: {
    position: 'absolute',
    width: CORNER_RADIUS * 2,
    height: CORNER_RADIUS * 2,
    borderRadius: CORNER_RADIUS,
    borderWidth: 2,
    borderColor: Colors.white,
  },

  magnifier: {
    position: 'absolute',
    width: MAGNIFIER_SIZE,
    height: MAGNIFIER_SIZE,
    borderRadius: MAGNIFIER_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.accent2,
    overflow: 'hidden',
    backgroundColor: Colors.bg,
    zIndex: 100,
  },
  magnifierImage: {
    position: 'absolute',
  },
  magnifierCrosshair: {
    position: 'absolute',
    width: 1,
    height: 20,
    backgroundColor: Colors.accent2,
    top: MAGNIFIER_SIZE / 2 - 10,
    left: MAGNIFIER_SIZE / 2,
  },

  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
  },
  btnSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  btnTextSecondary: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
