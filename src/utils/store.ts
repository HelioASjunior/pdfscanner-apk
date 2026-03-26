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
  documents: [
    {
      id: '1',
      name: 'Contrato de Trabalho',
      pages: [],
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
      size: 2457600,
      pageCount: 3,
    },
    {
      id: '2',
      name: 'Nota Fiscal Compra',
      pages: [],
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
      size: 876544,
      pageCount: 1,
    },
    {
      id: '3',
      name: 'Relatório Mensal',
      pages: [],
      createdAt: Date.now() - 950400000,
      updatedAt: Date.now() - 950400000,
      size: 5345280,
      pageCount: 8,
    },
    {
      id: '4',
      name: 'Anotações Reunião',
      pages: [],
      createdAt: Date.now() - 1382400000,
      updatedAt: Date.now() - 1382400000,
      size: 1258291,
      pageCount: 2,
    },
    {
      id: '5',
      name: 'Certidão de Nascimento',
      pages: [],
      createdAt: Date.now() - 2592000000,
      updatedAt: Date.now() - 2592000000,
      size: 430080,
      pageCount: 1,
    },
  ],
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
