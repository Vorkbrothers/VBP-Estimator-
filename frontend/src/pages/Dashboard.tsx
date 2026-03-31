import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bidsApi } from '../api';
import type { Bid } from '../types';
import BidInviteModal from '../components/BidInviteModal';
import StatusBadge from '../components/StatusBadge';

function formatDueDate(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: 'No due date', urgent: false };
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return { label, urgent: diffDays >= 0 && diffDays <= 3 };
}

export default function Dashboard() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    bidsApi.list().then(data => {
      setBids(data);
      setLoading(false);
    });
  }, []);

  const handleCreated = (bid: Bid) => {
    setShowModal(false);
    navigate(`/bids/${bid.id}`);
  };

  const totalDocs = bids.reduce((s, b) => s + (b.document_count ?? 0), 0);
  const activeBids = bids.filter(b => !['lost', 'no_bid', 'awarded'].includes(b.status)).length;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bid Invites</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeBids} active · {bids.length} total · {totalDocs} documents
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Bid Invite
        </button>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">Loading bids…</div>
      )}

      {!loading && bids.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No bid invites yet</p>
          <p className="text-sm text-gray-400 mb-6">Create one when you receive an invite from a GC</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            Create First Bid Invite
          </button>
        </div>
      )}

      {!loading && bids.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bids.map(bid => {
            const due = formatDueDate(bid.bid_due_date);
            return (
              <button
                key={bid.id}
                onClick={() => navigate(`/bids/${bid.id}`)}
                className="text-left bg-white border rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {bid.project_name}
                  </h2>
                  <StatusBadge status={bid.status} />
                </div>

                <p className="text-sm text-gray-500 mb-3">{bid.general_contractor}</p>

                {bid.project_address && (
                  <p className="text-xs text-gray-400 mb-3 flex items-start gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {bid.project_address}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className={`text-xs font-medium flex items-center gap-1 ${due.urgent ? 'text-red-600' : 'text-gray-400'}`}>
                    {due.urgent && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                    {due.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {bid.document_count ?? 0} doc{bid.document_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showModal && (
        <BidInviteModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
