import { useState } from 'react';
import * as FileSystem from 'expo-file-system';

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{ text: string; bbox: number[] }>;
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function extractText(imageUri: string): Promise<OCRResult | null> {
    setIsProcessing(true);
    setError(null);
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use Google Vision API (substitua pela sua chave)
      // Para usar: configure GOOGLE_VISION_API_KEY nas variáveis de ambiente
      const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_KEY ?? '';

      if (!API_KEY) {
        // Fallback: simulated OCR for demo
        const simulated: OCRResult = {
          text: 'Texto extraído do documento.\nLinha 2 do documento.\nData: 26/03/2026',
          confidence: 0.92,
          blocks: [{ text: 'Texto extraído do documento.', bbox: [0, 0, 100, 20] }],
        };
        setResult(simulated);
        return simulated;
      }

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: base64 },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            }],
          }),
        }
      );

      const data = await response.json();
      const annotation = data.responses?.[0]?.fullTextAnnotation;

      if (!annotation) throw new Error('Nenhum texto encontrado');

      const ocrResult: OCRResult = {
        text: annotation.text ?? '',
        confidence: annotation.pages?.[0]?.confidence ?? 0,
        blocks: (annotation.blocks ?? []).map((b: any) => ({
          text: b.paragraphs?.map((p: any) =>
            p.words?.map((w: any) =>
              w.symbols?.map((s: any) => s.text).join('')
            ).join(' ')
          ).join('\n') ?? '',
          bbox: b.boundingBox?.vertices?.map((v: any) => [v.x, v.y]).flat() ?? [],
        })),
      };

      setResult(ocrResult);
      return ocrResult;
    } catch (e: any) {
      setError(e.message ?? 'Erro ao processar OCR');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  return { extractText, isProcessing, result, error, clearResult: () => setResult(null) };
}
