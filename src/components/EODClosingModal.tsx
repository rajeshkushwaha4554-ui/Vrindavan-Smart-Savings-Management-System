import React from 'react';
import { DayClosingSummary } from '../types';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { Printer, Download, X, CheckCircle, ShieldCheck, AlertCircle, Building, Wallet, Calendar } from 'lucide-react';

interface EODClosingModalProps {
  summary: DayClosingSummary;
  onClose: () => void;
}

export const EODClosingModal: React.FC<EODClosingModalProps> = ({ summary, onClose }) => {
  const { company } = useSavingsData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Controls bar (No print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                दैनिक क्लोजिंग रिपोर्ट (End of Day Closing Certificate)
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                दिनांक: {summary.date} • समय: {summary.closedAt} • अधिकारी: {summary.closedBy}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रमाणपत्र प्रिंट करें (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable EOD Certificate */}
        <div className="p-4 sm:p-8 overflow-y-auto max-h-[82vh] bg-slate-100 flex justify-center">
          <div className="print-container w-[200mm] min-h-[260mm] bg-white p-6 sm:p-8 border-2 border-emerald-950 rounded-xl shadow-md relative text-slate-900 print:shadow-none print:m-0 print:border-emerald-800 overflow-hidden">
            {/* Subtle Company Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden z-0">
              <img
                src={company.logoUrl || '/vrindavan_logo.jpeg'}
                alt=""
                className="w-[130mm] h-[130mm] object-contain rotate-[-15deg]"
              />
            </div>

            {/* Inner Border */}
            <div className="border border-emerald-900/40 p-5 rounded-lg flex flex-col justify-between min-h-full relative z-10">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-emerald-950 pb-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={company.logoUrl || '/vrindavan_logo.jpeg'}
                      alt={company.legalName}
                      className="w-16 h-16 object-contain drop-shadow-xs shrink-0"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Official Daily Accounting Certificate
                      </div>
                      <h1 className="text-xl font-extrabold text-emerald-950 leading-tight">
                        {company.legalName}
                      </h1>
                      <h2 className="text-xs font-bold text-emerald-800">
                        {company.hindiName}
                      </h2>
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        CIN: <strong>{company.cin}</strong> | {company.registeredOffice}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-emerald-950 text-white rounded text-xs font-bold tracking-wide">
                      आज का हिसाब बंद (EOD Closing)
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-mono">
                      दिनांक: <strong>{summary.date}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      समय: {summary.closedAt}
                    </div>
                  </div>
                </div>

                {/* 8 Essential Questions Addressed in Big Cards */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                    1. आज का संपूर्ण वित्तीय सार (Daily Financial Summary)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    {/* Q1: Total Deposited */}
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
                      <span className="text-[10px] text-emerald-800 font-semibold block">1. आज कुल कितना जमा हुआ?</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-900">{formatINR(summary.totalDepositAmount)}</span>
                    </div>

                    {/* Q2: Cash received */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                      <span className="text-[10px] text-slate-600 font-semibold block">2. कार्यालय में कुल नकद:</span>
                      <span className="text-lg font-mono font-extrabold text-slate-900">{formatINR(summary.cashInOfficeReceived)}</span>
                    </div>

                    {/* Q3: UPI Received */}
                    <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl">
                      <span className="text-[10px] text-blue-800 font-semibold block">3. कुल ऑनलाइन UPI:</span>
                      <span className="text-lg font-mono font-extrabold text-blue-900">{formatINR(summary.upiTotalReceived)}</span>
                    </div>

                    {/* Q4: Bank transfer */}
                    <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl">
                      <span className="text-[10px] text-purple-800 font-semibold block">4. बैंक ट्रांसफर (NEFT):</span>
                      <span className="text-lg font-mono font-extrabold text-purple-900">{formatINR(summary.bankTotalReceived)}</span>
                    </div>

                    {/* Q5: Customers served */}
                    <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                      <span className="text-[10px] text-slate-600 font-semibold block">5. कितने ग्राहकों ने जमा किया?</span>
                      <span className="text-lg font-mono font-extrabold text-slate-900">{summary.customersServedCount} ग्राहक</span>
                    </div>

                    {/* Q6: Withdrawals */}
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl">
                      <span className="text-[10px] text-rose-800 font-semibold block">6. आज कितनी निकासी हुई?</span>
                      <span className="text-lg font-mono font-extrabold text-rose-900">{formatINR(summary.totalWithdrawalAmount)}</span>
                    </div>

                    {/* Q7: Accrued interest */}
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl">
                      <span className="text-[10px] text-amber-800 font-semibold block">7. कितना ब्याज देय उपार्जित हुआ?</span>
                      <span className="text-lg font-mono font-extrabold text-amber-900">{formatINR(summary.totalInterestPayableAccrued)}</span>
                    </div>

                    {/* Q8: Cash discrepancy */}
                    <div className="p-3 bg-emerald-900 text-white rounded-xl">
                      <span className="text-[10px] text-emerald-200 font-semibold block">8. कितना कैश मिलान बाकी?</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-300">
                        {summary.pendingCashDiscrepancies === 0 ? '₹0 (शून्य अंतर)' : formatINR(summary.pendingCashDiscrepancies)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employee Breakdown Table (किस कर्मचारी ने कितना जमा किया?) */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    2. कर्मचारी-वार संग्रह व कैश मिलान (Employee-wise Collection & Handover)
                  </h3>

                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-300">
                        <tr>
                          <th className="py-2 px-3">कर्मचारी ID</th>
                          <th className="py-2 px-3">कर्मचारी का नाम</th>
                          <th className="py-2 px-3 text-right">कुल संग्रह (₹)</th>
                          <th className="py-2 px-3 text-right">कार्यालय में जमा (₹)</th>
                          <th className="py-2 px-3 text-right">शेष / अंतर (₹)</th>
                          <th className="py-2 px-3 text-center">स्थिति (Status)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {summary.employeeBreakdowns.map((emp, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-600 font-bold">{emp.employeeId}</td>
                            <td className="py-2 px-3 font-sans font-semibold text-slate-900">{emp.employeeName}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-900">{formatINR(emp.collected)}</td>
                            <td className="py-2 px-3 text-right text-slate-800">{formatINR(emp.submitted)}</td>
                            <td className={`py-2 px-3 text-right font-bold ${emp.diff === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {formatINR(emp.diff)}
                            </td>
                            <td className="py-2 px-3 text-center font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                emp.diff === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit & Legal Declaration */}
                <div className="text-[10px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed mb-4">
                  <strong>प्रमाणीकरण:</strong> यह प्रमाणित किया जाता है कि आज दिनांक {summary.date} का दैनिक हिसाब-किताब, संग्रह रसीदें एवं बैंक/कैश आवक-जावक की पूर्ण जांच कर अधिकृत रूप से क्लोजिंग दर्ज की गई है। सभी प्रविष्टियां आंतरिक लेजर में सुरक्षित हैं।
                </div>
              </div>

              {/* Bottom Signatures */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="h-10 flex items-end justify-center text-slate-700 font-medium">
                    {summary.closedBy}
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    क्लोजिंग अधिकारी के हस्ताक्षर
                  </div>
                </div>

                <div>
                  <div className="h-10 flex items-center justify-center">
                    <div className="px-3 py-1 border border-dashed border-emerald-800 text-[9px] font-bold text-emerald-900 rounded">
                      VSMPL EOD SEAL
                    </div>
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    शाखा अधिकृत मुहर
                  </div>
                </div>

                <div>
                  <div className="h-10 flex items-end justify-center text-slate-800 italic">
                    राजेश कुमार (शाखा प्रबंधक)
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-600">
                    पर्यवेक्षक / प्रबंधक हस्ताक्षर
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
