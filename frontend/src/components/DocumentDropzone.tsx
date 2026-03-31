import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { documentsApi } from '../api';
import type { BidDocument, DocumentCategory } from '../types';

const CATEGORIES: { value: DocumentCategory; label: string; color: string }[] = [
  { value: 'plans',    label: 'Plans',    color: 'bg-blue-600' },
  { value: 'specs',    label: 'Specs',    color: 'bg-purple-600' },
  { value: 'scope',    label: 'Scope',    color: 'bg-green-600' },
  { value: 'addendum', label: 'Addendum', color: 'bg-orange-500' },
  { value: 'other',    label: 'Other',    color: 'bg-gray-500' },
];

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tif', '.tiff'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/zip': ['.zip'],
};

interface UploadingFile {
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface Props {
  bidId: string;
  onUploaded: (docs: BidDocument[]) => void;
}

export default function DocumentDropzone({ bidId, onUploaded }: Props) {
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const entry: UploadingFile = {
      name: acceptedFiles.length === 1 ? acceptedFiles[0].name : `${acceptedFiles.length} files`,
      progress: 0,
      status: 'uploading',
    };
    setUploading(prev => [entry, ...prev]);

    try {
      const docs = await documentsApi.upload(bidId, acceptedFiles, category, pct => {
        setUploading(prev =>
          prev.map((u, i) => (i === 0 ? { ...u, progress: pct } : u))
        );
      });
      setUploading(prev =>
        prev.map((u, i) => (i === 0 ? { ...u, progress: 100, status: 'done' } : u))
      );
      onUploaded(docs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploading(prev =>
        prev.map((u, i) => (i === 0 ? { ...u, status: 'error', error: msg } : u))
      );
    }
  }, [bidId, category, onUploaded]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 250 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Document category for this upload:</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? `${cat.color} text-white shadow-sm`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <svg className={`w-7 h-7 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop files here…</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">Drag & drop project documents here</p>
              <p className="text-sm text-gray-400">or <span className="text-blue-600 underline">browse files</span></p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images, ZIP, CAD files · Up to 250 MB each</p>
            </>
          )}
        </div>
      </div>

      {/* Rejected files */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 space-y-1">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              <span className="font-medium">{file.name}</span>: {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.slice(0, 5).map((u, i) => (
            <div key={i} className="bg-gray-50 border rounded-lg px-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate max-w-xs">{u.name}</span>
                <span className={`text-xs font-medium ${
                  u.status === 'done' ? 'text-green-600' :
                  u.status === 'error' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {u.status === 'done' ? 'Done' : u.status === 'error' ? 'Error' : `${u.progress}%`}
                </span>
              </div>
              {u.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              {u.status === 'error' && (
                <p className="text-xs text-red-500">{u.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
