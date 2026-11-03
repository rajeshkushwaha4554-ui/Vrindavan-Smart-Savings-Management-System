import React, { useState } from 'react';
import { Customer, SavingsAccount } from '../types';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { Printer, Download, X, BookOpen, ShieldCheck, User, Share2, Check } from 'lucide-react';

interface PassbookModalProps {
  customer: Customer;
  account: SavingsAccount;
  onClose: () => void;
}

export const PassbookModal: React.FC<PassbookModalProps> = ({ customer, account, onClose }) => {
  const { company, transactions } = useSavingsData();
  const [printFormat, setPrintFormat] = useState<'a4_portrait' | 'a4_landscape' | 'a5_passbook' | 'booklet'>('a4_portrait');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = printFormat === 'booklet' ? 8 : printFormat === 'a5_passbook' ? 10 : 16;

  // Filter transactions for this specific account
  const accountTxns = transactions
    .filter(t => t.accountId === account.id || t.accountNumber === account.accountNumber)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalPages = Math.max(1, Math.ceil(accountTxns.length / itemsPerPage));
  const displayedTxns = accountTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrint = () => {
    window.print();
  };

  const handleExportStatement = () => {
    const headers = ['Date', 'Receipt/TXN', 'Remarks', 'Deposit', 'Withdrawal', 'Balance', 'Collector'];
    const rows = accountTxns.map(t => [
      t.displayDate,
      t.receiptNumber,
      `"${t.remarks || ''}"`,
      t.type === 'deposit' ? t.amount : 0,
      t.type === 'withdrawal' ? t.amount : 0,
      t.currentBalance,
      `"${t.employeeName}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `passbook_statement_${account.accountNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Controls Bar (No print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                डिजिटल + प्रिंटेड ग्राहक पासबुक (Digital & Physical Passbook)
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {account.accountNumber} | {customer.nameHindi} ({customer.id})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Selector */}
            <div className="bg-slate-800 rounded-lg p-0.5 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('a4_portrait')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                  printFormat === 'a4_portrait' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 खड़ा
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4_landscape')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                  printFormat === 'a4_landscape' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A4 आड़ा
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a5_passbook')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                  printFormat === 'a5_passbook' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                A5 पासबुक
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('booklet')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                  printFormat === 'booklet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                पासबुक साइज
              </button>
            </div>

            <button
              onClick={handleExportStatement}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              title="CSV स्टेटमेंट डाउनलोड"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>पासबुक प्रिंट करें</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Passbook Document Canvas */}
        <div className="p-4 sm:p-8 overflow-x-auto bg-slate-100 flex flex-col items-center max-h-[82vh] overflow-y-auto">
          {/* Page Navigator if multi-page */}
          {totalPages > 1 && (
            <div className="no-print mb-3 flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-300 text-xs font-mono">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2 py-0.5 rounded text-emerald-800 disabled:opacity-30 font-bold"
              >
                ← पिछला पृष्ठ
              </button>
              <span className="text-slate-600">
                पृष्ठ {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-0.5 rounded text-emerald-800 disabled:opacity-30 font-bold"
              >
                अगला पृष्ठ →
              </button>
            </div>
          )}

          <div className="print-container">
            <div
              className={`bg-white p-6 sm:p-8 border-2 border-emerald-950 rounded-xl shadow-md relative text-slate-900 print:shadow-none print:m-0 print:border-emerald-800 overflow-hidden ${
                printFormat === 'a4_portrait'
                  ? 'w-[200mm] min-h-[275mm]'
                  : printFormat === 'a4_landscape'
                  ? 'w-[280mm] min-h-[195mm]'
                  : printFormat === 'a5_passbook'
                  ? 'w-[148mm] min-h-[210mm]'
                  : 'w-[160mm] min-h-[120mm]'
              }`}
            >
              {/* Subtle Company Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden z-0">
                <img
                  src={company.logoUrl || '/vrindavan_logo.jpeg'}
                  alt=""
                  className="w-[130mm] h-[130mm] object-contain rotate-[-15deg]"
                />
              </div>

              {/* Outer decorative frame */}
              <div className="border border-emerald-900/40 p-4 sm:p-5 rounded-lg flex flex-col justify-between min-h-full relative z-10">
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between border-b-2 border-emerald-950 pb-3 mb-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={company.logoUrl || '/vrindavan_logo.jpeg'}
                        alt={company.legalName}
                        className="w-16 h-16 object-contain drop-shadow-xs shrink-0"
                      />
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Official Digital & Printed Savings Ledger
                        </div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-emerald-950 leading-tight">
                          {company.legalName}
                        </h1>
                        <h2 className="text-xs sm:text-sm font-bold text-emerald-800">
                          {company.hindiName}
                        </h2>
                        <div className="text-[11px] text-slate-600 font-mono">
                          CIN: <strong>{company.cin}</strong> | नौरंगिया बरगहा रोड, कुशीनगर - 274805
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-emerald-950 text-white rounded text-xs font-bold tracking-wide">
                        ग्राहक बचत पासबुक
                      </div>
                      <div className="text-xs text-slate-600 mt-1 font-mono">
                        हेल्पलाइन: <strong>{company.mobile}</strong>
                      </div>
                      <div className="text-[10px] text-emerald-900 font-mono">
                        पृष्ठ सं: {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information Block */}
                  <div className="grid grid-cols-12 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg mb-3 text-xs">
                    {/* Photo / Avatar */}
                    <div className="col-span-2 flex flex-col items-center justify-center border-r border-slate-200 pr-2">
                      <div className="w-16 h-20 rounded border-2 border-emerald-800 bg-emerald-50 flex flex-col items-center justify-center text-emerald-800">
                        <User className="w-7 h-7 text-emerald-800 mb-0.5" />
                        <span className="text-[8px] font-bold">फोटो</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">{customer.id}</span>
                    </div>

                    {/* Customer & Account details */}
                    <div className="col-span-10 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">खाताधारक का नाम:</span>
                        <strong className="text-sm text-slate-900">{customer.nameHindi}</strong>
                        <div className="text-slate-600 text-[11px]">({customer.nameEnglish})</div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">खाता संख्या (Account No):</span>
                        <strong className="font-mono text-sm text-emerald-900">{account.accountNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">बचत योजना:</span>
                        <strong className="text-slate-800">{account.planNameHindi}</strong>
                        {account.isFlexible && (
                          <span className="block text-[9px] text-emerald-700 font-bold">
                            * फ्लेक्सी जमा (कभी भी, कितनी भी अनुमत राशि)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">पिता / पति का नाम:</span>
                        <strong className="text-slate-800">{customer.guardianName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">मोबाइल नंबर:</span>
                        <strong className="font-mono text-slate-800">{customer.mobile}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ब्याज दर (Annual Rate):</span>
                        <strong className="font-mono text-emerald-900">{account.annualInterestRate}% वार्षिक</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">खाता खोलने की तिथि:</span>
                        <span className="font-mono text-slate-800">{account.openingDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">नॉमिनी का नाम:</span>
                        <span className="text-slate-800">{customer.nomineeName} ({customer.nomineeRelation})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">पता:</span>
                        <span className="text-slate-700">{customer.village}, {customer.postOffice}, कुशीनगर</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-4 gap-2 mb-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
                      <span className="text-[10px] text-slate-600 block">कुल जमा राशि</span>
                      <span className="font-mono font-bold text-xs text-emerald-800">{formatINR(account.totalDeposited)}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-300 rounded p-1.5">
                      <span className="text-[10px] text-slate-600 block">कुल निकासी राशि</span>
                      <span className="font-mono font-bold text-xs text-rose-700">{formatINR(account.totalWithdrawn)}</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-300 rounded p-1.5">
                      <span className="text-[10px] text-slate-600 block">उपार्जित/क्रेडिट ब्याज</span>
                      <span className="font-mono font-bold text-xs text-blue-800">
                        {formatINR(account.totalInterestCredited + (account.accruedInterestUnposted || 0))}
                      </span>
                    </div>
                    <div className="bg-emerald-950 text-white rounded p-1.5 shadow-xs">
                      <span className="text-[10px] text-emerald-300 block">उपलब्ध कुल बैलेंस</span>
                      <span className="font-mono font-black text-sm text-emerald-300">{formatINR(account.currentBalance)}</span>
                    </div>
                  </div>

                  {/* Passbook Ledger Table */}
                  <div className="border border-slate-300 rounded-lg overflow-hidden mb-3">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-emerald-950 text-white font-medium text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5">तारीख</th>
                          <th className="py-2 px-2">रसीद / TXN ID</th>
                          <th className="py-2 px-2.5">विवरण</th>
                          <th className="py-2 px-2 text-right">जमा (+)</th>
                          <th className="py-2 px-2 text-right">निकासी (-)</th>
                          <th className="py-2 px-2.5 text-right">शेष बैलेंस</th>
                          <th className="py-2 px-2 text-center">हस्ताक्षर/कर्मचारी</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono">
                        {displayedTxns.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
                              इस पृष्ठ पर कोई लेनदेन दर्ज नहीं है।
                            </td>
                          </tr>
                        ) : (
                          displayedTxns.map((t, idx) => {
                            const isDep = t.type === 'deposit';
                            return (
                              <tr
                                key={t.id}
                                className={`hover:bg-slate-50 ${t.isReversed ? 'bg-amber-50/50 line-through text-slate-400' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                              >
                                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">{t.displayDate}</td>
                                <td className="py-1.5 px-2 text-slate-600 text-[10px] whitespace-nowrap">{t.receiptNumber}</td>
                                <td className="py-1.5 px-2.5 text-slate-800 font-sans text-[11px]">
                                  {t.remarks || (isDep ? 'बचत जमा' : 'निकासी')}
                                  {t.isReversed && <span className="ml-1 text-amber-700 font-bold no-underline">[रिवर्स]</span>}
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-emerald-700">
                                  {isDep ? formatINR(t.amount) : '-'}
                                </td>
                                <td className="py-1.5 px-2 text-right font-bold text-rose-700">
                                  {!isDep ? formatINR(t.amount) : '-'}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-extrabold text-emerald-950">
                                  {formatINR(t.currentBalance)}
                                </td>
                                <td className="py-1.5 px-2 text-center font-sans text-[10px] whitespace-nowrap">
                                  <span className="text-slate-500">{t.employeeName.split(' ')[0]}</span>
                                  <span className="text-[9px] text-emerald-800 ml-1 font-bold">✓</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Signatures Area */}
                <div className="pt-2 border-t border-slate-300 grid grid-cols-3 gap-4 items-end text-center text-xs text-slate-600">
                  <div>
                    <div className="h-8"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px]">खाताधारक के हस्ताक्षर</div>
                  </div>
                  <div>
                    <div className="h-8 flex items-center justify-center">
                      <div className="px-2.5 py-0.5 border border-dashed border-emerald-800 text-[9px] font-bold text-emerald-900 rounded">
                        VSMPL BRANCH SEAL
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[10px]">शाखा मुहर</div>
                  </div>
                  <div>
                    <div className="h-8 flex items-end justify-center text-[10px] text-slate-800 italic">
                      शाखा प्रबंधक (Branch Manager)
                    </div>
                    <div className="border-t border-slate-400 pt-1 text-[10px]">अधिकृत हस्ताक्षर</div>
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
