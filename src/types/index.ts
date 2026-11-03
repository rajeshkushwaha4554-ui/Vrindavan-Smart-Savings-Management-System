export interface CompanyInfo {
  legalName: string;
  hindiName: string;
  cin: string;
  registeredOffice: string;
  email: string;
  mobile: string;
  website: string;
  pan: string;
  tan: string;
  logoUrl: string;
}

export type SavingsPlanType = 'daily' | 'weekly' | 'monthly' | 'flexi' | 'fixed';

export interface SavingsPlan {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  type: SavingsPlanType;
  defaultAnnualRate: number; // e.g. 7.5
  minDepositAmount: number;
  maxDepositAmount?: number;
  calculationMethod: 'simple' | 'compound_daily' | 'compound_monthly' | 'compound_yearly';
  descriptionHindi: string;
  durationMonths: number;
  isActive: boolean;
  isFlexible?: boolean;
}

export interface Customer {
  id: string; // e.g., CUST-1001
  nameHindi: string;
  nameEnglish: string;
  guardianName: string;
  mobile: string;
  altMobile?: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pincode: string;
  fullAddress: string;
  photoUrl?: string;
  kycType: 'आधार कार्ड' | 'पैन कार्ड' | 'वोटर कार्ड' | 'राशन कार्ड';
  kycDocRef: string;
  nomineeName: string;
  nomineeRelation: string;
  dateOfBirth: string;
  branchId: string;
  assignedEmployeeId: string;
  openingDate: string;
  status: 'active' | 'suspended' | 'closed';
  savingsGoal?: number;
  visitStatus?: 'pending' | 'visited_collected' | 'visited_not_available' | 'rescheduled';
  lastVisitNotes?: string;
}

export interface SavingsAccount {
  id: string; // e.g. ACC-2025-001
  accountNumber: string;
  customerId: string;
  planId: string;
  planType: SavingsPlanType;
  planNameHindi: string;
  openingDate: string;
  depositFrequency: 'daily' | 'weekly' | 'monthly' | 'flexi';
  installmentAmount: number;
  durationMonths: number;
  annualInterestRate: number;
  interestCalculationMethod: 'simple' | 'compound_daily' | 'compound_monthly' | 'compound_yearly';
  maturityDate: string;
  expectedMaturityAmount: number;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInterestCredited: number;
  accruedInterestUnposted: number;
  lastInterestCalculatedDate?: string;
  status: 'active' | 'matured' | 'closed';
  branchId: string;
  assignedEmployeeId: string;
  isFlexible: boolean;
  minDepositLimit?: number;
  maxDepositLimit?: number;
  bondNumber?: string;
  initialDeposit?: number;
}

export interface SavingsBond {
  bondNumber: string;
  accountId: string;
  accountNumber: string;
  customerId: string;
  customerHindiName: string;
  customerEnglishName: string;
  guardianName: string;
  mobile: string;
  fullAddress: string;
  nomineeName: string;
  nomineeRelation: string;
  openingDate: string;
  planNameHindi: string;
  planType: SavingsPlanType;
  isFlexible: boolean;
  initialDeposit: number;
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalInterestCredited: number;
  annualInterestRate: number;
  interestCalculationMethod: string;
  status: 'active' | 'matured' | 'closed';
  branchId: string;
  branchName: string;
  issuedBy: string;
  issuedAt: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'interest_credit' | 'reversal';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer';

export interface Transaction {
  id: string; // e.g., TXN-20251102-001
  receiptNumber: string; // e.g., RCP-1001
  accountId: string;
  accountNumber: string;
  customerId: string;
  customerNameHindi: string;
  customerNameEnglish: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  displayDate: string; // DD-MM-YYYY
  paymentMethod: PaymentMethod;
  previousBalance: number;
  currentBalance: number;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  gpsLocation?: string;
  coordinates?: { latitude: number; longitude: number; accuracy?: number };
  referenceNo?: string;
  remarks?: string;
  withdrawalReason?: string;
  authorizedBy?: string;
  isReversed?: boolean;
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
}

export interface Employee {
  id: string; // e.g. EMP-101
  nameHindi: string;
  nameEnglish: string;
  role: 'field_agent' | 'accountant' | 'branch_manager' | 'admin' | 'super_admin';
  mobile: string;
  branchId: string;
  branchName: string;
  status: 'active' | 'inactive';
  todayAssignedCustomersCount?: number;
  todayTargetAmount?: number;
  todayCollectedAmount?: number;
  cashInHand?: number;
  openingCash?: number;
  upiCollectedToday?: number;
  bankCollectedToday?: number;
  cashSubmittedToOffice?: number;
  isPunchedIn?: boolean;
  punchInTime?: string;
  punchInLocation?: string;
}

export interface Branch {
  id: string;
  code: string;
  nameHindi: string;
  nameEnglish: string;
  address: string;
  contactNumber: string;
}

export interface DailyCashClosing {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  totalCollected: number;
  submittedToOffice: number;
  shortOrExcess: number;
  denominations: {
    note500: number;
    note200: number;
    note100: number;
    note50: number;
    note20: number;
    note10: number;
    coins: number;
  };
  verifiedBy: string;
  remarks: string;
  status: 'submitted' | 'approved' | 'discrepancy';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  displayTime: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  ipDeviceTag: string;
}

export interface ComplianceConfig {
  entityCategory: string;
  regulatoryReference: string;
  isDepositPermitted: boolean;
  complianceApprovalStatus: 'verified' | 'under_review' | 'demo_mode';
  maxDailyDepositLimit: number;
  disclaimerHindi: string;
  disclaimerEnglish: string;
}

export interface DayClosingSummary {
  date: string;
  closedAt: string;
  closedBy: string;
  totalDepositAmount: number;
  totalWithdrawalAmount: number;
  cashInOfficeReceived: number;
  upiTotalReceived: number;
  bankTotalReceived: number;
  customersServedCount: number;
  totalInterestPayableAccrued: number;
  pendingCashDiscrepancies: number;
  employeeBreakdowns: Array<{
    employeeId: string;
    employeeName: string;
    collected: number;
    submitted: number;
    diff: number;
    status: string;
  }>;
}

export interface FieldAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchInTime: string;
  punchInLocation: string;
  punchInCoords?: { latitude: number; longitude: number };
  punchOutTime?: string;
  punchOutLocation?: string;
  status: 'punched_in' | 'punched_out';
}
