import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { calculateSavingsInterest, calculateDailyBalanceInterest } from '../utils/interestCalculator';
import { formatINR } from '../utils/transliteration';
import {
  Calculator,
  ArrowRight,
  Printer,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';

export const InterestCalculatorView: React.FC = () => {
  const { accounts, customers, transactions, postInterestAccrual } = useSavingsData();

  const [activeTab, setActiveTab] = useState<'daily_ledger' | 'simulator'>('daily_ledger');

  // Simulator state
  const [principalOrInstallment, setPrincipalOrInstallment] = useState<number>(100);
  const [annualRate, setAnnualRate] = useState<number>(7.0);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [durationDays, setDurationDays] = useState<number>(365);
  const [useDaysMode, setUseDaysMode] = useState<boolean>(false);
  const [calculationType, setCalculationType] = useState<'simple' | 'compound_daily' | 'compound_monthly' | 'compound_yearly'>('compound_daily');
  const [depositFrequency, setDepositFrequency] = useState<'flexi' | 'daily' | 'monthly' | 'lump_sum' | 'weekly'>('flexi');
  const [dayBasis, setDayBasis] = useState<365 | 366>(365);

  // Actual Account Ledger state
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [authorizedOfficer, setAuthorizedOfficer] = useState('राजेश कुमार (शाखा प्रबंधक)');
  const [postFeedback, setPostFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];
  const selectedCustomer = customers.find(c => c.id === selectedAccount?.customerId);

  const accountTxns = transactions.filter(
    t => t.accountId === selectedAccount?.id || t.accountNumber === selectedAccount?.accountNumber
  );

  // Calculate actual daily balance interest for this real account
  const dailyLedgerResult = selectedAccount
    ? calculateDailyBalanceInterest(selectedAccount, accountTxns, dayBasis)
    : null;

  // Simulator result
  const simResult = calculateSavingsInterest({
    principalOrInstallment,
    annualRate,
    durationMonths,
    durationDays: useDaysMode ? durationDays : undefined,
    calculationType,
    depositFrequency,
    dayCountBasis: dayBasis
  });

  const handlePostInterest = () => {
    if (!selectedAccount || !dailyLedgerResult) return;
    const amountToPost = dailyLedgerResult.totalAccruedInterest;
    if (amountToPost <= 0) {
      setPostFeedback({ success: false, msg: 'उपार्जित ब्याज शून्य है, पोस्ट करने की आवश्यकता नहीं।' });
      return;
    }

    const res = postInterestAccrual(selectedAccount.id, amountToPost, authorizedOfficer);
    setPostFeedback({ success: res.success, msg: res.message });
    setTimeout(() => setPostFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
            दैनिक शेष आधारित सटीक ब्याज इंजन
          </span>
          <h1 className="text-2xl font-extrabold mt-0.5">ब्याज प्रणाली व खाता लेजर (Interest Engine)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            प्रत्येक दिन के क्लोजिंग बैलेंस के अनुसार वास्तविक ब्याज गणना, स्टेटमेंट एवं अधिकृत पोस्टिंग।
          </p>
        </div>
        <div className="bg-emerald-900/60 border border-emerald-700/60 px-4 py-2 rounded-2xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RBI / NBFC Microfinance Daily Closing Compliant</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('daily_ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'daily_ledger'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>वास्तविक खाता दैनिक शेष लेजर (Actual Account Ledger)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>योजना ब्याज सिमुलेटर (Plan Simulator)</span>
        </button>
      </div>

      {/* TAB 1: Actual Daily Balance Ledger */}
      {activeTab === 'daily_ledger' && selectedAccount && (
        <div className="space-y-5">
          {/* Account Selector Strip */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">खाता चुनें:</span>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              >
                {accounts.map(acc => {
                  const cust = customers.find(c => c.id === acc.customerId);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountNumber} - {cust?.nameHindi} ({cust?.id}) - शेष: {formatINR(acc.currentBalance)}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>स्टेटमेंट प्रिंट करें</span>
              </button>
            </div>
          </div>

          {postFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                postFeedback.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {postFeedback.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <ShieldCheck className="w-4 h-4 text-rose-600" />}
              <span>{postFeedback.msg}</span>
            </div>
          )}

          {/* Account Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">वर्तमान शेष (Balance)</span>
              <span className="text-xl font-mono font-extrabold text-slate-900 mt-1 block">
                {formatINR(selectedAccount.currentBalance)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedAccount.accountNumber}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase">दैनिक उपार्जित ब्याज</span>
              <span className="text-xl font-mono font-extrabold text-emerald-900 mt-1 block">
                +{formatINR(dailyLedgerResult?.totalAccruedInterest || 0)}
              </span>
              <span className="text-[10px] text-emerald-700">वार्षिक दर: {selectedAccount.annualInterestRate}%</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
              <span className="text-[10px] text-blue-800 font-bold block uppercase">पूर्व क्रेडिटेड ब्याज</span>
              <span className="text-xl font-mono font-extrabold text-blue-900 mt-1 block">
                {formatINR(selectedAccount.totalInterestCredited || 0)}
              </span>
              <span className="text-[10px] text-blue-700">खाते में जुड़ चुका</span>
            </div>

            <div className="bg-emerald-950 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold block uppercase">ब्याज पोस्टिंग</span>
                <span className="text-lg font-mono font-black text-emerald-300 mt-0.5 block">
                  +{formatINR(dailyLedgerResult?.totalAccruedInterest || 0)}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePostInterest}
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 px-2.5 rounded-xl text-xs font-bold transition text-center shadow-xs"
              >
                अधिकृत ब्याज पोस्ट करें
              </button>
            </div>
          </div>

          {/* Daily Balance Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  दैनिक शेष व ब्याज शेड्यूल (Daily Closing Balance & Accrual Schedule)
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {dailyLedgerResult?.formulaDescriptionHindi}
                </span>
              </div>
              <span className="text-xs text-slate-600 font-mono">
                सक्रिय दिन: {dailyLedgerResult?.activeDaysCount} दिन
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">दिन / तारीख</th>
                    <th className="py-2.5 px-3 text-right">प्रारंभिक शेष</th>
                    <th className="py-2.5 px-3 text-right">जमा (+)</th>
                    <th className="py-2.5 px-3 text-right">निकासी (-)</th>
                    <th className="py-2.5 px-3 text-right">दैनिक क्लोजिंग बैलेंस</th>
                    <th className="py-2.5 px-3 text-right">दैनिक ब्याज (₹)</th>
                    <th className="py-2.5 px-3 text-right">संचयी ब्याज (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {dailyLedgerResult?.dailyRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        <span className="text-[10px] text-slate-400 mr-1.5">#{r.dayNumber}</span>
                        {r.date}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">{formatINR(r.openingBalance)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {r.depositAmount > 0 ? `+${formatINR(r.depositAmount)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700">
                        {r.withdrawalAmount > 0 ? `-${formatINR(r.withdrawalAmount)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold text-slate-900">{formatINR(r.closingBalance)}</td>
                      <td className="py-2 px-3 text-right text-emerald-800 font-bold">+{r.dailyInterestAccrued}</td>
                      <td className="py-2 px-3 text-right text-emerald-950 font-black">+{r.cumulativeInterest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Plan Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Inputs (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>सिमुलेटर इनपुट (Simulation Parameters)</span>
            </h2>

            {/* Deposit Frequency Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                योजना प्रकार (Deposit Scheme):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDepositFrequency('flexi');
                    setCalculationType('compound_daily');
                    setAnnualRate(7.0);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    depositFrequency === 'flexi'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  फ्लेक्सी बचत (Flexible)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositFrequency('daily');
                    setCalculationType('simple');
                    setAnnualRate(8.0);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    depositFrequency === 'daily'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  दैनिक बचत (Daily)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositFrequency('monthly');
                    setCalculationType('compound_monthly');
                    setAnnualRate(8.5);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    depositFrequency === 'monthly'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  मासिक आरडी (Monthly)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDepositFrequency('lump_sum');
                    setCalculationType('compound_yearly');
                    setAnnualRate(9.5);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    depositFrequency === 'lump_sum'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  एकमुश्त / मियादी (Lump Sum)
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                जमा राशि (Deposit Amount ₹):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-emerald-800">₹</span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={principalOrInstallment}
                  onChange={e => setPrincipalOrInstallment(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl font-mono font-bold text-base"
                />
              </div>
            </div>

            {/* Annual Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  वार्षिक ब्याज दर (% p.a.):
                </label>
                <span className="text-xs font-mono font-bold text-emerald-900">{annualRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.25"
                value={annualRate}
                onChange={e => setAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">अवधि (Tenure in Months):</label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 12, 24, 36].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMonths(m)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-xl border ${
                      durationMonths === m
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {m} माह
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulator Results (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-sm border border-emerald-900">
              <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-2">
                सिमुलेशन परिणाम (Simulation Output)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 pb-4 border-b border-emerald-900/80">
                <div>
                  <span className="text-[11px] text-slate-400 block">कुल जमा राशि</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {formatINR(simResult.totalDeposited)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">अनुमानित उपार्जित ब्याज</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    +{formatINR(simResult.totalInterest)}
                  </span>
                </div>
                <div className="bg-emerald-900/60 p-2 rounded-2xl border border-emerald-700/60 text-right">
                  <span className="text-[10px] text-emerald-300 block font-bold">मैच्योरिटी भुगतान</span>
                  <span className="text-xl font-mono font-extrabold text-emerald-300">
                    {formatINR(simResult.maturityAmount)}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>मैच्योरिटी तारीख:</span>
                  <span className="font-mono font-bold text-white">{simResult.maturityDateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span>प्रभावी वार्षिक प्रतिफल:</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.effectiveYieldAnnual}% p.a.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/80 text-[11px] bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/40">
                <div className="font-bold text-emerald-300 mb-0.5">लागू सूत्र:</div>
                <div className="text-white font-mono">{simResult.formulaDescriptionHindi}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
