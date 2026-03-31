import { useState } from 'react';
import { bidsApi } from '../api';
import type { Bid } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (bid: Bid) => void;
}

export default function BidInviteModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    project_name: '',
    general_contractor: '',
    project_address: '',
    bid_due_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_name.trim() || !form.general_contractor.trim()) {
      setError('Project name and general contractor are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const bid = await bidsApi.create({
        project_name: form.project_name.trim(),
        general_contractor: form.general_contractor.trim(),
        project_address: form.project_address.trim() || undefined,
        bid_due_date: form.bid_due_date || undefined,
        notes: form.notes.trim() || undefined,
      });
      onCreated(bid);
    } catch {
      setError('Failed to create bid invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">New Bid Invite</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.project_name}
              onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))}
              placeholder="e.g. Downtown Office Renovation"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General Contractor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.general_contractor}
              onChange={e => setForm(f => ({ ...f, general_contractor: e.target.value }))}
              placeholder="e.g. Turner Construction"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
            <input
              type="text"
              value={form.project_address}
              onChange={e => setForm(f => ({ ...f, project_address: e.target.value }))}
              placeholder="123 Main St, City, ST 12345"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bid Due Date</label>
            <input
              type="datetime-local"
              value={form.bid_due_date}
              onChange={e => setForm(f => ({ ...f, bid_due_date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional info from the GC invite…"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create Bid Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
