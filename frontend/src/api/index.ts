import axios from 'axios';
import type { Bid, BidDocument, BidWithDocuments, BidStatus, DocumentCategory } from '../types';

const api = axios.create({ baseURL: '/api' });

export const bidsApi = {
  list: () => api.get<Bid[]>('/bids').then(r => r.data),

  get: (id: string) => api.get<BidWithDocuments>(`/bids/${id}`).then(r => r.data),

  create: (data: {
    project_name: string;
    general_contractor: string;
    project_address?: string;
    bid_due_date?: string;
    notes?: string;
  }) => api.post<Bid>('/bids', data).then(r => r.data),

  update: (id: string, data: Partial<{ status: BidStatus; notes: string; bid_due_date: string }>) =>
    api.patch<Bid>(`/bids/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/bids/${id}`).then(r => r.data),
};

export const documentsApi = {
  list: (bidId: string) =>
    api.get<BidDocument[]>(`/bids/${bidId}/documents`).then(r => r.data),

  upload: (bidId: string, files: File[], category: DocumentCategory, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    form.append('category', category);
    return api.post<BidDocument[]>(`/bids/${bidId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    }).then(r => r.data);
  },

  updateCategory: (bidId: string, docId: string, category: DocumentCategory) =>
    api.patch<BidDocument>(`/bids/${bidId}/documents/${docId}`, { category }).then(r => r.data),

  delete: (bidId: string, docId: string) =>
    api.delete(`/bids/${bidId}/documents/${docId}`).then(r => r.data),

  downloadUrl: (bidId: string, docId: string) =>
    `/api/bids/${bidId}/documents/${docId}/download`,
};
