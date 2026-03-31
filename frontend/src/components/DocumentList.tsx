import { useState } from 'react';
import { documentsApi } from '../api';
import type { BidDocument, DocumentCategory } from '../types';

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  plans:    'bg-blue-100 text-blue-800',
  specs:    'bg-purple-100 text-purple-800',
  scope:    'bg-green-100 text-green-800',
  addendum: 'bg-orange-100 text-orange-800',
  other:    'bg-gray-100 text-gray-600',
};

const CATEGORIES: DocumentCategory[] = ['plans', 'specs', 'scope', 'addendum', 'other'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('zip')) return '🗜️';
  return '📎';
}

interface Props {
  bidId: string;
  documents: BidDocument[];
  onDocumentDeleted: (docId: string) => void;
  onCategoryChanged: (doc: BidDocument) => void;
}

export default function DocumentList({ bidId, documents, onDocumentDeleted, onCategoryChanged }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const docs = documents.filter(d => d.category === cat);
    if (docs.length > 0) acc[cat] = docs;
    return acc;
  }, {} as Record<DocumentCategory, BidDocument[]>);

  const handleDelete = async (doc: BidDocument) => {
    if (!confirm(`Delete "${doc.original_name}"?`)) return;
    setDeletingId(doc.id);
    try {
      await documentsApi.delete(bidId, doc.id);
      onDocumentDeleted(doc.id);
    } catch {
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCategoryChange = async (doc: BidDocument, newCategory: DocumentCategory) => {
    setEditingCategoryId(doc.id);
    try {
      const updated = await documentsApi.updateCategory(bidId, doc.id, newCategory);
      onCategoryChanged(updated);
    } catch {
      alert('Failed to update category.');
    } finally {
      setEditingCategoryId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(Object.entries(grouped) as [DocumentCategory, BidDocument[]][]).map(([cat, docs]) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2 capitalize">{cat}</h3>
          <div className="divide-y border rounded-xl overflow-hidden bg-white">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                <span className="text-xl shrink-0">{fileIcon(doc.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.original_name}</p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(doc.file_size)} · {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Category selector */}
                <select
                  value={doc.category}
                  disabled={editingCategoryId === doc.id}
                  onChange={e => handleCategoryChange(doc, e.target.value as DocumentCategory)}
                  className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${CATEGORY_COLORS[doc.category]}`}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-white text-gray-800 font-normal">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>

                <a
                  href={documentsApi.downloadUrl(bidId, doc.id)}
                  download={doc.original_name}
                  className="text-gray-400 hover:text-blue-600 transition-colors shrink-0"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>

                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.id}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
