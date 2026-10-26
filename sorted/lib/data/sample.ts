import type {
  Account,
  ActivityItem,
  Bill,
  BillPayment,
  BillWithRelations,
  Company,
  CompanyDocument,
  ComplianceItem,
  Customer,
  Person,
  Vendor,
} from '@/types';

export const company: Company = {
  company_id: 'co_vns',
  name: 'VNS Labs',
  legal_name: 'VNS Labs Private Limited',
  gstin: '29AABCV1234D1Z5',
  pan: 'AABCV1234D',
  created_at: '2025-04-01T00:00:00.000Z',
};

export const people: Person[] = [
  {
    person_id: 'p_nimish',
    name: 'Nimish Khandelwal',
    email: 'nimish@vnslabs.com',
    role: 'Director',
    company_id: 'co_vns',
  },
  {
    person_id: 'p_soumya',
    name: 'Soumya',
    email: 'soumya@vnslabs.com',
    role: 'Director',
    company_id: 'co_vns',
  },
];

export const currentUser = people[0];

export const accounts: Account[] = [
  {
    account_id: 'acc_vns_hdfc',
    name: 'VNS Labs HDFC Bank',
    account_type: 'BANK',
    owner_type: 'COMPANY',
    owner_id: 'co_vns',
    company_id: 'co_vns',
  },
  {
    account_id: 'acc_nimish_hdfc',
    name: 'Nimish HDFC Bank',
    account_type: 'BANK',
    owner_type: 'PERSON',
    owner_id: 'p_nimish',
    company_id: 'co_vns',
  },
  {
    account_id: 'acc_nimish_cc',
    name: 'Nimish Credit Card',
    account_type: 'CREDIT_CARD',
    owner_type: 'PERSON',
    owner_id: 'p_nimish',
    company_id: 'co_vns',
  },
  {
    account_id: 'acc_soumya_hdfc',
    name: 'Soumya HDFC Bank',
    account_type: 'BANK',
    owner_type: 'PERSON',
    owner_id: 'p_soumya',
    company_id: 'co_vns',
  },
];

export const vendors: Vendor[] = [
  { vendor_id: 'v_aws', name: 'Amazon Web Services', gstin: '29AABCA1234A1Z5', email: 'billing@aws.amazon.com' },
  { vendor_id: 'v_razorpay', name: 'Razorpay', gstin: '29AABCR5678B1Z2', email: 'support@razorpay.com' },
  { vendor_id: 'v_google', name: 'Google Cloud', gstin: '29AABCG9012C1Z8' },
  { vendor_id: 'v_notion', name: 'Notion Labs', email: 'team@makenotion.com' },
  { vendor_id: 'v_cursor', name: 'Anysphere (Cursor)', email: 'hi@cursor.com' },
  { vendor_id: 'v_ca', name: 'Mehta & Associates (CA)', gstin: '29AABCM3456D1Z1', phone: '+91 98765 43210' },
];

export const customers: Customer[] = [
  { customer_id: 'c_acme', name: 'Acme Dental Clinic', gstin: '29AABCA1111A1Z1', email: 'ops@acmedental.in' },
  { customer_id: 'c_bright', name: 'Bright Smile Care', email: 'hello@brightsmile.in' },
];

