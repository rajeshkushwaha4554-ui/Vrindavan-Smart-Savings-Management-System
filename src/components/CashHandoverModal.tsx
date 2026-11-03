import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { Wallet, Calculator, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';

interface CashHandoverModalProps {
  onClose: () => void;
}

export const CashHandoverModal: React.FC<CashHandoverModalProps> = ({ onClose }) => {
  const { employees, submitDailyClosing, selectedEmployeeId } = useSavingsData();
  const [empId, setEmpId] = useState(selectedEmployeeId || employees[0]?.id || 'EMP-101');
  const [verifierName, setVerifierName] = useState('राजेश कुमार (लेखाकार/प्रबंधक)');
  const [notesRemarks, setNotesRemarks] = useState('शाम का दैनिक फील्ड कलेक्शन कैश जमा');
  const [success, setSuccess] = useState(false);

  // Denominations
  const [denom, setDenom] = useState({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0
  });

  const selectedEmp = employees.find(e => e.id === empId) || employees[0];
  const cashInHand = selectedEmp?.cashInHand || 0;

  const totalCalculated =
    denom.n500 * 500 +
    denom.n200 * 200 +
    denom.n100 * 100 +
    denom.n50 * 50 +
    denom.n20 * 20 +
    denom.n10 * 10 +
    denom.coins;

  const diff = totalCalculated - cashInHand;

  const handleDenomChange = (field: keyof typeof denom, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setDenom(prev => ({ ...prev, [field]: num }));
  };

  const handleQuickFill = () => {
    // Automatically match the denominations to the cash in hand
    const remainder = cashInHand;
    const n500 = Math.floor(remainder / 500);
    const after500 = remainder % 500;
    const n200 = Math.floor(after500 / 200);
    const after200 = after500 % 200;
    const n100 = Math.floor(after200 / 100);
    const after100 = after200 % 100;
    const n50 = Math.floor(after100 / 50);
    const coins = after100 % 50;

    setDenom({
      n500,
      n200,
      n100,
      n50,
      n20: 0,
      n10: 0,
      coins
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCalculated <= 0) {
      alert('कृपया जमा करने हेतु नोटों की संख्या दर्ज करें।');
      return;
    }

    submitDailyClosing({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.nameHindi,
      branchId: selectedEmp.branchId || 'BR-01',
      date: new Date().toISOString().split('T')[0],
      totalCollected: selectedEmp.todayCollectedAmount || totalCalculated,
      submittedToOffice: totalCalculated,
      shortOrExcess: diff,
      denominations: {
        note500: denom.n500,
        note200: denom.n200,
        note100: denom.n100,
        note50: denom.n50,
        note20: denom.n20,
        note10: denom.n10,
        coins: denom.coins
      },
      verifiedBy: verifierName,
      remarks: notesRemarks || 'कार्यालय में दैनिक फील्ड कलेक्शन कैश जमा',
      status: diff === 0 ? 'approved' : 'discrepancy'
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">कर्मचारी कैश जमा व मिलान</h2>
              <p className="text-xs text-emerald-200">
                फील्ड से प्राप्त नकद का कार्यालय में नोट-वार मिलान व हैंडओवर
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">कैश सफलतापूर्वक कार्यालय में जमा हुआ!</h3>
            <p className="text-xs text-slate-600 font-mono">
              कुल जमा राशि: {formatINR(totalCalculated)} • कर्मचारी: {selectedEmp.nameHindi}
            </p>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 py-2 rounded-xl">
              कर्मचारी लेजर से कैश इन हैंड समायोजित कर दिया गया है।
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Employee Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कर्मचारी चुनें:
                </label>
                <select
                  value={empId}
                  onChange={e => setEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nameHindi} ({e.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कार्यालय सत्यापनकर्ता (Cashier):
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={e => setVerifierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Expected Cash in Hand Badge */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                  कर्मचारी हाथ में बकाया नकद
                </span>
                <span className="text-xl font-mono font-extrabold text-emerald-950">
                  {formatINR(cashInHand)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-2xs"
              >
                ऑटो नोट भरें (Auto Fill)
              </button>
            </div>

            {/* Denomination Counter Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                  <span>करेंसी नोटों का विवरण (Currency Breakdown):</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: '₹500 के नोट', key: 'n500', mult: 500 },
                  { label: '₹200 के नोट', key: 'n200', mult: 200 },
                  { label: '₹100 के नोट', key: 'n100', mult: 100 },
                  { label: '₹50 के नोट', key: 'n50', mult: 50 },
                  { label: '₹20 के नोट', key: 'n20', mult: 20 },
                  { label: '₹10 के नोट', key: 'n10', mult: 10 }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={denom[item.key as keyof typeof denom] || ''}
                      onChange={e => handleDenomChange(item.key as keyof typeof denom, e.target.value)}
                      placeholder="0"
                      className="w-16 px-2 py-1 text-right bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Coins row */}
              <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-700">सिक्के / चिल्हर (Coins Total ₹):</span>
                <input
                  type="number"
                  min="0"
                  value={denom.coins || ''}
                  onChange={e => handleDenomChange('coins', e.target.value)}
                  placeholder="0"
                  className="w-24 px-2 py-1 text-right bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Reconciliation Totals */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">कुल भौतिक नकद (Physical Cash):</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  {formatINR(totalCalculated)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">अंतर / मिलान स्थिति:</span>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  diff === 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                }`}>
                  {diff === 0 ? '✓ शून्य अंतर (सटीक मिलान)' : diff > 0 ? `+${formatINR(diff)} अधिक` : `${formatINR(diff)} कम`}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                टिप्पणी / विवरण (Remarks):
              </label>
              <input
                type="text"
                value={notesRemarks}
                onChange={e => setNotesRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>कार्यालय में कैश जमा स्वीकार करें व लेजर अपडेट करें</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
