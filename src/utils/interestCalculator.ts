/**
 * Financial Interest Calculation Engine
 * Vrindavan Small Microfinance Private Limited
 */

import { Transaction, SavingsAccount } from '../types';

export interface InterestCalcParams {
  principalOrInstallment: number;
  annualRate: number; // e.g., 7.5 (%)
  durationMonths: number;
  durationDays?: number;
  calculationType: 'simple' | 'compound_daily' | 'compound_monthly' | 'compound_yearly';
  depositFrequency: 'lump_sum' | 'daily' | 'weekly' | 'monthly' | 'flexi';
  dayCountBasis?: 365 | 366;
  startDate?: string;
}

export interface InterestBreakdownItem {
  period: string; // e.g. "माह 1" or "महीना 1 (Month 1)"
  openingBalance: number;
  depositAmount: number;
  interestEarned: number;
  closingBalance: number;
}

export interface InterestCalcResult {
  totalDeposited: number;
  totalInterest: number;
  maturityAmount: number;
  maturityDateStr: string;
  effectiveYieldAnnual: number;
  formulaDescriptionHindi: string;
  formulaDescriptionEnglish: string;
  breakdown: InterestBreakdownItem[];
}

/**
 * Calculates interest for lump-sum or recurring daily/monthly/flexi savings
 */
