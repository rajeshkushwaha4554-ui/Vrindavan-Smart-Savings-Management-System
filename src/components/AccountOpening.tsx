import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { calculateSavingsInterest } from '../utils/interestCalculator';
import { formatINR } from '../utils/transliteration';
import { FolderPlus, CheckCircle, Calculator, UserCheck, ShieldCheck, Award, FileText, Printer } from 'lucide-react';

export const AccountOpening: React.FC<{ initialCustomerId?: string }> = ({ initialCustomerId }) => {
  const { customers, plans, branches, employees, openAccount, setPassbookForPrint, setBondForPrint } = useSavingsData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId || (customers[0]?.id || ''));
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans.find(p => p.type === 'flexi')?.id || plans[0]?.id || 'PLAN-03');
  const [installmentAmount, setInstallmentAmount] = useState<number>(100);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(7.0);
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>(employees[0]?.id || 'EMP-101');
  const [branchId, setBranchId] = useState<string>(branches[0]?.id || 'BR-01');
  const [successAcc, setSuccessAcc] = useState<any>(null);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // When plan changes, update default parameters
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const p = plans.find(item => item.id === planId);
    if (p) {
      setInterestRate(p.defaultAnnualRate);
      setDurationMonths(p.durationMonths);
      setInstallmentAmount(p.minDepositAmount);
    }
  };

  // Live calculation of expected maturity
  const estMaturity = calculateSavingsInterest({
    principalOrInstallment: installmentAmount,
    annualRate: interestRate,
    durationMonths,
    calculationType: selectedPlan.calculationMethod,
    depositFrequency: selectedPlan.type === 'flexi' ? 'flexi' : selectedPlan.type === 'daily' ? 'daily' : selectedPlan.type === 'monthly' ? 'monthly' : 'lump_sum'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const newAcc = openAccount({
      customerId: selectedCustomer.id,
      planId: selectedPlan.id,
      planType: selectedPlan.type,
      planNameHindi: selectedPlan.nameHindi,
      openingDate: new Date().toISOString().split('T')[0],
      depositFrequency: selectedPlan.type === 'daily' ? 'daily' : selectedPlan.type === 'monthly' ? 'monthly' : 'flexi',
      installmentAmount,
      durationMonths,
      annualInterestRate: interestRate,
      interestCalculationMethod: selectedPlan.calculationMethod,
      maturityDate: estMaturity.maturityDateStr,
      expectedMaturityAmount: estMaturity.maturityAmount,
      branchId,
      assignedEmployeeId,
      isFlexible: selectedPlan.isFlexible ?? (selectedPlan.type === 'flexi'),
      minDepositLimit: selectedPlan.minDepositAmount || 10,
      maxDepositLimit: selectedPlan.maxDepositAmount || 50000
    });

    setSuccessAcc(newAcc);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            नया बचत खाता सृजन
          </span>
          <h1 className="text-2xl font-bold mt-0.5">बचत खाता खोलें (Open Savings Account)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            दैनिक बचत, मासिक आरडी या फ्लेक्सी बचत खाता खोलें और तुरंत मैच्योरिटी अनुमान देखें।
          </p>
        </div>
      </div>

      {successAcc && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-700" />
            <h3 className="text-base font-extrabold text-emerald-950">
              बचत खाता सफलतापूर्वक खुल गया! (Account Successfully Opened)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-white p-4 rounded-xl border border-emerald-200">
            <div>
              <span className="text-slate-500 block text-[10px]">बांड संख्या (Bond No):</span>
              <strong className="font-mono text-emerald-950 text-sm font-extrabold">{successAcc.bondNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">खाता संख्या:</span>
              <strong className="font-mono text-emerald-900 text-sm">{successAcc.accountNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">खाताधारक:</span>
              <strong className="text-slate-900">{selectedCustomer?.nameHindi}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">योजना:</span>
              <strong className="text-slate-800">{successAcc.planNameHindi}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">अनुमानित मैच्योरिटी राशि:</span>
              <strong className="font-mono text-emerald-800 font-bold">{formatINR(successAcc.expectedMaturityAmount)}</strong>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                if (selectedCustomer) {
                  setBondForPrint({ customer: selectedCustomer, account: successAcc });
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>डिजिटल बचत बांड देखें व प्रिंट करें (View Savings Bond)</span>
            </button>
            <button
              onClick={() => {
                if (selectedCustomer) {
                  setPassbookForPrint({ customer: selectedCustomer, account: successAcc });
                }
              }}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>पासबुक देखें व प्रिंट करें</span>
            </button>
            <button
              onClick={() => setSuccessAcc(null)}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              नया दूसरा खाता खोलें
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FolderPlus className="w-4 h-4 text-emerald-700" />
              <span>खाता विवरण फॉर्म (Account Specifications)</span>
            </h2>

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ग्राहक चुनें (Select Customer): <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameHindi} ({c.nameEnglish}) - {c.id} - ग्राम: {c.village} - मो: {c.mobile}
                  </option>
                ))}
              </select>
            </div>

            {/* Savings Plan Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                बचत योजना चुनें (Savings Product Scheme): <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plans.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlanChange(p.id)}
                    className={`text-left p-3 rounded-xl border transition ${
                      selectedPlanId === p.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.nameHindi}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ब्याज: <strong className="text-emerald-800 font-mono">{p.defaultAnnualRate}%</strong> वार्षिक
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{p.descriptionHindi}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Installment Amount & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  किस्त / जमा राशि (Installment Amount ₹): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={installmentAmount}
                    onChange={e => setInstallmentAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {selectedPlan.type === 'daily' ? 'प्रतिदिन की किस्त' : selectedPlan.type === 'monthly' ? 'प्रति माह की किस्त' : 'प्रारंभिक जमा'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अवधि (Duration in Months): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={durationMonths}
                  onChange={e => setDurationMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:border-emerald-600 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {durationMonths} माह (लगभग {Math.round(durationMonths * 30.4)} दिन)
                </span>
              </div>
            </div>

            {/* Annual Interest Rate & Assigned Employee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  वार्षिक ब्याज दर (% p.a.):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={interestRate}
                    onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="absolute right-3.5 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संग्रहकर्ता / कर्मचारी (Field Agent):
                </label>
                <select
                  value={assignedEmployeeId}
                  onChange={e => setAssignedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nameHindi} ({e.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">शाखा (Branch):</label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nameHindi} - {b.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>खाता खोलें व पासबुक तैयार करें (Open Account)</span>
            </button>
          </form>
        </div>

        {/* Live Calculation Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-sm border border-emerald-900 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>मैच्योरिटी व ब्याज पूर्वावलोकन (Live Estimate)</span>
            </div>

            <div className="space-y-3 pt-2 border-t border-emerald-900/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">योजना:</span>
                <span className="font-bold text-emerald-200">{selectedPlan.nameHindi}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">जमा आवृत्ति / किस्त:</span>
                <span className="font-mono font-bold text-white">{formatINR(installmentAmount)} ({selectedPlan.type})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">अवधि:</span>
                <span className="font-mono text-white">{durationMonths} माह</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">कुल अनुमानित जमा राशि:</span>
                <span className="font-mono font-bold text-white text-sm">{formatINR(estMaturity.totalDeposited)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">अनुमानित अर्जित ब्याज:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">+{formatINR(estMaturity.totalInterest)}</span>
              </div>

              <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-700/60 flex justify-between items-center mt-3">
                <div>
                  <span className="text-[10px] text-emerald-300 block font-semibold">मैच्योरिटी पर कुल भुगतान:</span>
                  <span className="text-xs text-slate-300 font-mono">तारीख: {estMaturity.maturityDateStr}</span>
                </div>
                <div className="text-xl font-mono font-extrabold text-emerald-300">
                  {formatINR(estMaturity.maturityAmount)}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-emerald-900/80 leading-relaxed">
              * वास्तविक ब्याज गणना दैनिक जमा प्रविष्टियों के आधार पर की जाती है। समय से पूर्व निकासी पर नियम अनुसार ब्याज संशोधित हो सकता है।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
