import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  SavingsAccount,
  SavingsPlan,
  Transaction,
  Employee,
  Branch,
  DailyCashClosing,
  AuditLog,
  ComplianceConfig,
  CompanyInfo,
  PaymentMethod,
  DayClosingSummary,
  FieldAttendance
} from '../types';
import { formatDateDDMMYYYY } from '../utils/transliteration';
import { calculateDailyBalanceInterest } from '../utils/interestCalculator';

export const COMPANY_DETAILS: CompanyInfo = {
  legalName: 'Vrindavan Small Microfinance Private Limited',
  hindiName: 'वृंदावन स्मॉल माइक्रोफाइनेंस प्राइवेट लिमिटेड',
  cin: 'U64920UP2025PTC221690',
  registeredOffice: 'नौरंगिया बरगहा रोड, कुशीनगर, उत्तर प्रदेश – 274805',
  email: 'vsmpl3636@gmail.com',
  mobile: '9794133636',
  website: 'www.vrindavanmicrofinance.com',
  pan: 'AABCV1234F',
  tan: 'LKNV01234D',
  logoUrl: '/vrindavan_logo.jpeg'
};

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'BR-01',
    code: 'KSH-HQ',
    nameHindi: 'कुशीनगर मुख्य शाखा',
    nameEnglish: 'Kushinagar Head Office',
    address: 'नौरंगिया बरगहा रोड, कुशीनगर - 274805',
    contactNumber: '9794133636'
  },
  {
    id: 'BR-02',
    code: 'PAD-01',
    nameHindi: 'पडरौना शाखा',
    nameEnglish: 'Padrauna Branch',
    address: 'सुभाष चौक, पडरौना, कुशीनगर - 274304',
    contactNumber: '9838123456'
  },
  {
    id: 'BR-03',
    code: 'TAM-01',
    nameHindi: 'तमकुही राज शाखा',
    nameEnglish: 'Tamkuhi Raj Branch',
    address: 'रेलवे स्टेशन रोड, तमकुही राज - 274407',
    contactNumber: '9450987654'
  }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-101',
    nameHindi: 'अमन कुशवाहा',
    nameEnglish: 'Aman Kushwaha',
    role: 'field_agent',
    mobile: '9794133636',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    status: 'active',
    todayAssignedCustomersCount: 15,
    todayTargetAmount: 5000,
    todayCollectedAmount: 2800,
    cashInHand: 2800,
    openingCash: 500,
    upiCollectedToday: 2000,
    bankCollectedToday: 0,
    cashSubmittedToOffice: 0,
    isPunchedIn: true,
    punchInTime: '08:30 AM',
    punchInLocation: 'नौरंगिया मुख्य चौक (26.9015° N, 83.9854° E)'
  },
  {
    id: 'EMP-102',
    nameHindi: 'सुरेश यादव',
    nameEnglish: 'Suresh Yadav',
    role: 'field_agent',
    mobile: '9838123456',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    status: 'active',
    todayAssignedCustomersCount: 12,
    todayTargetAmount: 4000,
    todayCollectedAmount: 3600,
    cashInHand: 3600,
    openingCash: 0,
    upiCollectedToday: 0,
    bankCollectedToday: 0,
    cashSubmittedToOffice: 0,
    isPunchedIn: true,
    punchInTime: '08:45 AM',
    punchInLocation: 'खिरकिया, कुशीनगर'
  },
  {
    id: 'EMP-103',
    nameHindi: 'राजेश कुमार',
    nameEnglish: 'Rajesh Kumar',
    role: 'branch_manager',
    mobile: '9450987654',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    status: 'active',
    cashInHand: 15000,
    openingCash: 15000,
    isPunchedIn: true,
    punchInTime: '08:00 AM',
    punchInLocation: 'कुशीनगर मुख्य कार्यालय'
  },
  {
    id: 'EMP-104',
    nameHindi: 'अनीता देवी',
    nameEnglish: 'Anita Devi',
    role: 'accountant',
    mobile: '9123456789',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    status: 'active',
    cashInHand: 0,
    isPunchedIn: true,
    punchInTime: '08:15 AM',
    punchInLocation: 'कुशीनगर मुख्य कार्यालय'
  }
];

