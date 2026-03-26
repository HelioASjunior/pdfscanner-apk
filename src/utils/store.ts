import { create } from 'zustand';

export interface ScannedPage {
  id: string;
  uri: string;
  filter: 'auto' | 'bw' | 'enhanced' | 'original';
  rotation: number;
  createdAt: number;
}

export interface Document {
  id: string;
  name: string;
  pages: ScannedPage[];
  createdAt: number;
  updatedAt: number;
  size: number; // bytes
  pageCount: number;
  pdfUri?: string;
}

interface AppState {
  documents: Document[];
  currentDoc: Document | null;
  scanPages: ScannedPage[];

  // Actions
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setCurrentDoc: (doc: Document | null) => void;

  addScanPage: (page: ScannedPage) => void;
  removeScanPage: (id: string) => void;
  updateScanPage: (id: string, updates: Partial<ScannedPage>) => void;
  clearScanPages: () => void;
  reorderScanPages: (from: number, to: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  currentDoc: null,
  scanPages: [],

  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),

  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d
      ),
    })),

  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  setCurrentDoc: (doc) => set({ currentDoc: doc }),

  addScanPage: (page) =>
    set((state) => ({ scanPages: [...state.scanPages, page] })),

  removeScanPage: (id) =>
    set((state) => ({
      scanPages: state.scanPages.filter((p) => p.id !== id),
    })),

  updateScanPage: (id, updates) =>
    set((state) => ({
      scanPages: state.scanPages.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  clearScanPages: () => set({ scanPages: [] }),

  reorderScanPages: (from, to) =>
    set((state) => {
      const pages = [...state.scanPages];
      const [item] = pages.splice(from, 1);
      pages.splice(to, 0, item);
      return { scanPages: pages };
    }),
}));
