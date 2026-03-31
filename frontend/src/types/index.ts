export type BidStatus = 'pending' | 'in_review' | 'submitted' | 'awarded' | 'lost' | 'no_bid';

export type DocumentCategory = 'plans' | 'specs' | 'scope' | 'addendum' | 'other';

export interface Bid {
  id: string;
  project_name: string;
  general_contractor: string;
  project_address: string | null;
  bid_due_date: string | null;
  status: BidStatus;
  notes: string | null;
  created_at: string;
  document_count?: number;
}

export interface BidDocument {
  id: string;
  bid_id: string;
  original_name: string;
  stored_name: string;
  file_size: number;
  mime_type: string;
  category: DocumentCategory;
  uploaded_at: string;
}

export interface BidWithDocuments extends Bid {
  documents: BidDocument[];
}
