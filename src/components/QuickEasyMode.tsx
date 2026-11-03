import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import {
  UserPlus,
  FolderPlus,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  BookOpen,
  Printer,
  Receipt,
  Users,
  Calculator,
  FileText,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface QuickEasyModeProps {
  onNavigate: (tabId: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenCustomer: () => void;
  onOpenAccount: () => void;
  onOpenEOD: () => void;
}

export const QuickEasyMode: React.FC<QuickEasyModeProps> = ({
  onNavigate,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenCustomer,
  onOpenAccount,
  onOpenEOD
}) => {
  const { customers, accounts, transactions, setReceiptForPrint, setPassbookForPrint } = useSavingsData();
  const [searchAccountQuery, setSearchAccountQuery] = useState('');
  const [showAccountSearchModal, setShowAccountSearchModal] = useState(false);

  // Quick Action cards definition
  const actionCards = [
    {
      id: 'quick_deposit',
      title: 'त्वरित जमा (Quick Deposit)',
      subtitle: 'किसी भी ग्राहक का ऐच्छिक पैसा जमा करें',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: ArrowUpCircle,
      action: onOpenDeposit
    },
    {
      id: 'quick_withdrawal',
      title: 'त्वरित निकासी (Quick Withdrawal)',
      subtitle: 'अधिकृत बचत राशि का भुगतान करें',
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: ArrowDownCircle,
      action: onOpenWithdrawal
    },
    {
      id: 'add_customer',
      title: 'नया ग्राहक जोड़ें (Add Customer)',
      subtitle: 'स्वतः अंग्रेजी नाम लिप्यांतरण व KYC',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: UserPlus,
      action: onOpenCustomer
    },
    {
      id: 'open_account',
      title: 'खाता खोलें (Open Account)',
      subtitle: 'फ्लेक्सी, दैनिक या मासिक बचत खाता',
      color: 'bg-teal-600 hover:bg-teal-700 text-white',
      icon: FolderPlus,
      action: onOpenAccount
    },
    {
      id: 'search_account',
      title: 'खाता खोजें (Search Account)',
      subtitle: 'नाम, मोबाइल या खाता नंबर से खोजें',
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      icon: Search,
      action: () => setShowAccountSearchModal(true)
    },
    {
      id: 'digital_passbook',
      title: 'डिजिटल पासबुक (Digital Passbook)',
      subtitle: 'ग्राहक का सम्पूर्ण लेनदेन इतिहास देखें',
      color: 'bg-emerald-800 hover:bg-emerald-900 text-white',
      icon: BookOpen,
      action: () => {
        if (customers.length > 0 && accounts.length > 0) {
          const cust = customers[0];
          const acc = accounts.find(a => a.customerId === cust.id) || accounts[0];
          setPassbookForPrint({ customer: cust, account: acc });
        } else {
          onNavigate('customer');
        }
      }
    },
    {
      id: 'print_passbook',
      title: 'पासबुक प्रिंट (Print Passbook)',
      subtitle: 'फिजिकल A4/A5 पासबुक मुद्रण',
      color: 'bg-slate-800 hover:bg-slate-900 text-white',
      icon: Printer,
      action: () => {
        if (customers.length > 0 && accounts.length > 0) {
          setPassbookForPrint({ customer: customers[0], account: accounts[0] });
        }
      }
    },
    {
      id: 'print_receipt',
      title: 'रसीद प्रिंट (Print Receipt)',
      subtitle: 'अंतिम लेनदेन की VIP रसीद देखें',
      color: 'bg-cyan-700 hover:bg-cyan-800 text-white',
      icon: Receipt,
      action: () => {
        if (transactions.length > 0) {
          setReceiptForPrint(transactions[0]);
        }
      }
    },
    {
      id: 'employee_collection',
      title: 'कर्मचारी कलेक्शन (Field Collection)',
      subtitle: 'आवंटित ग्राहक व आज का संग्रह',
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      icon: Users,
      action: () => onNavigate('employee_panel')
    },
    {
      id: 'interest_calculator',
      title: 'ब्याज कैलकुलेटर (Interest Calculator)',
      subtitle: 'दैनिक शेष आधारित ब्याज गणना',
      color: 'bg-violet-700 hover:bg-violet-800 text-white',
      icon: Calculator,
      action: () => onNavigate('calculator')
    },
    {
      id: 'reports',
      title: 'रिपोर्ट्स व रोकड़ बही (Reports)',
      subtitle: 'डे-बुक, जमा-निकासी व कर्मचारी रिपोर्ट',
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      icon: FileText,
      action: () => onNavigate('reports')
    },
    {
      id: 'daily_closing',
      title: 'आज का हिसाब बंद (Daily Closing)',
      subtitle: 'एक ही क्लिक में दिन का पूरा हिसाब',
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: CheckCircle,
      action: onOpenEOD
    }
  ];

  // Search Results
  const matchingAccounts = accounts.filter(a => {
    if (!searchAccountQuery.trim()) return false;
    const q = searchAccountQuery.toLowerCase();
    const cust = customers.find(c => c.id === a.customerId);
    return (
      a.accountNumber.toLowerCase().includes(q) ||
      (cust && (cust.nameHindi.toLowerCase().includes(q) || cust.nameEnglish.toLowerCase().includes(q) || cust.mobile.includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Quick & Easy Touch Mode</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            सरल बड़ा बटन मोड (12 मुख्य कार्य)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            बिना किसी जटिलता के सीधे बड़े बटनों से 1-क्लिक में जमा, निकासी, रसीद, पासबुक व क्लोजिंग पूरी करें।
          </p>
        </div>
      </div>

      {/* 12 Big Touch Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {actionCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={card.action}
              className={`${card.color} p-5 rounded-2xl shadow-sm transition active:scale-98 flex flex-col justify-between text-left h-36 sm:h-40 cursor-pointer group`}
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-[11px] font-mono font-bold opacity-80">#{idx + 1}</span>
                <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>

              <div>
                <strong className="text-sm sm:text-base font-extrabold block leading-tight">
                  {card.title}
                </strong>
                <span className="text-[11px] opacity-85 block mt-1 line-clamp-1">
                  {card.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Search Account Modal */}
      {showAccountSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <span>त्वरित खाता खोज (Fast Account Search)</span>
              </h3>
              <button
                onClick={() => setShowAccountSearchModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={searchAccountQuery}
              onChange={e => setSearchAccountQuery(e.target.value)}
              placeholder="ग्राहक नाम, मोबाइल या खाता संख्या लिखें..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-2xl text-sm font-semibold focus:outline-hidden focus:border-indigo-600"
            />

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {matchingAccounts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  {searchAccountQuery ? 'कोई खाता नहीं मिला।' : 'नाम या मोबाइल लिखकर खोजें...'}
                </div>
              ) : (
                matchingAccounts.map(acc => {
                  const cust = customers.find(c => c.id === acc.customerId);
                  return (
                    <div key={acc.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {cust?.nameHindi} ({cust?.nameEnglish})
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          खाता: {acc.accountNumber} • मो: {cust?.mobile}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-900 text-sm">
                          {formatINR(acc.currentBalance)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (cust) {
                              setPassbookForPrint({ customer: cust, account: acc });
                              setShowAccountSearchModal(false);
                            }
                          }}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold hover:bg-indigo-100"
                        >
                          पासबुक
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
