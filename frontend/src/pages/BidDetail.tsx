import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bidsApi } from '../api';
import type { BidDocument, BidWithDocuments, BidStatus } from '../types';
import DocumentDropzone from '../components/DocumentDropzone';
import DocumentList from '../components/DocumentList';
import StatusBadge from '../components/StatusBadge';

const STATUSES: BidStatus[] = ['pending', 'in_review', 'submitted', 'awarded', 'lost', 'no_bid'];

export default function BidDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bid, setBid] = useState<BidWithDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;
    bidsApi.get(id)
      .then(setBid)
      .catch(() => setError('Bid not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUploaded = (docs: BidDocument[]) => {
    setBid(prev => prev ? { ...prev, documents: [...docs, ...prev.documents] } : prev);
  };

  const handleDocumentDeleted = (docId: string) => {
    setBid(prev => prev ? { ...prev, documents: prev.documents.filter(d => d.id !== docId) } : prev);
  };

  const handleCategoryChanged = (updated: BidDocument) => {
    setBid(prev => prev ? {
      ...prev,
      documents: prev.documents.map(d => d.id === updated.id ? updated : d),
    } : prev);
  };

  const handleStatusChange = async (status: BidStatus) => {
    if (!bid) return;
    setUpdatingStatus(true);
    try {
      const updated = await bidsApi.update(bid.id, { status });
      setBid(prev => prev ? { ...prev, status: updated.status } : prev);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!bid) return;
    if (!confirm(`Delete bid invite "${bid.project_name}"? This will remove all uploaded documents.`)) return;
    await bidsApi.delete(bid.id);
    navigate('/');
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (error || !bid) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">{error || 'Bid not found'}</p>
      <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to dashboard</Link>
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Bids</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{bid.project_name}</span>
      </div>

      {/* Project header */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{bid.project_name}</h1>
              <StatusBadge status={bid.status} />
            </div>
            <p className="text-gray-600 font-medium">{bid.general_contractor}</p>
            {bid.project_address && (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {bid.project_address}
              </p>
            )}
            {bid.bid_due_date && (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Bid due: {new Date(bid.bid_due_date).toLocaleString()}
              </p>
            )}
            {bid.notes && (
              <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">{bid.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Status changer */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={bid.status}
                disabled={updatingStatus}
                onChange={e => handleStatusChange(e.target.value as BidStatus)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDelete}
              className="mt-5 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Delete bid"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Upload panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Documents
            </h2>
            <DocumentDropzone bidId={bid.id} onUploaded={handleUploaded} />
          </div>
        </div>

        {/* Document list */}
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Project Documents
              </span>
              <span className="text-sm font-normal text-gray-400">
                {bid.documents.length} file{bid.documents.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <DocumentList
              bidId={bid.id}
              documents={bid.documents}
              onDocumentDeleted={handleDocumentDeleted}
              onCategoryChanged={handleCategoryChanged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