export function calculateSavingsInterest(params: InterestCalcParams): InterestCalcResult {
  const {
    principalOrInstallment,
    annualRate,
    durationMonths,
    calculationType,
    depositFrequency,
    dayCountBasis = 365,
    startDate = new Date().toISOString()
  } = params;

  const P = Math.max(0, principalOrInstallment);
  const R = Math.max(0, annualRate);
  const months = Math.max(1, durationMonths);
  const totalDays = params.durationDays ? params.durationDays : Math.round(months * 30.4167);

  // Compute Maturity Date
  const startD = new Date(startDate);
  const maturityDate = new Date(startD);
  maturityDate.setMonth(maturityDate.getMonth() + months);
  if (params.durationDays) {
    maturityDate.setTime(startD.getTime() + params.durationDays * 24 * 60 * 60 * 1000);
  }
  const maturityDay = String(maturityDate.getDate()).padStart(2, '0');
  const maturityMonth = String(maturityDate.getMonth() + 1).padStart(2, '0');
  const maturityYear = maturityDate.getFullYear();
  const maturityDateStr = `${maturityDay}-${maturityMonth}-${maturityYear}`;

  let totalDeposited = 0;
  let totalInterest = 0;
  let maturityAmount = 0;
  const breakdown: InterestBreakdownItem[] = [];

  // 1. FLEXIBLE SAVINGS & LUMP SUM
  if (depositFrequency === 'lump_sum' || depositFrequency === 'flexi') {
    totalDeposited = P;
    const T_years = totalDays / dayCountBasis;

    if (calculationType === 'simple') {
      totalInterest = (P * R * totalDays) / (dayCountBasis * 100);
      maturityAmount = totalDeposited + totalInterest;
    } else if (calculationType === 'compound_daily') {
      const r_daily = R / (100 * dayCountBasis);
      maturityAmount = P * Math.pow(1 + r_daily, totalDays);
      totalInterest = maturityAmount - totalDeposited;
    } else if (calculationType === 'compound_monthly') {
      const r_monthly = R / (100 * 12);
      maturityAmount = P * Math.pow(1 + r_monthly, months);
      totalInterest = maturityAmount - totalDeposited;
    } else {
      // compound_yearly
      const r_yearly = R / 100;
      maturityAmount = P * Math.pow(1 + r_yearly, T_years);
      totalInterest = maturityAmount - totalDeposited;
    }

    // Generate monthly milestone breakdown
    let runningBal = P;
    const monthlyRate = R / (12 * 100);
    for (let m = 1; m <= Math.min(months, 36); m++) {
      const interestThisMonth = runningBal * monthlyRate;
      const closing = runningBal + interestThisMonth;
      breakdown.push({
        period: `माह ${m} (Month ${m})`,
        openingBalance: Math.round(runningBal),
        depositAmount: m === 1 ? P : 0,
        interestEarned: Math.round(interestThisMonth),
        closingBalance: Math.round(closing)
      });
      runningBal = closing;
    }
  } 
  // 2. DAILY RECURRING SAVINGS (दैनिक बचत)
  else if (depositFrequency === 'daily') {
    const days = totalDays;
    totalDeposited = P * days;
    
    const dailyRate = R / (dayCountBasis * 100);
    const sumDays = (days * (days + 1)) / 2;
    totalInterest = P * dailyRate * sumDays;
    maturityAmount = totalDeposited + totalInterest;

    let runningBalance = 0;
    const daysPerMonth = Math.round(days / months);
    for (let m = 1; m <= months; m++) {
      const openBal = runningBalance;
      const monthDeposit = P * daysPerMonth;
      const monthInterest = (openBal + monthDeposit / 2) * (R / 1200);
      runningBalance = openBal + monthDeposit + monthInterest;
      breakdown.push({
        period: `माह ${m} (${daysPerMonth} दिन)`,
        openingBalance: Math.round(openBal),
        depositAmount: Math.round(monthDeposit),
        interestEarned: Math.round(monthInterest),
        closingBalance: Math.round(runningBalance)
      });
    }
  }
  // 3. MONTHLY RECURRING SAVINGS (मासिक आरडी / बचत)
  else if (depositFrequency === 'monthly') {
    totalDeposited = P * months;

    if (calculationType === 'simple') {
      totalInterest = (P * months * (months + 1) * R) / (2400);
      maturityAmount = totalDeposited + totalInterest;
    } else {
      const i = R / 1200;
      if (i > 0) {
        maturityAmount = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
        totalInterest = maturityAmount - totalDeposited;
      } else {
        maturityAmount = totalDeposited;
        totalInterest = 0;
      }
    }

    let runningBalance = 0;
    const i = R / 1200;
    for (let m = 1; m <= months; m++) {
      const openBal = runningBalance;
      const monthDeposit = P;
      const monthInterest = (openBal + monthDeposit) * i;
      runningBalance = openBal + monthDeposit + monthInterest;
      breakdown.push({
        period: `माह ${m} (Month ${m})`,
        openingBalance: Math.round(openBal),
        depositAmount: P,
        interestEarned: Math.round(monthInterest),
        closingBalance: Math.round(runningBalance)
      });
    }
  }
  // 4. WEEKLY RECURRING SAVINGS
  else {
    const totalWeeks = Math.round((totalDays / 7));
    totalDeposited = P * totalWeeks;
    const weeklyRate = R / (52 * 100);
    const sumWeeks = (totalWeeks * (totalWeeks + 1)) / 2;
    totalInterest = P * weeklyRate * sumWeeks;
    maturityAmount = totalDeposited + totalInterest;

    let runningBal = 0;
    const weeksPerMonth = Math.max(1, Math.round(totalWeeks / months));
    for (let m = 1; m <= months; m++) {
      const open = runningBal;
      const dep = P * weeksPerMonth;
      const intE = (open + dep / 2) * (R / 1200);
      runningBal = open + dep + intE;
      breakdown.push({
        period: `माह ${m} (${weeksPerMonth} सप्ताह)`,
        openingBalance: Math.round(open),
        depositAmount: Math.round(dep),
        interestEarned: Math.round(intE),
        closingBalance: Math.round(runningBal)
      });
    }
  }

  const effectiveYieldAnnual = totalDeposited > 0 ? (totalInterest / totalDeposited) * (12 / months) * 100 : 0;

  // Formula description
  let formulaHindi = '';
  let formulaEnglish = '';
  if (depositFrequency === 'daily') {
    formulaHindi = `दैनिक किस्त पर ब्याज = किस्त × (वार्षिक दर ÷ 36500) × [दिन × (दिन + 1) ÷ 2]`;
    formulaEnglish = `Daily Installment Interest = P × (R / 36500) × [N × (N + 1) / 2]`;
  } else if (depositFrequency === 'monthly') {
    formulaHindi = `मासिक आरडी ब्याज = मासिक किस्त × n(n+1) ÷ 24 × (वार्षिक दर % ÷ 100)`;
    formulaEnglish = `Monthly RD Interest = P × n(n + 1) / 24 × (R / 100)`;
  } else if (depositFrequency === 'flexi') {
    formulaHindi = `फ्लेक्सी बचत: प्रत्येक दिन के क्लोजिंग बैलेंस पर दैनिक ब्याज = (दैनिक शेष × दर) ÷ (365 × 100)`;
    formulaEnglish = `Flexible Savings: Daily Interest = (Daily Closing Balance × R) / (365 × 100)`;
  } else {
    formulaHindi = calculationType === 'simple'
      ? `साधारण ब्याज = (मूलधन × वार्षिक दर % × दिन) ÷ 36500`
      : `चक्रवृद्धि ब्याज = मूलधन × (1 + दर ÷ आवृत्ति)^(आवृत्ति × वर्ष) - मूलधन`;
    formulaEnglish = calculationType === 'simple'
      ? `Simple Interest = (P × R × T) / 100`
      : `Compound Interest = P × (1 + r/n)^(nt) - P`;
  }

  return {
    totalDeposited: Math.round(totalDeposited),
    totalInterest: Math.round(totalInterest),
    maturityAmount: Math.round(maturityAmount),
    maturityDateStr,
    effectiveYieldAnnual: parseFloat(effectiveYieldAnnual.toFixed(2)),
    formulaDescriptionHindi: formulaHindi,
    formulaDescriptionEnglish: formulaEnglish,
    breakdown
  };
}

