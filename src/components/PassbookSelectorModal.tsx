import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { BookOpen, Search, X, ArrowRight, Printer, Award } from 'lucide-react';

interface PassbookSelectorModalProps {
  onClose: () => void;
  isPrintMode?: boolean;
}

export const PassbookSelectorModal: React.FC<PassbookSelectorModalProps> = ({ onClose, isPrintMode = false }) => {
  const { customers, accounts, setPassbookForPrint, setBondForPrint } = useSavingsData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      c.nameHindi.toLowerCase().includes(term) ||
      c.nameEnglish.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.village.toLowerCase().includes(term)
    );
  });

  const handleSelect = (customerId: string, accountId?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;
    const custAccounts = accounts.filter(a => a.customerId === customerId);
    const targetAcc = accountId ? custAccounts.find(a => a.id === accountId) : custAccounts[0];
    if (targetAcc) {
      setPassbookForPrint({ customer: cust, account: targetAcc });
      onClose();
    }
  };

  const handleSelectBond = (customerId: string, accountId?: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;
    const custAccounts = accounts.filter(a => a.customerId === customerId);
    const targetAcc = accountId ? custAccounts.find(a => a.id === accountId) : custAccounts[0];
    if (targetAcc) {
      setBondForPrint({ customer: cust, account: targetAcc });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center">
              {isPrintMode ? <Printer className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isPrintMode ? 'पासबुक प्रिंटिंग केंद्र (Passbook Print & PDF)' : 'डिजिटल पासबुक चयन (Select Customer Account)'}
              </h2>
              <p className="text-xs text-emerald-200">
                पासबुक देखने व प्रिंट करने के लिए ग्राहक या खाता चुनें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ग्राहक का नाम, मोबाइल नंबर, CUST ID लिखें..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Customer Accounts List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto divide-y divide-slate-100 space-y-2">
          {filteredCustomers.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              कोई ग्राहक या खाता नहीं मिला।
            </div>
          ) : (
            filteredCustomers.map(cust => {
              const custAccounts = accounts.filter(a => a.customerId === cust.id);
              return (
                <div key={cust.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-bold text-sm text-slate-900">{cust.nameHindi}</span>{' '}
                      <span className="text-xs text-slate-500">({cust.nameEnglish})</span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ID: {cust.id} • मो: {cust.mobile} • ग्राम: {cust.village}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {custAccounts.map(acc => (
                      <div
                        key={acc.id}
                        className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-emerald-950">
                              {acc.accountNumber}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                              {acc.planNameHindi}
                            </span>
                            {acc.bondNumber && (
                              <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-300 font-mono px-1.5 py-0.2 rounded font-bold">
                                बांड: {acc.bondNumber}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            वर्तमान शेष: <strong className="text-slate-800 font-mono">{formatINR(acc.currentBalance)}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelect(cust.id, acc.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition flex items-center gap-1"
                            title="डिजिटल पासबुक देखें / प्रिंट करें"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{isPrintMode ? 'पासबुक प्रिंट' : 'पासबुक'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectBond(cust.id, acc.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1 shadow-2xs"
                            title="डिजिटल बचत खाता बांड (Savings Bond Certificate) देखें व प्रिंट करें"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>बचत बांड</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