const DEFAULT_PLANS: SavingsPlan[] = [
  {
    id: 'PLAN-03',
    nameHindi: 'फ्लेक्सी बचत खाता (Flexible Savings)',
    nameEnglish: 'Flexible Savings Scheme',
    type: 'flexi',
    defaultAnnualRate: 7.0,
    minDepositAmount: 10,
    maxDepositAmount: 50000,
    calculationMethod: 'compound_daily',
    descriptionHindi: 'कभी भी, कितनी भी अनुमत राशि जमा करें। कोई अनिवार्य किस्त या जुर्माना नहीं।',
    durationMonths: 12,
    isActive: true,
    isFlexible: true
  },
  {
    id: 'PLAN-01',
    nameHindi: 'दैनिक बचत योजना (Daily Savings)',
    nameEnglish: 'Daily Savings Scheme',
    type: 'daily',
    defaultAnnualRate: 8.0,
    minDepositAmount: 50,
    maxDepositAmount: 10000,
    calculationMethod: 'simple',
    descriptionHindi: 'दैनिक संग्रह बचत खाता - प्रतिदिन ₹50 से ₹1,000 तक जमा की सुविधा',
    durationMonths: 12,
    isActive: true,
    isFlexible: false
  },
  {
    id: 'PLAN-02',
    nameHindi: 'मासिक आरडी बचत (Monthly RD)',
    nameEnglish: 'Monthly Recurring Deposit',
    type: 'monthly',
    defaultAnnualRate: 8.5,
    minDepositAmount: 500,
    maxDepositAmount: 25000,
    calculationMethod: 'compound_monthly',
    descriptionHindi: 'मासिक नियमित बचत खाता - 12 से 36 महीने की अवधि',
    durationMonths: 24,
    isActive: true,
    isFlexible: false
  },
  {
    id: 'PLAN-04',
    nameHindi: 'मियादी बचत योजना (Fixed Term Scheme)',
    nameEnglish: 'Fixed Term Savings',
    type: 'fixed',
    defaultAnnualRate: 9.5,
    minDepositAmount: 5000,
    maxDepositAmount: 100000,
    calculationMethod: 'compound_yearly',
    descriptionHindi: 'एकमुश्त सुरक्षित बचत - उच्च ब्याज दर के साथ (अनुमति अनुसार)',
    durationMonths: 12,
    isActive: true,
    isFlexible: false
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1001',
    nameHindi: 'राजेश कुमार',
    nameEnglish: 'Rajesh Kumar',
    guardianName: 'पिता: राम प्रसाद',
    mobile: '9876543210',
    altMobile: '9123456780',
    village: 'बरगहा',
    postOffice: 'नौरंगिया',
    district: 'कुशीनगर',
    state: 'उत्तर प्रदेश',
    pincode: '274805',
    fullAddress: 'ग्राम - बरगहा, पोस्ट - नौरंगिया, कुशीनगर, उत्तर प्रदेश',
    kycType: 'आधार कार्ड',
    kycDocRef: 'XXXX-XXXX-4589',
    nomineeName: 'सुनीता देवी',
    nomineeRelation: 'पत्नी (Wife)',
    dateOfBirth: '1988-06-14',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    openingDate: '2025-01-10',
    status: 'active',
    savingsGoal: 25000,
    visitStatus: 'visited_collected',
    lastVisitNotes: 'दुकान पर विजिट किया, नियमित बचतकर्ता'
  },
  {
    id: 'CUST-1002',
    nameHindi: 'अमन कुशवाहा',
    nameEnglish: 'Aman Kushwaha',
    guardianName: 'पिता: शिव बालक कुशवाहा',
    mobile: '9794133636',
    village: 'नौरंगिया',
    postOffice: 'नौरंगिया',
    district: 'कुशीनगर',
    state: 'उत्तर प्रदेश',
    pincode: '274805',
    fullAddress: 'ग्राम व पोस्ट - नौरंगिया, कुशीनगर, उत्तर प्रदेश',
    kycType: 'आधार कार्ड',
    kycDocRef: 'XXXX-XXXX-9124',
    nomineeName: 'मंजू देवी',
    nomineeRelation: 'माता (Mother)',
    dateOfBirth: '1995-09-20',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    openingDate: '2025-01-15',
    status: 'active',
    savingsGoal: 50000,
    visitStatus: 'visited_collected',
    lastVisitNotes: 'UPI से भुगतान किया'
  },
  {
    id: 'CUST-1003',
    nameHindi: 'सुनीता देवी',
    nameEnglish: 'Sunita Devi',
    guardianName: 'पति: मोहन लाल',
    mobile: '9935123456',
    village: 'खिरकिया',
    postOffice: 'नौरंगिया',
    district: 'कुशीनगर',
    state: 'उत्तर प्रदेश',
    pincode: '274805',
    fullAddress: 'ग्राम - खिरकिया, कुशीनगर, उत्तर प्रदेश',
    kycType: 'वोटर कार्ड',
    kycDocRef: 'UP/02/123/456789',
    nomineeName: 'राहुल कुमार',
    nomineeRelation: 'पुत्र (Son)',
    dateOfBirth: '1992-04-10',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-102',
    openingDate: '2025-02-01',
    status: 'active',
    savingsGoal: 20000,
    visitStatus: 'pending',
    lastVisitNotes: 'दोपहर में घर पर मिलने का समय दिया है'
  },
  {
    id: 'CUST-1004',
    nameHindi: 'पूजा वर्मा',
    nameEnglish: 'Pooja Verma',
    guardianName: 'पिता: रमेश वर्मा',
    mobile: '9415678901',
    village: 'पडरौना देहात',
    postOffice: 'पडरौना',
    district: 'कुशीनगर',
    state: 'उत्तर प्रदेश',
    pincode: '274304',
    fullAddress: 'सुभाष चौक के पास, पडरौना, कुशीनगर',
    kycType: 'आधार कार्ड',
    kycDocRef: 'XXXX-XXXX-7721',
    nomineeName: 'रमेश वर्मा',
    nomineeRelation: 'पिता (Father)',
    dateOfBirth: '1998-11-25',
    branchId: 'BR-02',
    assignedEmployeeId: 'EMP-102',
    openingDate: '2025-02-15',
    status: 'active',
    savingsGoal: 40000,
    visitStatus: 'pending'
  },
  {
    id: 'CUST-1005',
    nameHindi: 'अनिल सिंह',
    nameEnglish: 'Anil Singh',
    guardianName: 'पिता: हरेंद्र सिंह',
    mobile: '9839456123',
    village: 'बरगहा टोला',
    postOffice: 'नौरंगिया',
    district: 'कुशीनगर',
    state: 'उत्तर प्रदेश',
    pincode: '274805',
    fullAddress: 'बरगहा टोला, नौरंगिया मार्ग, कुशीनगर',
    kycType: 'पैन कार्ड',
    kycDocRef: 'BHYPS9021K',
    nomineeName: 'रीता सिंह',
    nomineeRelation: 'पत्नी (Wife)',
    dateOfBirth: '1985-01-05',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    openingDate: '2025-03-01',
    status: 'active',
    savingsGoal: 30000,
    visitStatus: 'pending'
  }
];

