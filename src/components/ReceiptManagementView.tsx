import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { Transaction } from '../types';
import { formatINR } from '../utils/transliteration';
import { Receipt, Search, Printer, Share2, Filter, Eye, ArrowUpRight, ArrowDownLeft, Calendar, UserCheck } from 'lucide-react';

export const ReceiptManagementView: React.FC = () => {
  const { transactions, setReceiptForPrint, company } = useSavingsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'upi' | 'bank_transfer'>('all');

  const filteredTransactions = transactions.filter(t => {
    // Type filter
    if (filterType !== 'all' && t.type !== filterType) return false;
    // Method filter
    if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false;

    // Search term
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      t.receiptNumber.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term) ||
      t.accountNumber.toLowerCase().includes(term) ||
      t.customerNameHindi.toLowerCase().includes(term) ||
      t.customerNameEnglish.toLowerCase().includes(term) ||
      t.employeeName.toLowerCase().includes(term) ||
      (t.referenceNo && t.referenceNo.toLowerCase().includes(term))
    );
  });

  const handleShareWhatsApp = (t: Transaction) => {
    const isDeposit = t.type === 'deposit';
    const text = `*${company.legalName}*
*${isDeposit ? 'जमा रसीद' : 'निकासी रसीद'}*
रसीद संख्या: ${t.receiptNumber}
तारीख: ${t.displayDate}
खाता संख्या: ${t.accountNumber}
ग्राहक नाम: ${t.customerNameHindi}
राशि: ₹${t.amount}
शेष बैलेंस: ₹${t.currentBalance}
संग्रहकर्ता: ${t.employeeName}
हेल्पलाइन: ${company.mobile}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            पारदर्शी रसीद आर्काइव (Receipt Archive)
          </span>
          <h1 className="text-2xl font-bold mt-0.5">रसीद मैनेजमेंट व पुनः प्रिंट (Receipt Management)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            सभी जारी की गई VIP रसीदें देखें, खोजें, खड़ी/आड़ी/थर्मल फॉर्मेट में प्रिंट करें अथवा WhatsApp पर भेजें।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/60 px-4 py-2.5 rounded-2xl text-xs font-medium">
          <Receipt className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-emerald-300 text-[10px]">कुल जारी रसीदें:</div>
            <div className="font-mono font-bold text-white text-base">{transactions.length} रसीदें</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="रसीद सं (RCP-1001), खाता सं, TXN ID, या ग्राहक नाम से खोजें..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">सभी प्रकार (जमा व निकासी)</option>
              <option value="deposit">केवल जमा रसीदें (Deposits)</option>
              <option value="withdrawal">केवल निकासी रसीदें (Withdrawals)</option>
            </select>
          </div>

          {/* Method Filter */}
          <div className="md:col-span-3">
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="all">सभी माध्यम (नकद, UPI, बैंक)</option>
              <option value="cash">नकद (Cash)</option>
              <option value="upi">ऑनलाइन UPI</option>
              <option value="bank_transfer">बैंक ट्रांसफर (NEFT/IMPS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            खोज परिणाम: <strong className="text-emerald-900 font-mono">{filteredTransactions.length}</strong> रसीदें पाई गईं
          </span>
          <span className="text-[11px] text-slate-500">
            प्रिंट प्रारूप: खड़ी (Portrait), आड़ी (Landscape), 80mm थर्मल (Thermal POS)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">रसीद सं. / TXN ID</th>
                <th className="py-3 px-4">दिनांक व समय</th>
                <th className="py-3 px-4">खाताधारक का नाम</th>
                <th className="py-3 px-4">खाता संख्या</th>
                <th className="py-3 px-4">प्रकार व माध्यम</th>
                <th className="py-3 px-4 text-right">राशि (₹)</th>
                <th className="py-3 px-4 text-right">नया बैलेंस (₹)</th>
                <th className="py-3 px-4">संग्रहकर्ता / शाखा</th>
                <th className="py-3 px-4 text-center">कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    कोई रसीद नहीं मिली।
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(txn => {
                  const isDeposit = txn.type === 'deposit';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{txn.receiptNumber}</div>
                        <div className="font-mono text-[10px] text-slate-400">{txn.id}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {txn.displayDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{txn.customerNameHindi}</div>
                        <div className="text-[10px] text-slate-500">{txn.customerNameEnglish}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-950">
                        {txn.accountNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isDeposit ? 'जमा' : 'निकासी'}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-mono">
                            {txn.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                        isDeposit ? 'text-emerald-800' : 'text-rose-700'
                      }`}>
                        {isDeposit ? '+' : '-'}{formatINR(txn.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(txn.currentBalance)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-[11px]">{txn.employeeName}</div>
                        <div className="text-[10px] text-slate-500">{txn.branchName}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReceiptForPrint(txn)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                            title="VIP रसीद खोलें व प्रिंट करें"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>प्रिंट</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(txn)}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-1.5 rounded-lg transition"
                            title="WhatsApp पर भेजें"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
};
