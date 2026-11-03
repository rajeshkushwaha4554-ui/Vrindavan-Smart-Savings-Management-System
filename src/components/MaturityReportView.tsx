import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { Calendar, Search, Filter, BookOpen, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export const MaturityReportView: React.FC = () => {
  const { accounts, customers, setPassbookForPrint } = useSavingsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'maturing_soon' | 'active'>('all');

  const now = new Date();

  const enrichedAccounts = accounts.map(acc => {
    const cust = customers.find(c => c.id === acc.customerId);
    const matDate = acc.maturityDate ? new Date(acc.maturityDate) : null;
    let daysRemaining = null;
    let isMaturingSoon = false;

    if (matDate) {
      const diffTime = matDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 90 && daysRemaining >= -30) {
        isMaturingSoon = true;
      }
    }

    return {
      ...acc,
      customer: cust,
      daysRemaining,
      isMaturingSoon
    };
  });

  const filtered = enrichedAccounts.filter(acc => {
    if (statusFilter === 'maturing_soon' && !acc.isMaturingSoon) return false;
    if (statusFilter === 'active' && acc.status !== 'active') return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      acc.accountNumber.toLowerCase().includes(term) ||
      (acc.customer && acc.customer.nameHindi.toLowerCase().includes(term)) ||
      (acc.customer && acc.customer.nameEnglish.toLowerCase().includes(term)) ||
      (acc.customer && acc.customer.mobile.includes(term)) ||
      acc.planNameHindi.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            परिपक्वता व अवधि पूर्वानुमान
          </span>
          <h1 className="text-2xl font-bold mt-0.5">मैच्योरिटी रिपोर्ट (Maturity & Duration Report)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            अवधि पूरी होने वाले बचत खातों की सूची, देय मैच्योरिटी राशि, उपार्जित ब्याज व भुगतान स्थिति।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/60 px-4 py-2.5 rounded-2xl text-xs font-medium">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-emerald-300 text-[10px]">कुल सक्रिय खाते:</div>
            <div className="font-mono font-bold text-white text-base">{accounts.length} खाते</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-96 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="खाता सं, ग्राहक नाम, मोबाइल से खोजें..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
          >
            <option value="all">सभी खाते (All Accounts)</option>
            <option value="maturing_soon">जल्द मैच्योर होने वाले (Next 90 Days)</option>
            <option value="active">सक्रिय खाते (Active Only)</option>
          </select>
        </div>
      </div>

      {/* Accounts Maturity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">खाता संख्या</th>
                <th className="py-3 px-4">खाताधारक का नाम</th>
                <th className="py-3 px-4">योजना व अवधि</th>
                <th className="py-3 px-4">खाता खोलने की तारीख</th>
                <th className="py-3 px-4">मैच्योरिटी तारीख</th>
                <th className="py-3 px-4 text-right">वर्तमान जमा (₹)</th>
                <th className="py-3 px-4 text-right">अनुमानित मैच्योरिटी (₹)</th>
                <th className="py-3 px-4 text-center">स्थिति / दिन बाकी</th>
                <th className="py-3 px-4 text-center">पासबुक</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    कोई खाता नहीं मिला।
                  </td>
                </tr>
              ) : (
                filtered.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{acc.customer?.nameHindi || 'अज्ञात'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{acc.customer?.mobile}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-950">{acc.planNameHindi}</div>
                      <div className="text-[10px] text-slate-500">{acc.durationMonths} माह ({acc.annualInterestRate}% वार्षिक)</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {acc.openingDate}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {acc.maturityDate || 'अनिश्चित (फ्लेक्सी)'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatINR(acc.currentBalance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-900">
                      {formatINR(acc.expectedMaturityAmount || (acc.currentBalance * 1.08))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {acc.daysRemaining !== null ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.daysRemaining <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : acc.daysRemaining <= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {acc.daysRemaining <= 0
                            ? 'अवधि पूर्ण (Matured)'
                            : `${acc.daysRemaining} दिन शेष`}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          फ्लेक्सी बचत
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (acc.customer) {
                            setPassbookForPrint({ customer: acc.customer, account: acc });
                          }
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white transition"
                        title="पासबुक देखें"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
