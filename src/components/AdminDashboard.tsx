import React from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import {
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Building,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FileText,
  UserPlus,
  PlusCircle,
  BookOpen,
  CheckCircle,
  Zap,
  MapPin
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onTriggerEOD: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onTriggerEOD }) => {
  const { customers, accounts, transactions, employees, branches, company, setReceiptForPrint, setIsQuickMode } = useSavingsData();

  // Metrics
  const totalCustomers = customers.length;
  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const flexibleAccounts = accounts.filter(a => a.isFlexible).length;

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit' && !t.isReversed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && !t.isReversed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAvailableBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr) && !t.isReversed);
  const todayCollection = todayTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const todayWithdrawals = todayTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthStr = todayStr.slice(0, 7);
  const monthCollection = transactions
    .filter(t => t.type === 'deposit' && !t.isReversed && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEmployeeCashInHand = employees.reduce((sum, e) => sum + (e.cashInHand || 0), 0);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-emerald-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest bg-emerald-700/80 text-emerald-200 px-2.5 py-0.5 rounded-full">
              Admin Control Center
            </span>
            <span className="text-xs text-emerald-300 font-mono">
              CIN: {company.cin}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {company.hindiName}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            फ्लेक्सी बचत • डिजिटल + प्रिंटेड पासबुक • फील्ड कलेक्शन • पारदर्शी डे-बुक
          </p>
        </div>

        {/* Hero Actions */}
        <div className="z-10 flex flex-wrap items-center gap-2.5">
          {/* EOD Closing Button */}
          <button
            onClick={onTriggerEOD}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-black transition shadow-md flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-slate-950" />
            <span>आज का हिसाब बंद करें (EOD Closing)</span>
          </button>

          <button
            onClick={() => onNavigate('quick_mode')}
            className="bg-white/10 hover:bg-white/20 text-emerald-200 border border-emerald-500/50 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-emerald-300" />
            <span>सरल बड़ा बटन मोड</span>
          </button>

          <button
            onClick={() => onNavigate('deposit')}
            className="bg-white text-emerald-950 hover:bg-emerald-50 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>जमा (Deposit)</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers & Flexi Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">कुल ग्राहक</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{totalCustomers}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>फ्लेक्सी खाते: <strong className="text-emerald-800">{flexibleAccounts}</strong> (सक्रिय)</span>
            </div>
          </div>
        </div>

        {/* Today's Deposit */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">आज का जमा संग्रह</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-950 font-mono">{formatINR(todayCollection)}</div>
            <div className="text-[11px] text-emerald-800 mt-1">
              माह का संग्रह: <strong>{formatINR(monthCollection)}</strong>
            </div>
          </div>
        </div>

        {/* Total Savings Deposits / Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">कुल जमा बैलेंस</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">{formatINR(totalAvailableBalance)}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              कुल आवक: {formatINR(totalDeposits)}
            </div>
          </div>
        </div>

        {/* Employees Cash In Hand */}
        <div className="bg-white p-5 rounded-2xl border border-slate-900 bg-slate-900 text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">फील्ड कैश बकाया</span>
            <div className="p-2 bg-emerald-900/60 text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-300 font-mono">{formatINR(totalEmployeeCashInHand)}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              कर्मचारी हाथ में नकद (जमा योग्य)
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Employee Field Tracking & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Field Team Live Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>फील्ड संग्रहकर्ता स्थिति (Field Staff Tracking)</span>
              <Building className="w-4 h-4 text-emerald-700" />
            </h3>

            <div className="space-y-3">
              {employees.map(emp => {
                const assigned = customers.filter(c => c.assignedEmployeeId === emp.id).length;
                return (
                  <div key={emp.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900 font-bold">{emp.nameHindi}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">({emp.id})</span>
                      </div>
                      <span className="font-mono font-extrabold text-emerald-900">
                        हाथ में: {formatINR(emp.cashInHand || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>आवंटित ग्राहक: {assigned}</span>
                      <span>आज संग्रह: {formatINR(emp.todayCollectedAmount || 0)}</span>
                    </div>

                    {emp.punchInLocation && (
                      <div className="text-[10px] text-emerald-800 flex items-center gap-1 font-mono pt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="truncate">{emp.punchInLocation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Navigator Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('calculator')}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 transition text-left shadow-2xs group"
            >
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-2 group-hover:bg-emerald-700 group-hover:text-white transition">
                <TrendingUp className="w-4 h-4" />
              </div>
              <strong className="text-xs font-bold text-slate-900 block">ब्याज लेजर</strong>
              <span className="text-[10px] text-slate-500">दैनिक बैलेंस ब्याज शेड्यूल</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 transition text-left shadow-2xs group"
            >
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl w-fit mb-2 group-hover:bg-blue-700 group-hover:text-white transition">
                <FileText className="w-4 h-4" />
              </div>
              <strong className="text-xs font-bold text-slate-900 block">दैनिक डे-बुक</strong>
              <span className="text-[10px] text-slate-500">रोकड़ बही व ऑडिट रिपोर्ट</span>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Transactions Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  हाल के वित्तीय लेनदेन (Recent Financial Feed)
                </h3>
                <span className="text-[11px] text-slate-500">
                  नवीनतम जमा, निकासी व डिजिटल रसीदें
                </span>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                सभी देखें →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {recentTransactions.map(t => {
                const isDep = t.type === 'deposit';
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isDep
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isDep ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {t.customerNameHindi}{' '}
                          <span className="text-slate-500 font-normal text-[11px]">({t.accountNumber})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {t.receiptNumber} • {t.displayDate} • {t.employeeName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-mono font-extrabold text-sm ${isDep ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isDep ? '+' : '-'} {formatINR(t.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          शेष: {formatINR(t.currentBalance)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReceiptForPrint(t)}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-lg transition"
                        title="VIP रसीद खोलें"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center mt-3">
            <span>* सुरक्षित डिजिटल लेजर: केवल अधिकृत रिवर्सल की अनुमति है।</span>
            <span className="font-mono text-emerald-900 font-bold">VRINDAVAN SMALL MICROFINANCE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
