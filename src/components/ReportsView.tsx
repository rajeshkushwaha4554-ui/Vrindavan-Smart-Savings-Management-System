import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { Transaction } from '../types';
import { formatINR } from '../utils/transliteration';
import {
  FileText,
  Printer,
  Download,
  Search,
  Filter,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert
} from 'lucide-react';

interface ReportsViewProps {
  initialReport?: 'day_book' | 'daily' | 'monthly' | 'employee' | 'branch' | 'ledger';
}

export const ReportsView: React.FC<ReportsViewProps> = ({ initialReport = 'day_book' }) => {
  const {
    company,
    transactions,
    employees,
    branches,
    accounts,
    reverseTransaction,
    setReceiptForPrint
  } = useSavingsData();

  const [activeReport, setActiveReport] = useState<
    'day_book' | 'daily' | 'monthly' | 'employee' | 'branch' | 'ledger'
  >(initialReport);

  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reversal dialog state
  const [reversalTarget, setReversalTarget] = useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState('गलत प्रविष्टि संशोधन (Entry error correction)');
  const [reversalOfficer, setReversalOfficer] = useState('राजेश कुमार (शाखा प्रबंधक)');
  const [reversalMsg, setReversalMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Filter transactions
  const filteredTxns = transactions.filter(t => {
    const txnDate = t.date.split('T')[0];
    if (txnDate < fromDate || txnDate > toDate) return false;
    if (selectedBranch !== 'all' && t.branchId !== selectedBranch) return false;
    if (selectedEmployee !== 'all' && t.employeeId !== selectedEmployee) return false;
    if (selectedType !== 'all' && t.type !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.customerNameHindi.toLowerCase().includes(q) ||
        t.customerNameEnglish.toLowerCase().includes(q) ||
        t.accountNumber.toLowerCase().includes(q) ||
        t.receiptNumber.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Calculate Aggregates
  const totalDeposits = filteredTxns
    .filter(t => t.type === 'deposit' && !t.isReversed)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = filteredTxns
    .filter(t => t.type === 'withdrawal' && !t.isReversed)
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalDeposits - totalWithdrawals;

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // CSV / Excel Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Receipt No',
      'Date',
      'Customer Name',
      'Customer ID',
      'Account No',
      'Type',
      'Amount',
      'Payment Mode',
      'Previous Balance',
      'Current Balance',
      'Employee',
      'Branch',
      'Status'
    ];

    const rows = filteredTxns.map(t => [
      t.id,
      t.receiptNumber,
      t.displayDate,
      `"${t.customerNameHindi} (${t.customerNameEnglish})"`,
      t.customerId,
      t.accountNumber,
      t.type,
      t.amount,
      t.paymentMethod,
      t.previousBalance,
      t.currentBalance,
      `"${t.employeeName}"`,
      `"${t.branchName}"`,
      t.isReversed ? 'REVERSED' : 'ACTIVE'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vrindavan_report_${activeReport}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalTarget) return;

    const res = reverseTransaction(reversalTarget.id, reversalReason, reversalOfficer);
    setReversalMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setReversalTarget(null);
        setReversalMsg(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden on print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            पारदर्शी वित्तीय लेखांकन
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            रिपोर्टिंग व डे-बुक (Reports & Financial Day Book)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            दैनिक बचत, रोकड़ बही, कर्मचारी-वार संग्रह, शाखा रिपोर्ट एवं पूर्ण ऑडिट लेजर।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV डाउनलोड</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 रिपोर्ट प्रिंट (Print)</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs (hidden on print) */}
      <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { key: 'day_book', label: 'दैनिक रोकड़ बही (Day Book)' },
          { key: 'daily', label: 'दैनिक बचत रिपोर्ट (Daily Savings)' },
          { key: 'monthly', label: 'मासिक संग्रह रिपोर्ट (Monthly)' },
          { key: 'employee', label: 'कर्मचारी-वार रिपोर्ट (Employee-wise)' },
          { key: 'branch', label: 'शाखा-वार रिपोर्ट (Branch-wise)' },
          { key: 'ledger', label: 'ऑडिट वित्तीय लेजर (Audit Ledger)' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeReport === tab.key
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar (hidden on print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">प्रारंभ तारीख (From):</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">अंतिम तारीख (To):</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">शाखा फ़िल्टर (Branch):</label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">सभी शाखाएं (All Branches)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.nameHindi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">कर्मचारी (Employee):</label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">सभी कर्मचारी (All Employees)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nameHindi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">प्रकार (Type):</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            >
              <option value="all">सभी प्रकार (All Types)</option>
              <option value="deposit">जमा केवल (Deposits Only)</option>
              <option value="withdrawal">निकासी केवल (Withdrawals Only)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ग्राहक नाम, खाता संख्या या रसीद संख्या से खोजें..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* KPI Totals Strip (Printed also) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
          <span className="text-[11px] font-semibold text-emerald-800 block">कुल जमा आवक (Total Deposits)</span>
          <span className="text-xl font-mono font-extrabold text-emerald-900">{formatINR(totalDeposits)}</span>
        </div>

        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-center">
          <span className="text-[11px] font-semibold text-rose-800 block">कुल निकासी जावक (Total Withdrawals)</span>
          <span className="text-xl font-mono font-extrabold text-rose-900">{formatINR(totalWithdrawals)}</span>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 text-center shadow-xs">
          <span className="text-[11px] text-emerald-300 block font-semibold">शुद्ध नकदी प्रवाह (Net Flow)</span>
          <span className="text-xl font-mono font-extrabold text-emerald-400">{formatINR(netCashFlow)}</span>
        </div>
      </div>

      {/* Main Report Document Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print-container relative">
        {/* Subtle Watermark on Printable Report */}
        <div className="hidden print:flex absolute inset-0 items-center justify-center pointer-events-none opacity-[0.035] z-0">
          <img
            src={company.logoUrl || '/vrindavan_logo.jpeg'}
            alt="Watermark"
            className="w-[140mm] object-contain"
          />
        </div>

        {/* Printable Official Header (Shown when printing) */}
        <div className="hidden print:block p-6 border-b-2 border-emerald-900 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={company.logoUrl || '/vrindavan_logo.jpeg'}
                alt={company.legalName}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-black text-emerald-950">{company.legalName}</h1>
                <h2 className="text-sm font-bold text-emerald-800">{company.hindiName}</h2>
                <div className="text-xs text-slate-600 font-mono mt-1">
                  CIN: {company.cin} | {company.registeredOffice}
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-sm text-emerald-900 uppercase">
                {activeReport.replace('_', ' ')} REPORT
              </div>
              <div>अवधि: {fromDate} से {toDate}</div>
              <div>प्रिंट तिथि: {new Date().toLocaleDateString('hi-IN')}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
          <h3 className="text-sm font-bold text-slate-900">
            विस्तृत लेन-देन सूची ({filteredTxns.length} रिकॉर्ड)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            तिथि सीमा: {fromDate} से {toDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">रसीद सं.</th>
                <th className="py-3 px-3">तारीख</th>
                <th className="py-3 px-3">ग्राहक का नाम</th>
                <th className="py-3 px-3">खाता संख्या</th>
                <th className="py-3 px-3">प्रकार</th>
                <th className="py-3 px-3">माध्यम</th>
                <th className="py-3 px-3 text-right">राशि (₹)</th>
                <th className="py-3 px-3 text-right">बैलेंस</th>
                <th className="py-3 px-3">कर्मचारी</th>
                <th className="py-3 px-3 no-print text-center">कार्यवाही</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans text-xs">
                    चयनित अवधि में कोई लेनदेन नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredTxns.map(t => {
                  const isDep = t.type === 'deposit';
                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition ${
                        t.isReversed ? 'bg-amber-50/50 line-through text-slate-400' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-emerald-900 whitespace-nowrap">
                        {t.receiptNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{t.displayDate}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-900">{t.customerNameHindi}</div>
                        <div className="text-[10px] text-slate-500">{t.customerId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{t.accountNumber}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDep
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDep ? 'जमा' : 'निकासी'}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-[11px] text-slate-600">{t.paymentMethod}</td>
                      <td className={`py-3 px-3 text-right font-extrabold text-sm ${isDep ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isDep ? '+' : '-'} {formatINR(t.amount)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatINR(t.currentBalance)}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600 text-[11px]">
                        {t.employeeName}
                      </td>
                      <td className="py-3 px-3 no-print text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setReceiptForPrint(t)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="रसीद देखें"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {!t.isReversed && (
                            <button
                              type="button"
                              onClick={() => setReversalTarget(t)}
                              className="p-1 text-amber-700 hover:bg-amber-50 rounded"
                              title="अधिकृत रिवर्सल करें"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Reversal Modal (Never deleting financial records!) */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                अधिकृत ट्रांजैक्शन रिवर्सल (Audit Reversal)
              </h3>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <div>रसीद संख्या: <strong>{reversalTarget.receiptNumber}</strong></div>
              <div>ग्राहक: <strong>{reversalTarget.customerNameHindi}</strong> ({reversalTarget.accountNumber})</div>
              <div>रकम: <strong className="text-rose-700">{formatINR(reversalTarget.amount)}</strong></div>
              <div className="text-[11px] text-amber-900 pt-1">
                * वित्तीय नियमों के अनुसार ट्रांजैक्शन को कभी भी हार्ड डिलीट नहीं किया जाता। रिवर्सल प्रविष्टि रिकॉर्ड में हमेशा सुरक्षित रहती है।
              </div>
            </div>

            {reversalMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  reversalMsg.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}
              >
                {reversalMsg.text}
              </div>
            )}

            <form onSubmit={handleConfirmReversal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  रिवर्सल का कारण (Reason):
                </label>
                <input
                  type="text"
                  required
                  value={reversalReason}
                  onChange={e => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अनुमति देने वाले अधिकारी:
                </label>
                <select
                  value={reversalOfficer}
                  onChange={e => setReversalOfficer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="राजेश कुमार (शाखा प्रबंधक)">राजेश कुमार (शाखा प्रबंधक)</option>
                  <option value="अनीता देवी (मुख्य लेखापाल)">अनीता देवी (मुख्य लेखापाल)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReversalTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
                >
                  रिवर्सल पुष्टि करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
