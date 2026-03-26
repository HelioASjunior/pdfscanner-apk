import { useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ScannedPage } from '../utils/store';
import { generateId } from '../utils/helpers';

export interface ExportOptions {
  name?: string;
  pageSize?: 'A4' | 'Letter' | 'A3';
  quality?: 'low' | 'medium' | 'high';
  addPageNumbers?: boolean;
  addWatermark?: string;
}

const PAGE_SIZES = {
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 },
  A3: { width: 1123, height: 1587 },
};

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  async function exportToPDF(
    pages: ScannedPage[],
    options: ExportOptions = {}
  ): Promise<string | null> {
    if (pages.length === 0) return null;
    setIsExporting(true);
    setProgress(0);

    try {
      const {
        name = `Documento_${Date.now()}`,
        pageSize = 'A4',
        addPageNumbers = false,
        addWatermark,
      } = options;

      const size = PAGE_SIZES[pageSize];

      // Build images as base64 for embedding
      const imagePromises = pages.map(async (page, idx) => {
        setProgress(Math.round(((idx + 1) / pages.length) * 60));
        try {
          const b64 = await FileSystem.readAsStringAsync(page.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:image/jpeg;base64,${b64}`;
        } catch {
          return null;
        }
      });

      const images = await Promise.all(imagePromises);
      setProgress(70);

      const pagesHtml = pages.map((page, idx) => {
        const src = images[idx] ?? '';
        const isLast = idx === pages.length - 1;

        const watermarkHtml = addWatermark
          ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);
               font-size:48px;color:rgba(0,0,0,0.08);font-weight:bold;white-space:nowrap;pointer-events:none;">
               ${addWatermark}</div>`
          : '';

        const pageNumHtml = addPageNumbers
          ? `<div style="position:absolute;bottom:20px;width:100%;text-align:center;
               font-size:12px;color:#999;">${idx + 1} / ${pages.length}</div>`
          : '';

        return `
          <div style="
            width:${size.width}px; height:${size.height}px;
            position:relative; overflow:hidden;
            page-break-after:${isLast ? 'auto' : 'always'};
            background:#fff;
          ">
            <img src="${src}" style="
              width:100%; height:100%;
              object-fit:contain;
              display:block;
            " />
            ${watermarkHtml}
            ${pageNumHtml}
          </div>
        `;
      }).join('\n');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#fff; }
    @page { margin: 0; size: ${pageSize}; }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

      setProgress(80);

      const { uri: tempUri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      setProgress(90);

      const destDir = FileSystem.documentDirectory + 'ScanPDF/';
      const dirInfo = await FileSystem.getInfoAsync(destDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
      }

      const destUri = destDir + name.replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '.pdf';
      await FileSystem.moveAsync({ from: tempUri, to: destUri });

      setProgress(100);
      return destUri;
    } catch (e) {
      console.error('PDF export error:', e);
      return null;
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }

  async function sharePDF(uri: string) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar PDF',
        UTI: 'com.adobe.pdf',
      });
    }
  }

  async function shareImage(uri: string) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Compartilhar imagem',
      });
    }
  }

  return { exportToPDF, sharePDF, shareImage, isExporting, progress };
}