/**
 * Daily Balance-Based Actual Interest Engine
 * As specified in Section C:
 * Day 1 balance = 1000
 * Day 5 deposit = 500
 * Day 10 withdrawal = 200
 * Calculates exact daily accrued interest on daily eligible closing balance.
 */
export interface DailyBalanceInterestRow {
  date: string;
  dayNumber: number;
  openingBalance: number;
  depositAmount: number;
  withdrawalAmount: number;
  closingBalance: number;
  dailyInterestAccrued: number;
  cumulativeInterest: number;
}

export interface DailyBalanceLedgerResult {
  totalAccruedInterest: number;
  totalDeposited: number;
  totalWithdrawn: number;
  finalBalance: number;
  activeDaysCount: number;
  dailyRows: DailyBalanceInterestRow[];
  annualRate: number;
  dayCountBasis: number;
  formulaDescriptionHindi: string;
}

export function calculateDailyBalanceInterest(
  account: SavingsAccount,
  accountTransactions: Transaction[],
  dayCountBasis: 365 | 366 = 365,
  asOfDateStr?: string
): DailyBalanceLedgerResult {
  const annualRate = account.annualInterestRate || 6.5;
  const rateFactor = annualRate / (dayCountBasis * 100);

  // Sort transactions chronologically
  const validTxns = accountTransactions
    .filter(t => !t.isReversed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Determine date range: from openingDate to asOfDate or today
  const openingD = new Date(account.openingDate || validTxns[0]?.date || new Date());
  const endingD = asOfDateStr ? new Date(asOfDateStr) : new Date();

  // If opening is after ending, normalize
  if (openingD > endingD) {
    endingD.setTime(openingD.getTime() + 24 * 60 * 60 * 1000);
  }

  // Map transactions by YYYY-MM-DD
  const txnsByDate: Record<string, { deposits: number; withdrawals: number }> = {};
  for (const t of validTxns) {
    const dStr = t.date.split('T')[0];
    if (!txnsByDate[dStr]) {
      txnsByDate[dStr] = { deposits: 0, withdrawals: 0 };
    }
    if (t.type === 'deposit') {
      txnsByDate[dStr].deposits += t.amount;
    } else if (t.type === 'withdrawal') {
      txnsByDate[dStr].withdrawals += t.amount;
    }
  }

  const dailyRows: DailyBalanceInterestRow[] = [];
  let runningBalance = 0;
  let cumulativeInterest = 0;
  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let dayCounter = 1;

  const currentPtr = new Date(openingD);
  currentPtr.setHours(0, 0, 0, 0);
  const endLimit = new Date(endingD);
  endLimit.setHours(23, 59, 59, 999);

  // Maximum days guard to prevent excessive loops
  const maxDays = 730; // up to 2 years daily projection
  let daysCalculated = 0;

  while (currentPtr <= endLimit && daysCalculated < maxDays) {
    const dStr = currentPtr.toISOString().split('T')[0];
    const tx = txnsByDate[dStr] || { deposits: 0, withdrawals: 0 };

    const opening = runningBalance;
    const dep = tx.deposits;
    const wdr = tx.withdrawals;
    const closing = opening + dep - wdr;

    totalDeposited += dep;
    totalWithdrawn += wdr;

    // Daily interest on eligible closing balance
    const dailyInterest = closing > 0 ? closing * rateFactor : 0;
    cumulativeInterest += dailyInterest;

    // Record sample (every day with transaction or sample intervals to keep clean)
    dailyRows.push({
      date: dStr,
      dayNumber: dayCounter,
      openingBalance: Math.round(opening),
      depositAmount: dep,
      withdrawalAmount: wdr,
      closingBalance: Math.round(closing),
      dailyInterestAccrued: parseFloat(dailyInterest.toFixed(3)),
      cumulativeInterest: parseFloat(cumulativeInterest.toFixed(2))
    });

    runningBalance = closing;
    currentPtr.setDate(currentPtr.getDate() + 1);
    dayCounter++;
    daysCalculated++;
  }

  return {
    totalAccruedInterest: parseFloat(cumulativeInterest.toFixed(2)),
    totalDeposited,
    totalWithdrawn,
    finalBalance: runningBalance,
    activeDaysCount: daysCalculated,
    dailyRows,
    annualRate,
    dayCountBasis,
    formulaDescriptionHindi: `दैनिक शेष ब्याज = (दैनिक क्लोजिंग बैलेंस × ${annualRate}%) ÷ (${dayCountBasis} × 100)`
  };
}
