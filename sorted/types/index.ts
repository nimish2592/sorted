export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type DocumentStatus = 'MISSING' | 'ATTACHED';
export type ReimbursementStatus =
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'PARTIALLY_REIMBURSED'
  | 'REIMBURSED';

export type Company = {
  company_id: string;
  name: string;
  legal_name: string;
  gstin: string;
  pan: string;
  created_at: string;
};

export type Person = {
  person_id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
};

export type Account = {
  account_id: string;
  name: string;
  account_type: 'BANK' | 'CREDIT_CARD' | 'UPI' | 'CASH';
  owner_type: 'COMPANY' | 'PERSON';
  owner_id: string;
  company_id: string;
};

export type Vendor = {
  vendor_id: string;
  name: string;
  gstin?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type Customer = {
  customer_id: string;
  name: string;
  gstin?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type Bill = {
  bill_id: string;
  company_id: string;
  vendor_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  document_status: DocumentStatus;
  drive_file_id?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
};

export type BillPayment = {
  payment_id: string;
  bill_id: string;
  payment_date: string;
  amount: number;
  account_id: string;
  reimbursement_status: ReimbursementStatus;
  reference?: string;
  notes?: string;
  created_at: string;
};

export type Invoice = {
  invoice_id: string;
  company_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  drive_file_id?: string;
  created_at: string;
  updated_at: string;
};

export type CompanyDocument = {
  document_id: string;
  company_id: string;
  document_type: string;
  name: string;
  issue_date?: string;
  expiry_date?: string;
  drive_file_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ActivityItem = {
  activity_id: string;
  title: string;
  detail?: string;
  occurred_at: string;
  kind: 'bill' | 'invoice' | 'document' | 'payment' | 'compliance';
};

export type ComplianceItem = {
  compliance_id: string;
  name: string;
  due_date: string;
  status: 'UPCOMING' | 'COMPLETED';
  completed_at?: string;
};

export type BillWithRelations = Bill & {
  vendor: Vendor;
  payments: (BillPayment & { account: Account })[];
};