export const bills: Bill[] = [
  {
    bill_id: 'bill_001',
    company_id: 'co_vns',
    vendor_id: 'v_aws',
    invoice_number: 'INV-12345',
    invoice_date: '2026-10-20',
    due_date: '2026-11-20',
    subtotal: 10000,
    tax_amount: 1800,
    total_amount: 11800,
    currency: 'INR',
    payment_status: 'UNPAID',
    document_status: 'ATTACHED',
    drive_file_id: 'drive_aws_001',
    file_name: 'AWS-INV-12345.pdf',
    created_at: '2026-10-20T09:30:00.000Z',
    updated_at: '2026-10-20T09:30:00.000Z',
  },
  {
    bill_id: 'bill_002',
    company_id: 'co_vns',
    vendor_id: 'v_razorpay',
    invoice_number: 'RZ-88421',
    invoice_date: '2026-10-12',
    due_date: '2026-10-27',
    subtotal: 4245,
    tax_amount: 764,
    total_amount: 5009,
    currency: 'INR',
    payment_status: 'PAID',
    document_status: 'ATTACHED',
    drive_file_id: 'drive_rz_002',
    file_name: 'Razorpay-INV-88421.pdf',
    created_at: '2026-10-12T11:00:00.000Z',
    updated_at: '2026-10-18T14:20:00.000Z',
  },
  {
    bill_id: 'bill_003',
    company_id: 'co_vns',
    vendor_id: 'v_google',
    invoice_number: 'GCP-55201',
    invoice_date: '2026-10-01',
    due_date: '2026-10-31',
    subtotal: 8500,
    tax_amount: 1530,
    total_amount: 10030,
    currency: 'INR',
    payment_status: 'PARTIALLY_PAID',
    document_status: 'ATTACHED',
    drive_file_id: 'drive_gcp_003',
    file_name: 'GCP-INV-55201.pdf',
    created_at: '2026-10-01T08:00:00.000Z',
    updated_at: '2026-10-15T10:00:00.000Z',
  },
  {
    bill_id: 'bill_004',
    company_id: 'co_vns',
    vendor_id: 'v_cursor',
    invoice_number: 'CUR-2091',
    invoice_date: '2026-10-08',
    due_date: '2026-10-08',
    subtotal: 1680,
    tax_amount: 0,
    total_amount: 1680,
    currency: 'USD',
    payment_status: 'PAID',
    document_status: 'MISSING',
    created_at: '2026-10-08T16:00:00.000Z',
    updated_at: '2026-10-08T16:45:00.000Z',
  },
  {
    bill_id: 'bill_005',
    company_id: 'co_vns',
    vendor_id: 'v_notion',
    invoice_number: 'NT-4410',
    invoice_date: '2026-09-28',
    due_date: '2026-10-28',
    subtotal: 2400,
    tax_amount: 432,
    total_amount: 2832,
    currency: 'INR',
    payment_status: 'UNPAID',
    document_status: 'MISSING',
    created_at: '2026-09-28T12:00:00.000Z',
    updated_at: '2026-09-28T12:00:00.000Z',
  },
  {
    bill_id: 'bill_006',
    company_id: 'co_vns',
    vendor_id: 'v_ca',
    invoice_number: 'MA-2026-09',
    invoice_date: '2026-09-30',
    due_date: '2026-10-15',
    subtotal: 25000,
    tax_amount: 4500,
    total_amount: 29500,
    currency: 'INR',
    payment_status: 'UNPAID',
    document_status: 'ATTACHED',
    drive_file_id: 'drive_ca_006',
    file_name: 'Mehta-Associates-Sep-2026.pdf',
    created_at: '2026-09-30T10:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
];

export const billPayments: BillPayment[] = [
  {
    payment_id: 'pay_001',
    bill_id: 'bill_002',
    payment_date: '2026-10-18',
    amount: 5009,
    account_id: 'acc_vns_hdfc',
    reimbursement_status: 'NOT_APPLICABLE',
    reference: 'NEFT-RZ-9182',
    created_at: '2026-10-18T14:20:00.000Z',
  },
  {
    payment_id: 'pay_002',
    bill_id: 'bill_003',
    payment_date: '2026-10-15',
    amount: 5000,
    account_id: 'acc_nimish_cc',
    reimbursement_status: 'PENDING',
    notes: 'Paid on personal card — company reimbursement pending',
    created_at: '2026-10-15T10:00:00.000Z',
  },
  {
    payment_id: 'pay_003',
    bill_id: 'bill_004',
    payment_date: '2026-10-08',
    amount: 1680,
    account_id: 'acc_nimish_hdfc',
    reimbursement_status: 'PENDING',
    reference: 'USD wire via HDFC',
    created_at: '2026-10-08T16:45:00.000Z',
  },
];

export const documents: CompanyDocument[] = [
  {
    document_id: 'doc_001',
    company_id: 'co_vns',
    document_type: 'Corporate',
    name: 'Certificate of Incorporation',
    issue_date: '2025-04-01',
    drive_file_id: 'drive_doc_coi',
    created_at: '2025-04-02T10:00:00.000Z',
    updated_at: '2025-04-02T10:00:00.000Z',
  },
  {
    document_id: 'doc_002',
    company_id: 'co_vns',
    document_type: 'Tax',
    name: 'PAN Card',
    issue_date: '2025-04-05',
    drive_file_id: 'drive_doc_pan',
    created_at: '2025-04-06T10:00:00.000Z',
    updated_at: '2025-04-06T10:00:00.000Z',
  },
  {
    document_id: 'doc_003',
    company_id: 'co_vns',
    document_type: 'Tax',
    name: 'GST Certificate',
    issue_date: '2025-05-12',
    drive_file_id: 'drive_doc_gst',
    created_at: '2025-05-13T10:00:00.000Z',
    updated_at: '2026-10-20T08:00:00.000Z',
  },
  {
    document_id: 'doc_004',
    company_id: 'co_vns',
    document_type: 'Corporate',
    name: 'Memorandum of Association',
    issue_date: '2025-04-01',
    drive_file_id: 'drive_doc_moa',
    created_at: '2025-04-02T11:00:00.000Z',
    updated_at: '2025-04-02T11:00:00.000Z',
  },
  {
    document_id: 'doc_005',
    company_id: 'co_vns',
    document_type: 'Corporate',
    name: 'Articles of Association',
    issue_date: '2025-04-01',
    created_at: '2025-04-02T11:30:00.000Z',
    updated_at: '2025-04-02T11:30:00.000Z',
  },
];

export const activity: ActivityItem[] = [
  {
    activity_id: 'act_001',
    title: 'AWS bill added',
    detail: '₹11,800',
    occurred_at: '2026-10-26T02:30:00.000Z',
    kind: 'bill',
  },
  {
    activity_id: 'act_002',
    title: 'GST certificate uploaded',
    occurred_at: '2026-10-25T08:00:00.000Z',
    kind: 'document',
  },
  {
    activity_id: 'act_003',
    title: 'Razorpay invoice marked paid',
    detail: '₹5,009',
    occurred_at: '2026-10-25T06:00:00.000Z',
    kind: 'payment',
  },
  {
    activity_id: 'act_004',
    title: 'GCP payment recorded',
    detail: '₹5,000 · Reimbursement pending',
    occurred_at: '2026-10-15T10:00:00.000Z',
    kind: 'payment',
  },
];

export const compliance: ComplianceItem[] = [
  {
    compliance_id: 'cmp_001',
    name: 'GST filing',
    due_date: '2026-10-31',
    status: 'UPCOMING',
  },
  {
    compliance_id: 'cmp_002',
    name: 'Annual ROC filing',
    due_date: '2026-11-27',
    status: 'UPCOMING',
  },
  {
    compliance_id: 'cmp_003',
    name: 'Income tax',
    due_date: '2027-01-08',
    status: 'UPCOMING',
  },
  {
    compliance_id: 'cmp_004',
    name: 'GSTR-1 (September)',
    due_date: '2026-10-11',
    status: 'COMPLETED',
    completed_at: '2026-10-10T16:00:00.000Z',
  },
];

function vendorById(id: string): Vendor {
  return vendors.find((v) => v.vendor_id === id)!;
}

function accountById(id: string): Account {
  return accounts.find((a) => a.account_id === id)!;
}

export function getBillsWithRelations(): BillWithRelations[] {
  return bills.map((bill) => ({
    ...bill,
    vendor: vendorById(bill.vendor_id),
    payments: billPayments
      .filter((p) => p.bill_id === bill.bill_id)
      .map((p) => ({ ...p, account: accountById(p.account_id) })),
  }));
}

export function getBillById(id: string): BillWithRelations | undefined {
  return getBillsWithRelations().find((b) => b.bill_id === id);
}

export function getOverviewStats() {
  const unpaid = bills.filter((b) => b.payment_status !== 'PAID');
  const billsDue = unpaid.reduce((sum, b) => {
    const paid = billPayments
      .filter((p) => p.bill_id === b.bill_id)
      .reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, b.total_amount - paid);
  }, 0);
  const missingDocs = bills.filter((b) => b.document_status === 'MISSING').length
    + documents.filter((d) => !d.drive_file_id).length;
  const upcomingCompliance = compliance.filter((c) => c.status === 'UPCOMING').length;

  return {
    billsDue,
    unpaidCount: unpaid.length,
    missingDocuments: missingDocs,
    upcomingCompliance,
  };
}
