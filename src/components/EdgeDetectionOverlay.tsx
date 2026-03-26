import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, Dimensions, Animated,
  Text,
} from 'react-native';
import { Colors } from '../utils/theme';
import { DocumentCorners, isDocumentStable } from '../utils/imageProcessing';

const { width, height } = Dimensions.get('window');

interface EdgeDetectionOverlayProps {
  corners: DocumentCorners;
  isStable: boolean;
  opacity?: Animated.Value;
}

export const EdgeDetectionOverlay: React.FC<EdgeDetectionOverlayProps> = ({
  corners,
  isStable,
  opacity = new Animated.Value(1),
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for stable state
  useEffect(() => {
    if (isStable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isStable]);

  const cornerColor = isStable ? Colors.accent : Colors.warning;
  const cornerSize = pulseAnim.interpolate({
    inputRange: [1, 1.1],
    outputRange: [8, 12],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Quadrilateral outline using SVG paths would be ideal, but using 4 lines instead */}
      <View
        style={[
          styles.line,
          {
            position: 'absolute',
            left: corners.topLeft.x,
            top: corners.topLeft.y,
            width: corners.topRight.x - corners.topLeft.x,
            height: 2,
            backgroundColor: cornerColor,
            opacity: isStable ? 1 : 0.7,
            borderBottomWidth: isStable ? 3 : 2,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            position: 'absolute',
            left: corners.topRight.x,
            top: corners.topRight.y,
            width: 2,
            height: corners.bottomRight.y - corners.topRight.y,
            backgroundColor: cornerColor,
            opacity: isStable ? 1 : 0.7,
            borderRightWidth: isStable ? 3 : 2,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            position: 'absolute',
            left: corners.bottomLeft.x,
            top: corners.bottomRight.y,
            width: corners.bottomRight.x - corners.bottomLeft.x,
            height: 2,
            backgroundColor: cornerColor,
            opacity: isStable ? 1 : 0.7,
            borderTopWidth: isStable ? 3 : 2,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            position: 'absolute',
            left: corners.bottomLeft.x,
            top: corners.bottomLeft.y,
            width: 2,
            height: corners.bottomLeft.y - corners.topLeft.y,
            backgroundColor: cornerColor,
            opacity: isStable ? 1 : 0.7,
            borderLeftWidth: isStable ? 3 : 2,
          },
        ]}
      />

      {/* Corner circles */}
      {[corners.topLeft, corners.topRight, corners.bottomLeft, corners.bottomRight].map((corner, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.cornerCircle,
            {
              left: corner.x - 8,
              top: corner.y - 8,
              borderColor: cornerColor,
              borderWidth: isStable ? 3 : 2,
              width: cornerSize,
              height: cornerSize,
            },
          ]}
        />
      ))}

      {/* Stability indicator */}
      <View style={styles.indicator}>
        <View
          style={[
            styles.indicatorDot,
            { backgroundColor: isStable ? Colors.accent : Colors.warning },
          ]}
        />
        <Text
          style={[
            styles.indicatorText,
            { color: isStable ? Colors.accent : Colors.warning },
          ]}
        >
          {isStable ? '✓ Pronto para capturar' : '⊘ Mova para enquadramento'}
        </Text>
      </View>

      {/* Corner hints */}
      {!isStable && (
        <>
          <View style={[styles.cornerLabel, { left: corners.topLeft.x + 20, top: corners.topLeft.y + 20 }]}>
            <Text style={styles.indicatorBadgeText}>↖</Text>
          </View>
          <View style={[styles.cornerLabel, { right: width - corners.topRight.x + 20, top: corners.topRight.y + 20 }]}>
            <Text style={styles.indicatorBadgeText}>↗</Text>
          </View>
          <View style={[styles.cornerLabel, { left: corners.bottomLeft.x + 20, bottom: height - corners.bottomLeft.y + 20 }]}>
            <Text style={styles.indicatorBadgeText}>↙</Text>
          </View>
          <View style={[styles.cornerLabel, { right: width - corners.bottomRight.x + 20, bottom: height - corners.bottomRight.y + 20 }]}>
            <Text style={styles.indicatorBadgeText}>↘</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },

  line: {
    position: 'absolute',
  },

  indicator: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: '600',
  },

  cornerLabel: {
    position: 'absolute',
  },
  indicatorBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  cornerCircle: {
    position: 'absolute',
    borderRadius: 8,
  },
});
