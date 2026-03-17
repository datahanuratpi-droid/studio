
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  subTasks: SubTask[];
  createdAt: string;
}

export type CorrespondenceType = 'Incoming' | 'Outgoing';
export type CorrespondenceStatus = 'Draft' | 'Sent' | 'Received' | 'Reviewed' | 'Archived' | 'Replied';

export interface Correspondence {
  id: string;
  subject: string;
  body: string;
  type: CorrespondenceType;
  correspondenceNumber: string;
  correspondenceDate: string;
  senderRecipientName: string;
  senderRecipientContact?: string;
  status: CorrespondenceStatus;
  createdByUserId: string;
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface ActivityReport {
  id: string;
  title: string;
  location: string;
  description: string;
  reportDate: string;
  reporterId: string;
  status: ReportStatus;
  absensiFile?: string;
  spandukFile?: string;
  fotoBersamaFile?: string;
  fotoPendukungFile?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'Payment' | 'Receipt' | 'CashAdvance' | 'SalarySlip';

export interface FinancialTransaction {
  id: string;
  amount: number;
  transactionDate: string;
  description: string;
  type: TransactionType;
  categoryId: string;
  recordedByUserId: string;
  involvedPartyId?: string;
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DigitalArchive {
  id: string;
  archiveTitle: string;
  fileName: string;
  uploadedByUserId: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'KSB' | 'Staff';
  status: 'Pending Verification' | 'Active' | 'Inactive';
  phoneNumber?: string;
  passwordDisplay?: string;
  themePreference?: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
}
