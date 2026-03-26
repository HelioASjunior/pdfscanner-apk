import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export type FilterMode = 'original' | 'auto' | 'bw' | 'enhanced';

interface ProcessResult {
  uri: string;
  width: number;
  height: number;
}

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(
    async (uri: string, filter: FilterMode): Promise<ProcessResult | null> => {
      setIsProcessing(true);
      try {
        const actions: ImageManipulator.Action[] = [];

        // Always resize to standardize
        actions.push({ resize: { width: 1240 } });

        if (filter === 'bw') {
          // Grayscale simulation: reduce saturation
          // expo-image-manipulator doesn't have grayscale natively,
          // so we use a workaround via canvas or keep as-is
          // For a real app, use react-native-skia or similar
        }

        const result = await ImageManipulator.manipulateAsync(
          uri,
          actions,
          {
            compress: filter === 'bw' ? 0.75 : 0.88,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        return { uri: result.uri, width: result.width, height: result.height };
      } catch {
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const rotateImage = useCallback(async (uri: string, degrees: 90 | 180 | 270): Promise<string | null> => {
    setIsProcessing(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: degrees }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch {
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const cropImage = useCallback(
    async (uri: string, x: number, y: number, w: number, h: number): Promise<string | null> => {
      setIsProcessing(true);
      try {
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ crop: { originX: x, originY: y, width: w, height: h } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        return result.uri;
      } catch {
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const deleteTemporaryFile = useCallback(async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {}
  }, []);

  return { processImage, rotateImage, cropImage, deleteTemporaryFile, isProcessing };
}
