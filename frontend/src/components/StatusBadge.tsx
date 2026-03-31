import type { BidStatus } from '../types';

const CONFIG: Record<BidStatus, { label: string; classes: string }> = {
  pending:    { label: 'Pending',    classes: 'bg-yellow-100 text-yellow-800' },
  in_review:  { label: 'In Review',  classes: 'bg-blue-100 text-blue-800' },
  submitted:  { label: 'Submitted',  classes: 'bg-indigo-100 text-indigo-800' },
  awarded:    { label: 'Awarded',    classes: 'bg-green-100 text-green-800' },
  lost:       { label: 'Lost',       classes: 'bg-red-100 text-red-800' },
  no_bid:     { label: 'No Bid',     classes: 'bg-gray-100 text-gray-600' },
};

export default function StatusBadge({ status }: { status: BidStatus }) {
  const { label, classes } = CONFIG[status] ?? CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