const DEFAULT_ACCOUNTS: SavingsAccount[] = [
  {
    id: 'ACC-2025-001',
    accountNumber: 'VSMPL-FX-1001',
    bondNumber: 'BND-2026-000001',
    customerId: 'CUST-1001',
    planId: 'PLAN-03',
    planType: 'flexi',
    planNameHindi: 'फ्लेक्सी बचत खाता (Flexible Savings)',
    openingDate: '2025-01-10',
    depositFrequency: 'flexi',
    installmentAmount: 100,
    durationMonths: 12,
    annualInterestRate: 7.0,
    interestCalculationMethod: 'compound_daily',
    maturityDate: '2026-01-10',
    expectedMaturityAmount: 38040,
    currentBalance: 14500,
    totalDeposited: 15500,
    totalWithdrawn: 1000,
    totalInterestCredited: 0,
    accruedInterestUnposted: 245.5,
    status: 'active',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    isFlexible: true,
    minDepositLimit: 10,
    maxDepositLimit: 50000
  },
  {
    id: 'ACC-2025-002',
    accountNumber: 'VSMPL-FX-1002',
    bondNumber: 'BND-2026-000002',
    customerId: 'CUST-1002',
    planId: 'PLAN-03',
    planType: 'flexi',
    planNameHindi: 'फ्लेक्सी बचत खाता (Flexible Savings)',
    openingDate: '2025-01-15',
    depositFrequency: 'flexi',
    installmentAmount: 500,
    durationMonths: 24,
    annualInterestRate: 7.0,
    interestCalculationMethod: 'compound_daily',
    maturityDate: '2027-01-15',
    expectedMaturityAmount: 52420,
    currentBalance: 24000,
    totalDeposited: 24000,
    totalWithdrawn: 0,
    totalInterestCredited: 0,
    accruedInterestUnposted: 380.2,
    status: 'active',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    isFlexible: true,
    minDepositLimit: 10,
    maxDepositLimit: 50000
  },
  {
    id: 'ACC-2025-003',
    accountNumber: 'VSMPL-DS-1003',
    bondNumber: 'BND-2026-000003',
    customerId: 'CUST-1003',
    planId: 'PLAN-01',
    planType: 'daily',
    planNameHindi: 'दैनिक बचत योजना',
    openingDate: '2025-02-01',
    depositFrequency: 'daily',
    installmentAmount: 100,
    durationMonths: 12,
    annualInterestRate: 8.0,
    interestCalculationMethod: 'simple',
    maturityDate: '2026-02-01',
    expectedMaturityAmount: 38040,
    currentBalance: 8200,
    totalDeposited: 8200,
    totalWithdrawn: 0,
    totalInterestCredited: 0,
    accruedInterestUnposted: 110.4,
    status: 'active',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-102',
    isFlexible: true,
    minDepositLimit: 10,
    maxDepositLimit: 25000
  },
  {
    id: 'ACC-2025-004',
    accountNumber: 'VSMPL-FX-1004',
    bondNumber: 'BND-2026-000004',
    customerId: 'CUST-1004',
    planId: 'PLAN-03',
    planType: 'flexi',
    planNameHindi: 'फ्लेक्सी बचत खाता',
    openingDate: '2025-02-15',
    depositFrequency: 'flexi',
    installmentAmount: 500,
    durationMonths: 12,
    annualInterestRate: 6.5,
    interestCalculationMethod: 'compound_daily',
    maturityDate: '2026-02-15',
    expectedMaturityAmount: 34000,
    currentBalance: 32000,
    totalDeposited: 35000,
    totalWithdrawn: 3000,
    totalInterestCredited: 0,
    accruedInterestUnposted: 420.0,
    status: 'active',
    branchId: 'BR-02',
    assignedEmployeeId: 'EMP-102',
    isFlexible: true
  },
  {
    id: 'ACC-2025-005',
    accountNumber: 'VSMPL-DS-1005',
    bondNumber: 'BND-2026-000005',
    customerId: 'CUST-1005',
    planId: 'PLAN-01',
    planType: 'daily',
    planNameHindi: 'दैनिक बचत योजना',
    openingDate: '2025-03-01',
    depositFrequency: 'daily',
    installmentAmount: 200,
    durationMonths: 12,
    annualInterestRate: 8.0,
    interestCalculationMethod: 'simple',
    maturityDate: '2026-03-01',
    expectedMaturityAmount: 76080,
    currentBalance: 11300,
    totalDeposited: 11300,
    totalWithdrawn: 0,
    totalInterestCredited: 0,
    accruedInterestUnposted: 145.0,
    status: 'active',
    branchId: 'BR-01',
    assignedEmployeeId: 'EMP-101',
    isFlexible: true
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-20251102-001',
    receiptNumber: 'RCP-1001',
    accountId: 'ACC-2025-001',
    accountNumber: 'VSMPL-FX-1001',
    customerId: 'CUST-1001',
    customerNameHindi: 'राजेश कुमार',
    customerNameEnglish: 'Rajesh Kumar',
    type: 'deposit',
    amount: 500,
    date: new Date().toISOString(),
    displayDate: formatDateDDMMYYYY(new Date()),
    paymentMethod: 'cash',
    previousBalance: 14000,
    currentBalance: 14500,
    employeeId: 'EMP-101',
    employeeName: 'अमन कुशवाहा',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    gpsLocation: 'नौरंगिया चौराहा, कुशीनगर (26.9015° N, 83.9854° E)',
    remarks: 'फ्लेक्सी बचत ऐच्छिक जमा'
  },
  {
    id: 'TXN-20251102-002',
    receiptNumber: 'RCP-1002',
    accountId: 'ACC-2025-002',
    accountNumber: 'VSMPL-FX-1002',
    customerId: 'CUST-1002',
    customerNameHindi: 'अमन कुशवाहा',
    customerNameEnglish: 'Aman Kushwaha',
    type: 'deposit',
    amount: 2000,
    date: new Date(Date.now() - 3600000).toISOString(),
    displayDate: formatDateDDMMYYYY(new Date()),
    paymentMethod: 'upi',
    referenceNo: 'UPI/2025/98237192',
    previousBalance: 22000,
    currentBalance: 24000,
    employeeId: 'EMP-101',
    employeeName: 'अमन कुशवाहा',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    gpsLocation: 'नौरंगिया ऑफिस, कुशीनगर',
    remarks: 'फ्लेक्सी ऑनलाइन बचत जमा'
  },
  {
    id: 'TXN-20251101-003',
    receiptNumber: 'RCP-1003',
    accountId: 'ACC-2025-001',
    accountNumber: 'VSMPL-FX-1001',
    customerId: 'CUST-1001',
    customerNameHindi: 'राजेश कुमार',
    customerNameEnglish: 'Rajesh Kumar',
    type: 'withdrawal',
    amount: 1000,
    date: new Date(Date.now() - 86400000).toISOString(),
    displayDate: formatDateDDMMYYYY(new Date(Date.now() - 86400000)),
    paymentMethod: 'cash',
    previousBalance: 15000,
    currentBalance: 14000,
    employeeId: 'EMP-103',
    employeeName: 'राजेश कुमार',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    withdrawalReason: 'घरेलू खर्च हेतु आंशिक निकासी',
    authorizedBy: 'राजेश कुमार (शाखा प्रबंधक)',
    remarks: 'स्वीकृत आंशिक निकासी'
  },
  {
    id: 'TXN-20251101-004',
    receiptNumber: 'RCP-1004',
    accountId: 'ACC-2025-003',
    accountNumber: 'VSMPL-DS-1003',
    customerId: 'CUST-1003',
    customerNameHindi: 'सुनीता देवी',
    customerNameEnglish: 'Sunita Devi',
    type: 'deposit',
    amount: 300,
    date: new Date(Date.now() - 90000000).toISOString(),
    displayDate: formatDateDDMMYYYY(new Date(Date.now() - 90000000)),
    paymentMethod: 'cash',
    previousBalance: 7900,
    currentBalance: 8200,
    employeeId: 'EMP-102',
    employeeName: 'सुरेश यादव',
    branchId: 'BR-01',
    branchName: 'कुशीनगर मुख्य शाखा',
    gpsLocation: 'खिरकिया, कुशीनगर',
    remarks: 'फ्लेक्सी ऐच्छिक जमा'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-1',
    timestamp: new Date().toISOString(),
    displayTime: formatDateDDMMYYYY(new Date()) + ' ' + new Date().toLocaleTimeString(),
    actorName: 'व्यवस्थापक (Admin)',
    actorRole: 'admin',
    action: 'सिस्टम अपग्रेड / Flexible Savings Upgrade',
    details: 'फ्लेक्सी बचत खाता प्रणाली, फील्ड ट्रैकिंग एवं ईओडी क्लोजिंग इंजन सक्रिय',
    ipDeviceTag: '192.168.1.10 (Secure Terminal)'
  }
];

const DEFAULT_COMPLIANCE: ComplianceConfig = {
  entityCategory: 'Private Limited (Microfinance Services)',
  regulatoryReference: 'CIN: U64920UP2025PTC221690 - RoC Kanpur',
  isDepositPermitted: true,
  complianceApprovalStatus: 'verified',
  maxDailyDepositLimit: 50000,
  disclaimerHindi: 'वैधानिक सूचना: वास्तविक वित्तीय बचत व जमा स्वीकार करने से पूर्व संबंधित कंपनी को आवश्यक विनियामक (RBI / MCA) वैधानिक अनुमति होना अनिवार्य है। यह सॉफ्टवेयर पूर्ण पारदर्शी डिजिटल लेजर व हिसाब-किताब सुनिश्चित करता है।',
  disclaimerEnglish: 'Statutory Notice: Real public savings acceptance requires regulatory compliance under applicable RBI/MCA framework. This software enforces internal audit & ledger transparency.'
};

interface SavingsContextType {
  company: CompanyInfo;
  customers: Customer[];
  accounts: SavingsAccount[];
  plans: SavingsPlan[];
  transactions: Transaction[];
  employees: Employee[];
  branches: Branch[];
  auditLogs: AuditLog[];
  compliance: ComplianceConfig;
  currentRole: 'admin' | 'employee';
  setCurrentRole: (role: 'admin' | 'employee') => void;
  selectedEmployeeId: string;
  setSelectedEmployeeId: (empId: string) => void;
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  isQuickMode: boolean;
  setIsQuickMode: (val: boolean) => void;
  // Modals & Printable view state
  receiptForPrint: Transaction | null;
  setReceiptForPrint: (txn: Transaction | null) => void;
  passbookForPrint: { customer: Customer; account: SavingsAccount } | null;
  setPassbookForPrint: (data: { customer: Customer; account: SavingsAccount } | null) => void;
  bondForPrint: { customer: Customer; account: SavingsAccount } | null;
  setBondForPrint: (data: { customer: Customer; account: SavingsAccount } | null) => void;
  eodReport: DayClosingSummary | null;
  setEodReport: (data: DayClosingSummary | null) => void;
  // Core Operations
  addCustomer: (cust: Omit<Customer, 'id' | 'openingDate' | 'status'>) => Customer;
  updateCustomer: (cust: Customer) => void;
  openAccount: (acc: Omit<SavingsAccount, 'id' | 'accountNumber' | 'currentBalance' | 'totalDeposited' | 'totalWithdrawn' | 'totalInterestCredited' | 'accruedInterestUnposted' | 'status'>) => SavingsAccount;
  addDeposit: (params: {
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    employeeId: string;
    remarks?: string;
    referenceNo?: string;
    gpsLocation?: string;
    coordinates?: { latitude: number; longitude: number; accuracy?: number };
  }) => Transaction;
  makeWithdrawal: (params: {
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    withdrawalReason: string;
    authorizedBy: string;
    employeeId: string;
    remarks?: string;
  }) => { success: boolean; transaction?: Transaction; message?: string };
  reverseTransaction: (txnId: string, reason: string, reversedBy: string) => { success: boolean; message: string };
  postInterestAccrual: (accountId: string, amount: number, authorizedBy: string) => { success: boolean; message: string; transaction?: Transaction };
  punchInAttendance: (employeeId: string, location?: string, coords?: { latitude: number; longitude: number; accuracy?: number }) => void;
  punchOutAttendance: (employeeId: string, location?: string) => void;
  updateCustomerVisit: (customerId: string, status: Customer['visitStatus'], notes?: string) => void;
  submitDailyClosing: (closing: Omit<DailyCashClosing, 'id'>) => void;
  performEODClosing: (closedBy: string) => DayClosingSummary;
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (emp: Employee) => void;
  updateCompliance: (cfg: Partial<ComplianceConfig>) => void;
  exportDatabaseBackup: () => void;
  importDatabaseBackup: (jsonStr: string) => { success: boolean; message: string };
  resetToDemoData: () => void;
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

const STORAGE_KEY = 'VRINDAVAN_SAVINGS_DATA_V3';

export const SavingsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CUSTOMERS`);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  });

  const [accounts, setAccounts] = useState<SavingsAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ACCOUNTS`);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_TRANSACTIONS`);
      return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  });

  const [plans, setPlans] = useState<SavingsPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_PLANS`);
      return saved ? JSON.parse(saved) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_EMPLOYEES`);
      return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
    } catch {
      return DEFAULT_EMPLOYEES;
    }
  });

  const [branches] = useState<Branch[]>(DEFAULT_BRANCHES);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_AUDIT`);
      return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  });

  const [compliance, setCompliance] = useState<ComplianceConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_COMPLIANCE`);
      return saved ? JSON.parse(saved) : DEFAULT_COMPLIANCE;
    } catch {
      return DEFAULT_COMPLIANCE;
    }
  });

  const [currentRole, setCurrentRole] = useState<'admin' | 'employee'>('admin');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP-101');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isQuickMode, setIsQuickMode] = useState<boolean>(false);

  const [receiptForPrint, setReceiptForPrint] = useState<Transaction | null>(null);
  const [passbookForPrint, setPassbookForPrint] = useState<{ customer: Customer; account: SavingsAccount } | null>(null);
  const [bondForPrint, setBondForPrint] = useState<{ customer: Customer; account: SavingsAccount } | null>(null);
  const [eodReport, setEodReport] = useState<DayClosingSummary | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_CUSTOMERS`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_ACCOUNTS`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_TRANSACTIONS`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_PLANS`, JSON.stringify(plans));
      localStorage.setItem(`${STORAGE_KEY}_EMPLOYEES`, JSON.stringify(employees));
      localStorage.setItem(`${STORAGE_KEY}_AUDIT`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_COMPLIANCE`, JSON.stringify(compliance));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [customers, accounts, transactions, plans, employees, auditLogs, compliance]);

  const addAudit = (action: string, details: string, actorName = 'सिस्टम', actorRole: string = currentRole) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      displayTime: formatDateDDMMYYYY(new Date()) + ' ' + new Date().toLocaleTimeString(),
      actorName,
      actorRole,
      action,
      details,
      ipDeviceTag: 'सुरक्षित टर्मिनल (Android/Web)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'openingDate' | 'status'>): Customer => {
    const nextNum = 1000 + customers.length + 1;
    const newId = `CUST-${nextNum}`;
    const newCust: Customer = {
      ...custData,
      id: newId,
      openingDate: new Date().toISOString().split('T')[0],
      status: 'active',
      visitStatus: 'pending'
    };
    setCustomers(prev => [newCust, ...prev]);
    addAudit('नया ग्राहक पंजीकरण (Customer Registered)', `ग्राहक: ${newCust.nameHindi} (${newCust.nameEnglish}), ID: ${newId}`);
    return newCust;
  };

  const updateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    addAudit('ग्राहक विवरण अद्यतन (Customer Updated)', `ग्राहक ID: ${updatedCust.id}, नाम: ${updatedCust.nameHindi}`);
  };

  const updateCustomerVisit = (customerId: string, status: Customer['visitStatus'], notes?: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          visitStatus: status,
          lastVisitNotes: notes || c.lastVisitNotes
        };
      }
      return c;
    }));
    addAudit('फील्ड विजिट स्थिति अद्यतन (Customer Visit Updated)', `ग्राहक ID: ${customerId}, स्थिति: ${status}`);
  };

  const openAccount = (accData: Omit<SavingsAccount, 'id' | 'accountNumber' | 'currentBalance' | 'totalDeposited' | 'totalWithdrawn' | 'totalInterestCredited' | 'accruedInterestUnposted' | 'status'>): SavingsAccount => {
    const nextNum = 1000 + accounts.length + 1;
    const code = accData.isFlexible ? 'FX' : accData.planType === 'daily' ? 'DS' : accData.planType === 'monthly' ? 'RD' : 'ST';
    const accNumber = `VSMPL-${code}-${nextNum}`;
    const currentYear = new Date().getFullYear();
    const bondNumber = `BND-${currentYear}-${String(nextNum).padStart(6, '0')}`;
    const newAcc: SavingsAccount = {
      ...accData,
      id: `ACC-2025-${String(nextNum).slice(-3)}`,
      accountNumber: accNumber,
      bondNumber,
      initialDeposit: accData.installmentAmount || 0,
      currentBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalInterestCredited: 0,
      accruedInterestUnposted: 0,
      status: 'active',
      isFlexible: accData.isFlexible ?? (accData.planType === 'flexi')
    };
    setAccounts(prev => [newAcc, ...prev]);
    addAudit('नया बचत खाता व बांड जारी (Account & Bond Issued)', `खाता: ${accNumber}, बांड सं: ${bondNumber}, ग्राहक ID: ${newAcc.customerId}, योजना: ${newAcc.planNameHindi}`);
    return newAcc;
  };

  const addDeposit = (params: {
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    employeeId: string;
    remarks?: string;
    referenceNo?: string;
    gpsLocation?: string;
    coordinates?: { latitude: number; longitude: number; accuracy?: number };
  }): Transaction => {
    const targetAccount = accounts.find(a => a.id === params.accountId);
    if (!targetAccount) {
      throw new Error('खाता नहीं मिला (Account not found)');
    }

    const customer = customers.find(c => c.id === targetAccount.customerId);
    const employee = employees.find(e => e.id === params.employeeId) || employees[0];
    const branch = branches.find(b => b.id === targetAccount.branchId) || branches[0];

    const prevBal = targetAccount.currentBalance;
    const newBal = prevBal + Number(params.amount);
    const now = new Date();
    const txnNumber = 1000 + transactions.length + 1;
    const rcpNumber = `RCP-${txnNumber}`;
    const txnId = `TXN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(txnNumber).slice(-3)}`;

    const newTxn: Transaction = {
      id: txnId,
      receiptNumber: rcpNumber,
      accountId: targetAccount.id,
      accountNumber: targetAccount.accountNumber,
      customerId: targetAccount.customerId,
      customerNameHindi: customer ? customer.nameHindi : 'अज्ञात ग्राहक',
      customerNameEnglish: customer ? customer.nameEnglish : 'Customer',
      type: 'deposit',
      amount: Number(params.amount),
      date: now.toISOString(),
      displayDate: formatDateDDMMYYYY(now),
      paymentMethod: params.paymentMethod,
      previousBalance: prevBal,
      currentBalance: newBal,
      employeeId: employee.id,
      employeeName: employee.nameHindi,
      branchId: branch.id,
      branchName: branch.nameHindi,
      gpsLocation: params.gpsLocation || 'नौरंगिया बरगहा, कुशीनगर',
      coordinates: params.coordinates,
      remarks: params.remarks || (targetAccount.isFlexible ? 'फ्लेक्सी ऐच्छिक बचत संग्रह' : 'बचत संग्रह'),
      referenceNo: params.referenceNo
    };

    // Update account
    setAccounts(prev => prev.map(a => {
      if (a.id === targetAccount.id) {
        return {
          ...a,
          currentBalance: newBal,
          totalDeposited: a.totalDeposited + Number(params.amount)
        };
      }
      return a;
    }));

    // Update customer visit status to visited_collected
    if (customer) {
      setCustomers(prev => prev.map(c => {
        if (c.id === customer.id) {
          return {
            ...c,
            visitStatus: 'visited_collected'
          };
        }
        return c;
      }));
    }

    // Update individual employee cash ledger
    setEmployees(prev => prev.map(e => {
      if (e.id === employee.id) {
        const isCash = params.paymentMethod === 'cash';
        const isUpi = params.paymentMethod === 'upi';
        const isBank = params.paymentMethod === 'bank_transfer';

        return {
          ...e,
          cashInHand: isCash ? (e.cashInHand || 0) + Number(params.amount) : (e.cashInHand || 0),
          todayCollectedAmount: (e.todayCollectedAmount || 0) + Number(params.amount),
          upiCollectedToday: isUpi ? (e.upiCollectedToday || 0) + Number(params.amount) : (e.upiCollectedToday || 0),
          bankCollectedToday: isBank ? (e.bankCollectedToday || 0) + Number(params.amount) : (e.bankCollectedToday || 0)
        };
      }
      return e;
    }));

    setTransactions(prev => [newTxn, ...prev]);

    addAudit(
      'जमा प्रविष्टि (Savings Deposit)',
      `रकम: ₹${params.amount}, खाता: ${targetAccount.accountNumber}, ग्राहक: ${newTxn.customerNameHindi}, माध्यम: ${params.paymentMethod.toUpperCase()}`,
      employee.nameHindi,
      'field_agent'
    );

    return newTxn;
  };

  const makeWithdrawal = (params: {
    accountId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    withdrawalReason: string;
    authorizedBy: string;
    employeeId: string;
    remarks?: string;
  }): { success: boolean; transaction?: Transaction; message?: string } => {
    const targetAccount = accounts.find(a => a.id === params.accountId);
    if (!targetAccount) {
      return { success: false, message: 'खाता नहीं मिला (Account not found)' };
    }

    if (params.amount <= 0) {
      return { success: false, message: 'अमान्य राशि दर्ज की गई (Invalid amount)' };
    }

    if (params.amount > targetAccount.currentBalance) {
      return {
        success: false,
        message: `अपर्याप्त बैलेंस! वर्तमान बैलेंस केवल ₹${targetAccount.currentBalance} है। (Insufficient balance)`
      };
    }

    const customer = customers.find(c => c.id === targetAccount.customerId);
    const employee = employees.find(e => e.id === params.employeeId) || employees[0];
    const branch = branches.find(b => b.id === targetAccount.branchId) || branches[0];

    const prevBal = targetAccount.currentBalance;
    const newBal = prevBal - Number(params.amount);
    const now = new Date();
    const txnNumber = 1000 + transactions.length + 1;
    const rcpNumber = `WDR-${txnNumber}`;
    const txnId = `TXN-WDR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(txnNumber).slice(-3)}`;

    const newTxn: Transaction = {
      id: txnId,
      receiptNumber: rcpNumber,
      accountId: targetAccount.id,
      accountNumber: targetAccount.accountNumber,
      customerId: targetAccount.customerId,
      customerNameHindi: customer ? customer.nameHindi : 'अज्ञात ग्राहक',
      customerNameEnglish: customer ? customer.nameEnglish : 'Customer',
      type: 'withdrawal',
      amount: Number(params.amount),
      date: now.toISOString(),
      displayDate: formatDateDDMMYYYY(now),
      paymentMethod: params.paymentMethod,
      previousBalance: prevBal,
      currentBalance: newBal,
      employeeId: employee.id,
      employeeName: employee.nameHindi,
      branchId: branch.id,
      branchName: branch.nameHindi,
      withdrawalReason: params.withdrawalReason,
      authorizedBy: params.authorizedBy,
      remarks: params.remarks || 'स्वीकृत बचत निकासी'
    };

    setAccounts(prev => prev.map(a => {
      if (a.id === targetAccount.id) {
        return {
          ...a,
          currentBalance: newBal,
          totalWithdrawn: a.totalWithdrawn + Number(params.amount)
        };
      }
      return a;
    }));

    setTransactions(prev => [newTxn, ...prev]);

    addAudit(
      'निकासी स्वीकृति (Savings Withdrawal)',
      `रकम: ₹${params.amount}, खाता: ${targetAccount.accountNumber}, ग्राहक: ${newTxn.customerNameHindi}, अधिकृत अधिकारी: ${params.authorizedBy}`,
      params.authorizedBy,
      'admin'
    );

    return { success: true, transaction: newTxn };
  };

  const reverseTransaction = (txnId: string, reason: string, reversedBy: string): { success: boolean; message: string } => {
    const txn = transactions.find(t => t.id === txnId);
    if (!txn) {
      return { success: false, message: 'ट्रांजैक्शन नहीं मिला (Transaction not found)' };
    }
    if (txn.isReversed) {
      return { success: false, message: 'यह ट्रांजैक्शन पहले से रिवर्स किया जा चुका है (Already reversed)' };
    }

    const targetAccount = accounts.find(a => a.id === txn.accountId);
    if (!targetAccount) {
      return { success: false, message: 'संबंधित खाता नहीं मिला' };
    }

    let revisedBalance = targetAccount.currentBalance;
    if (txn.type === 'deposit') {
      if (targetAccount.currentBalance < txn.amount) {
        return { success: false, message: 'रिवर्सल असफल: खाते में पर्याप्त शेष राशि नहीं है।' };
      }
      revisedBalance = targetAccount.currentBalance - txn.amount;
    } else if (txn.type === 'withdrawal') {
      revisedBalance = targetAccount.currentBalance + txn.amount;
    }

    const now = new Date();
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        return {
          ...t,
          isReversed: true,
          reversalReason: reason,
          reversedAt: now.toISOString(),
          reversedBy
        };
      }
      return t;
    }));

    setAccounts(prev => prev.map(a => {
      if (a.id === targetAccount.id) {
        return {
          ...a,
          currentBalance: revisedBalance,
          totalDeposited: txn.type === 'deposit' ? a.totalDeposited - txn.amount : a.totalDeposited,
          totalWithdrawn: txn.type === 'withdrawal' ? a.totalWithdrawn - txn.amount : a.totalWithdrawn
        };
      }
      return a;
    }));

    addAudit(
      'ट्रांजैक्शन रिवर्सल (Transaction Reversed)',
      `TXN ID: ${txnId}, राशि: ₹${txn.amount}, कारण: ${reason}, अधिकृत अधिकारी: ${reversedBy}`,
      reversedBy,
      'admin'
    );

    return { success: true, message: 'ट्रांजैक्शन सफलतापूर्वक रिवर्स कर दिया गया है।' };
  };

  const postInterestAccrual = (
    accountId: string,
    amount: number,
    authorizedBy: string
  ): { success: boolean; message: string; transaction?: Transaction } => {
    const targetAccount = accounts.find(a => a.id === accountId);
    if (!targetAccount) {
      return { success: false, message: 'खाता नहीं मिला' };
    }
    if (amount <= 0) {
      return { success: false, message: 'ब्याज राशि शून्य या अमान्य है' };
    }

    const customer = customers.find(c => c.id === targetAccount.customerId);
    const branch = branches.find(b => b.id === targetAccount.branchId) || branches[0];
    const prevBal = targetAccount.currentBalance;
    const newBal = prevBal + amount;
    const now = new Date();
    const txnNumber = 1000 + transactions.length + 1;
    const rcpNumber = `INT-${txnNumber}`;
    const txnId = `TXN-INT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(txnNumber).slice(-3)}`;

    const newTxn: Transaction = {
      id: txnId,
      receiptNumber: rcpNumber,
      accountId: targetAccount.id,
      accountNumber: targetAccount.accountNumber,
      customerId: targetAccount.customerId,
      customerNameHindi: customer ? customer.nameHindi : 'ग्राहक',
      customerNameEnglish: customer ? customer.nameEnglish : 'Customer',
      type: 'interest_credit',
      amount,
      date: now.toISOString(),
      displayDate: formatDateDDMMYYYY(now),
      paymentMethod: 'bank_transfer',
      previousBalance: prevBal,
      currentBalance: newBal,
      employeeId: 'EMP-ADMIN',
      employeeName: authorizedBy,
      branchId: branch.id,
      branchName: branch.nameHindi,
      authorizedBy,
      remarks: 'दैनिक शेष आधारित अधिकृत ब्याज क्रेडिट'
    };

    setAccounts(prev => prev.map(a => {
      if (a.id === targetAccount.id) {
        return {
          ...a,
          currentBalance: newBal,
          totalInterestCredited: a.totalInterestCredited + amount,
          accruedInterestUnposted: 0,
          lastInterestCalculatedDate: now.toISOString().split('T')[0]
        };
      }
      return a;
    }));

    setTransactions(prev => [newTxn, ...prev]);

    addAudit(
      'ब्याज पोस्टिंग (Interest Credited)',
      `खाता: ${targetAccount.accountNumber}, उपार्जित ब्याज: ₹${amount}, अधिकृत अधिकारी: ${authorizedBy}`,
      authorizedBy,
      'admin'
    );

    return { success: true, message: `सफलतापूर्वक ₹${amount} ब्याज खाते में क्रेडिट हुआ।`, transaction: newTxn };
  };

  const punchInAttendance = (
    employeeId: string,
    location = 'नौरंगिया फील्ड क्षेत्र',
    coords?: { latitude: number; longitude: number; accuracy?: number }
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          isPunchedIn: true,
          punchInTime: timeStr,
          punchInLocation: coords ? `${location} (${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E)` : location
        };
      }
      return e;
    }));
    addAudit('हाजिरी पंच-इन (Attendance Punch In)', `कर्मचारी: ${employeeId}, स्थान: ${location}`);
  };

  const punchOutAttendance = (employeeId: string, location = 'कार्यालय प्रस्थान') => {
    setEmployees(prev => prev.map(e => {
      if (e.id === employeeId) {
        return {
          ...e,
          isPunchedIn: false
        };
      }
      return e;
    }));
    addAudit('हाजिरी पंच-आउट (Attendance Punch Out)', `कर्मचारी: ${employeeId}, स्थान: ${location}`);
  };

  const submitDailyClosing = (closing: Omit<DailyCashClosing, 'id'>) => {
    // Deduct cash from employee cash in hand
    setEmployees(prev => prev.map(e => {
      if (e.id === closing.employeeId) {
        const remaining = Math.max(0, (e.cashInHand || 0) - closing.submittedToOffice);
        return {
          ...e,
          cashInHand: remaining,
          cashSubmittedToOffice: (e.cashSubmittedToOffice || 0) + closing.submittedToOffice
        };
      }
      return e;
    }));

    addAudit(
      'दैनिक कैश क्लोजिंग जमा (Daily Cash Handover)',
      `कर्मचारी: ${closing.employeeName}, जमा राशि: ₹${closing.submittedToOffice}, अंतर: ₹${closing.shortOrExcess}`,
      closing.verifiedBy,
      'accountant'
    );
  };

  // Perform End of Day Closing (एक ही बटन में आज का पूरा हिसाब बंद करें)
  const performEODClosing = (closedBy: string): DayClosingSummary => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTxns = transactions.filter(t => t.date.startsWith(todayStr) && !t.isReversed);

    const deposits = todayTxns.filter(t => t.type === 'deposit');
    const withdrawals = todayTxns.filter(t => t.type === 'withdrawal');

    const totalDep = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWdr = withdrawals.reduce((sum, t) => sum + t.amount, 0);

    const cashDep = deposits.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
    const upiDep = deposits.filter(t => t.paymentMethod === 'upi').reduce((sum, t) => sum + t.amount, 0);
    const bankDep = deposits.filter(t => t.paymentMethod === 'bank_transfer').reduce((sum, t) => sum + t.amount, 0);

    const uniqueCusts = new Set(todayTxns.map(t => t.customerId)).size;

    // Total unposted accrued interest across all active accounts
    const totalAccruedInt = accounts.reduce((sum, a) => sum + (a.accruedInterestUnposted || 0), 0);

    // Employee breakdown
    const empBreakdown = employees.map(emp => {
      const empTodayTxns = deposits.filter(t => t.employeeId === emp.id);
      const empCashCollected = empTodayTxns.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
      const submitted = emp.cashSubmittedToOffice || 0;
      const diff = empCashCollected - submitted;
      return {
        employeeId: emp.id,
        employeeName: emp.nameHindi,
        collected: empCashCollected,
        submitted,
        diff,
        status: diff === 0 ? 'पूर्ण मिलान' : diff > 0 ? `₹${diff} कैश बाकी` : `अतिरिक्त जमा`
      };
    });

    const pendingDiscrepancies = empBreakdown.reduce((sum, e) => sum + Math.abs(e.diff), 0);

    const summary: DayClosingSummary = {
      date: formatDateDDMMYYYY(new Date()),
      closedAt: new Date().toLocaleTimeString(),
      closedBy,
      totalDepositAmount: totalDep,
      totalWithdrawalAmount: totalWdr,
      cashInOfficeReceived: cashDep,
      upiTotalReceived: upiDep,
      bankTotalReceived: bankDep,
      customersServedCount: uniqueCusts,
      totalInterestPayableAccrued: totalAccruedInt,
      pendingCashDiscrepancies: pendingDiscrepancies,
      employeeBreakdowns: empBreakdown
    };

    setEodReport(summary);

    addAudit(
      'आज का हिसाब बंद (End of Day Closing Executed)',
      `कुल जमा: ₹${totalDep}, कुल निकासी: ₹${totalWdr}, कैश: ₹${cashDep}, UPI: ₹${upiDep}, अधिकारी: ${closedBy}`,
      closedBy,
      'admin'
    );

    return summary;
  };

  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const nextNum = 101 + employees.length;
    const newEmp: Employee = {
      ...empData,
      id: `EMP-${nextNum}`,
      todayCollectedAmount: 0,
      cashInHand: empData.openingCash || 0,
      cashSubmittedToOffice: 0,
      isPunchedIn: false
    };
    setEmployees(prev => [...prev, newEmp]);
    addAudit('नया कर्मचारी जोड़ा गया (Employee Added)', `कर्मचारी: ${newEmp.nameHindi} (${newEmp.id}), पद: ${newEmp.role}`);
    return newEmp;
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    addAudit('कर्मचारी विवरण अद्यतन (Employee Updated)', `कर्मचारी: ${emp.nameHindi} (${emp.id})`);
  };

  const updateCompliance = (cfg: Partial<ComplianceConfig>) => {
    setCompliance(prev => ({ ...prev, ...cfg }));
    addAudit('नियामकीय अनुपालन अद्यतन (Compliance Updated)', 'कंपनी अनुपालन व वैधानिक स्थिति अपडेट की गई');
  };

  const exportDatabaseBackup = () => {
    const backupData = {
      version: '3.0.0',
      exportDate: new Date().toISOString(),
      company: COMPANY_DETAILS,
      customers,
      accounts,
      plans,
      transactions,
      employees,
      branches,
      auditLogs,
      compliance
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vrindavan_savings_backup_${formatDateDDMMYYYY(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addAudit('सिस्टम बैकअप डाउनलोड (Database Backup Exported)', 'पूरा डेटाबेस JSON फाइल में बैकअप लिया गया');
  };

  const importDatabaseBackup = (jsonStr: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.customers || !data.accounts || !data.transactions) {
        return { success: false, message: 'अमान्य बैकअप फाइल प्रारूप (Invalid backup structure)' };
      }
      setCustomers(data.customers);
      setAccounts(data.accounts);
      setTransactions(data.transactions);
      if (data.plans) setPlans(data.plans);
      if (data.employees) setEmployees(data.employees);
      if (data.compliance) setCompliance(data.compliance);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      addAudit('बैकअप रीस्टोर (Database Restored)', 'बैकअप फाइल से डेटा सफलतापूर्वक रीस्टोर किया गया');
      return { success: true, message: 'डेटाबेस बैकअप सफलतापूर्वक रीस्टोर हो गया।' };
    } catch {
      return { success: false, message: 'बैकअप फाइल को पढ़ने में त्रुटि हुई।' };
    }
  };

  const resetToDemoData = () => {
    setCustomers(DEFAULT_CUSTOMERS);
    setAccounts(DEFAULT_ACCOUNTS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setPlans(DEFAULT_PLANS);
    setEmployees(DEFAULT_EMPLOYEES);
    setAuditLogs(DEFAULT_AUDIT_LOGS);
    setCompliance(DEFAULT_COMPLIANCE);
    addAudit('डेटाबेस रीसेट (Reset to Default)', 'डेटाबेस प्रारंभिक डेमो स्थिति में रीसेट किया गया');
  };

  return (
    <SavingsContext.Provider
      value={{
        company: COMPANY_DETAILS,
        customers,
        accounts,
        plans,
        transactions,
        employees,
        branches,
        auditLogs,
        compliance,
        currentRole,
        setCurrentRole,
        selectedEmployeeId,
        setSelectedEmployeeId,
        language,
        setLanguage,
        isQuickMode,
        setIsQuickMode,
        receiptForPrint,
        setReceiptForPrint,
        passbookForPrint,
        setPassbookForPrint,
        bondForPrint,
        setBondForPrint,
        eodReport,
        setEodReport,
        addCustomer,
        updateCustomer,
        openAccount,
        addDeposit,
        makeWithdrawal,
        reverseTransaction,
        postInterestAccrual,
        punchInAttendance,
        punchOutAttendance,
        updateCustomerVisit,
        submitDailyClosing,
        performEODClosing,
        addEmployee,
        updateEmployee,
        updateCompliance,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetToDemoData
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavingsData = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavingsData must be used within a SavingsDataProvider');
  }
  return context;
};
