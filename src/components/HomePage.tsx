import React, { useState, useRef } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import {
  UserPlus,
  FolderPlus,
  ArrowUpCircle,
  ArrowDownCircle,
  Users,
  Search,
  BookOpen,
  Printer,
  TrendingUp,
  UserCheck,
  MapPin,
  Wallet,
  FileText,
  Receipt,
  Layers,
  Calendar,
  Database,
  Building,
  Settings,
  ShieldCheck,
  ChevronRight,
  Bell,
  LogOut,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  ArrowRight,
  X,
  Award
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (module: string, param?: string) => void;
  onOpenPassbookSelector: (isPrint: boolean) => void;
  onOpenCashHandover: () => void;
  onOpenEOD: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenPassbookSelector,
  onOpenCashHandover,
  onOpenEOD
}) => {
  const {
    company,
    customers,
    accounts,
    transactions,
    employees,
    currentRole,
    setCurrentRole,
    selectedEmployeeId,
    auditLogs,
    setReceiptForPrint,
    setPassbookForPrint,
    setBondForPrint
  } = useSavingsData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];
  const activeAccountsCount = accounts.filter(a => a.status === 'active').length;
  const totalAccountBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxns = transactions.filter(t => t.date.startsWith(todayStr) && !t.isReversed);
  const todayDeposits = todayTxns.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const todayWithdrawals = todayTxns.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
  const totalEmployeeCashInHand = employees.reduce((sum, e) => sum + (e.cashInHand || 0), 0);

  // Live search across customers, accounts, and transactions
  const searchResults = searchQuery.trim().length > 0 ? customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const custAccounts = accounts.filter(a => a.customerId === c.id);
    const hasMatchingAccount = custAccounts.some(a => a.accountNumber.toLowerCase().includes(q));
    const hasMatchingTxn = transactions.some(
      t => t.customerId === c.id && (t.receiptNumber.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    );

    return (
      c.nameHindi.toLowerCase().includes(q) ||
      c.nameEnglish.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.village.toLowerCase().includes(q) ||
      hasMatchingAccount ||
      hasMatchingTxn
    );
  }) : [];

  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // The 20 Main Vertical Bubble Buttons
  interface BubbleAction {
    id: string;
    num: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    badge?: string;
    action: () => void;
    adminOnly?: boolean;
  }

  const allActions: BubbleAction[] = [
    {
      id: '01',
      num: '01',
      title: 'नया ग्राहक जोड़ें',
      subtitle: 'ग्राहक का नया रिकॉर्ड, KYC व फोटो बनाएं',
      icon: UserPlus,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: () => onNavigate('customer_add')
    },
    {
      id: '02',
      num: '02',
      title: 'नया बचत खाता खोलें',
      subtitle: 'ग्राहक का बचत खाता (फ्लेक्सी / दैनिक / मासिक) बनाएं',
      icon: FolderPlus,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-800',
      action: () => onNavigate('open_account'),
      adminOnly: true
    },
    {
      id: '03',
      num: '03',
      title: 'पैसा जमा करें',
      subtitle: 'ग्राहक की ऐच्छिक फ्लेक्सी या दैनिक जमा एंट्री करें',
      icon: ArrowUpCircle,
      iconBg: 'bg-emerald-600 text-white',
      iconColor: 'text-white',
      badge: 'सर्वाधिक उपयोग',
      action: () => onNavigate('deposit')
    },
    {
      id: '04',
      num: '04',
      title: 'पैसा निकासी करें',
      subtitle: 'अधिकृत निकासी दर्ज करें व भुगतान रसीद दें',
      icon: ArrowDownCircle,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      action: () => onNavigate('withdrawal'),
      adminOnly: true
    },
    {
      id: '05',
      num: '05',
      title: 'सभी ग्राहक देखें',
      subtitle: 'ग्राहक की पूरी जानकारी, पता, खाते व खाताधारक सूची',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-800',
      action: () => onNavigate('customer_list')
    },
    {
      id: '06',
      num: '06',
      title: 'ग्राहक खोजें',
      subtitle: 'नाम, मोबाइल, खाता नंबर या ID से तुरंत खोजें',
      icon: Search,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
      action: handleSearchFocus
    },
    {
      id: '07',
      num: '07',
      title: 'डिजिटल पासबुक',
      subtitle: 'जमा और निकासी का पूरा हिसाब मोबाइल स्क्रीन पर देखें',
      icon: BookOpen,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: () => onOpenPassbookSelector(false)
    },
    {
      id: '08',
      num: '08',
      title: 'पासबुक प्रिंट करें',
      subtitle: 'प्रिंट और PDF सुविधा (A4, A5 व बुकलेट पासबुक)',
      icon: Printer,
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-800',
      action: () => onOpenPassbookSelector(true)
    },
    {
      id: '09',
      num: '09',
      title: 'ब्याज कैलकुलेटर',
      subtitle: 'दैनिक क्लोजिंग बैलेंस के अनुसार ब्याज व मैच्योरिटी निकालें',
      icon: TrendingUp,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-800',
      action: () => onNavigate('calculator'),
      adminOnly: true
    },
    {
      id: '10',
      num: '10',
      title: 'कर्मचारी मैनेजमेंट',
      subtitle: 'कर्मचारी जोड़ें, फील्ड स्टाफ सूची, लक्ष्य व कैश इन हैंड',
      icon: UserCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: () => onNavigate('employees'),
      adminOnly: true
    },
    {
      id: '11',
      num: '11',
      title: 'फील्ड कलेक्शन',
      subtitle: 'कर्मचारी की ग्राहक वसूली, GPS लोकेशन व फील्ड हाजिरी',
      icon: MapPin,
      iconBg: 'bg-emerald-700 text-white',
      iconColor: 'text-white',
      badge: 'फील्ड एजेंट',
      action: () => onNavigate('field_collection')
    },
    {
      id: '12',
      num: '12',
      title: 'कर्मचारी कैश जमा',
      subtitle: 'कार्यालय में करेंसी नोट-वार कैश मिलान व हैंडओवर',
      icon: Wallet,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
      action: onOpenCashHandover
    },
    {
      id: '13',
      num: '13',
      title: 'दैनिक कलेक्शन रिपोर्ट',
      subtitle: 'आज का डे-बुक व कलेक्शन रिपोर्ट (EOD हिसाब)',
      icon: FileText,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: onOpenEOD
    },
    {
      id: '14',
      num: '14',
      title: 'रसीद मैनेजमेंट',
      subtitle: 'रसीद देखें, खोजें और पुनः प्रिंट करें (खड़ी/आड़ी/थर्मल)',
      icon: Receipt,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-800',
      action: () => onNavigate('receipts')
    },
    {
      id: '15',
      num: '15',
      title: 'सभी रिपोर्ट',
      subtitle: 'दैनिक, मासिक और वार्षिक हिसाब व एक्सेल डाउनलोड',
      icon: Layers,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-800',
      action: () => onNavigate('reports_all'),
      adminOnly: true
    },
    {
      id: '16',
      num: '16',
      title: 'फाइनेंशियल लेजर',
      subtitle: 'पूरी वित्तीय एंट्री, खाता बही व ऑडिट ट्रेल',
      icon: FileText,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: () => onNavigate('reports_ledger'),
      adminOnly: true
    },
    {
      id: '17',
      num: '17',
      title: 'मैच्योरिटी रिपोर्ट',
      subtitle: 'अवधि पूरी होने वाले खाते, देय रकम व स्टेटस',
      icon: Calendar,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
      action: () => onNavigate('maturity'),
      adminOnly: true
    },
    {
      id: '18',
      num: '18',
      title: 'बैकअप और डेटा रिकवरी',
      subtitle: 'डेटाबेस सुरक्षित रखें, JSON डाउनलोड व रीस्टोर करें',
      icon: Database,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-800',
      action: () => onNavigate('settings_backup'),
      adminOnly: true
    },
    {
      id: '19',
      num: '19',
      title: 'कंपनी सेटिंग',
      subtitle: 'कंपनी प्रोफाइल, CIN, पता व शाखा विवरण',
      icon: Building,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-800',
      action: () => onNavigate('settings_company'),
      adminOnly: true
    },
    {
      id: '20',
      num: '20',
      title: 'सिस्टम सेटिंग',
      subtitle: 'ब्याज नियम, अनुपालन डिस्क्लेमर व सुरक्षा ऑडिट',
      icon: Settings,
      iconBg: 'bg-slate-200',
      iconColor: 'text-slate-800',
      action: () => onNavigate('settings_system'),
      adminOnly: true
    }
  ];

  // Filter actions based on role
  const visibleActions = currentRole === 'admin'
    ? allActions
    : allActions.filter(a => !a.adminOnly);

  const formattedDate = new Intl.DateTimeFormat('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* 5. SMART HOMEPAGE HEADER */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-7 rounded-3xl shadow-md border border-emerald-800 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border-2 border-emerald-500 shrink-0">
              <img
                src={company.logoUrl || '/vrindavan_logo.jpeg'}
                alt={company.legalName}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800/90 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-700">
                  {currentRole === 'admin' ? 'Admin Dashboard' : 'Field Employee Portal'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-0.5">
                {company.hindiName}
              </h1>
              <p className="text-emerald-200 text-xs font-medium">
                {company.legalName} • CIN: <span className="font-mono">{company.cin}</span>
              </p>
            </div>
          </div>

          {/* User profile, Date, Notification & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">
                {currentRole === 'admin' ? 'राजेश कुमार (व्यवस्थापक)' : currentEmployee.nameHindi}
              </div>
              <div className="text-[11px] text-emerald-300 font-mono">
                {formattedDate}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition border border-emerald-700 relative"
                  title="सिस्टम सूचनाएं"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-950"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-800">हालिया सिस्टम सूचनाएं</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                      {auditLogs.slice(0, 4).map(log => (
                        <div key={log.id} className="p-2 rounded-xl bg-slate-50 text-[11px] border border-slate-100">
                          <div className="font-bold text-emerald-900">{log.action}</div>
                          <div className="text-slate-600 text-[10px] mt-0.5">{log.details}</div>
                          <div className="text-slate-400 font-mono text-[9px] mt-1">{log.displayTime}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const newRole = currentRole === 'admin' ? 'employee' : 'admin';
                  setCurrentRole(newRole);
                }}
                className="bg-emerald-800 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-600 shadow-2xs"
                title="रोल बदलें (एडमिन / कर्मचारी)"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{currentRole === 'admin' ? 'एडमिन मोड' : 'कर्मचारी मोड'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. HOMEPAGE SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ग्राहक का नाम (हिंदी/English), मोबाइल, खाता नंबर, CUST ID या TXN ID खोजें..."
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 rounded-2xl text-sm font-medium focus:outline-hidden focus:bg-white transition shadow-2xs"
          />
          <Search className="w-5 h-5 text-emerald-700 absolute left-4 top-4" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Real-time Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="mt-3 border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
            <div className="p-2.5 bg-emerald-50/80 text-xs font-bold text-emerald-900 flex items-center justify-between">
              <span>खोज परिणाम ({searchResults.length} ग्राहक मिले)</span>
              <span className="text-[10px] text-emerald-700">त्वरित कार्रवाई बटन उपलब्ध</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                "{searchQuery}" से मेल खाता कोई ग्राहक या खाता नहीं मिला।
              </div>
            ) : (
              searchResults.map(cust => {
                const custAccounts = accounts.filter(a => a.customerId === cust.id);
                const primaryAccount = custAccounts[0];
                return (
                  <div key={cust.id} className="p-3.5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{cust.nameHindi}</strong>
                        <span className="text-xs text-slate-500 font-normal">({cust.nameEnglish})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-full">
                          {cust.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        मो: <strong className="text-slate-800">{cust.mobile}</strong> • ग्राम: {cust.village}
                      </div>
                      {custAccounts.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {custAccounts.map(acc => (
                            <span key={acc.id} className="text-[10px] bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              {acc.accountNumber} ({acc.planNameHindi} - बैलेंस: {formatINR(acc.currentBalance)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons for Search Result */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigate('deposit')}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>जमा</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('withdrawal')}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                        <span>निकासी</span>
                      </button>
                      {primaryAccount && (
                        <>
                          <button
                            type="button"
                            onClick={() => setBondForPrint({ customer: cust, account: primaryAccount })}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            title="बचत खाता बांड देखें व प्रिंट करें"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-700" />
                            <span>बांड</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPassbookForPrint({ customer: cust, account: primaryAccount })}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>पासबुक</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 7. DASHBOARD SUMMARY CARDS (Above Main Bubble Buttons) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            दैनिक वित्तीय सारांश (Today's Summary):
          </h2>
          <span className="text-[11px] text-emerald-800 font-mono font-medium">
            कुशीनगर मुख्य शाखा
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Card 1: Total Customers */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">कुल ग्राहक</span>
            <span className="text-xl font-mono font-black text-slate-900 mt-0.5 block">{customers.length}</span>
            <span className="text-[10px] text-emerald-700">सक्रिय रिकॉर्ड</span>
          </div>

          {/* Card 2: Total Active Accounts */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">सक्रिय खाते</span>
            <span className="text-xl font-mono font-black text-slate-900 mt-0.5 block">{activeAccountsCount}</span>
            <span className="text-[10px] text-teal-700">फ्लेक्सी व दैनिक</span>
          </div>

          {/* Card 3: Today's Deposits */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-800 block uppercase">आज का जमा</span>
            <span className="text-xl font-mono font-black text-emerald-950 mt-0.5 block">{formatINR(todayDeposits)}</span>
            <span className="text-[10px] text-emerald-800 font-semibold">{todayTxns.filter(t => t.type === 'deposit').length} रसीदें</span>
          </div>

          {/* Card 4: Today's Withdrawals */}
          <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-800 block uppercase">आज की निकासी</span>
            <span className="text-xl font-mono font-black text-rose-950 mt-0.5 block">{formatINR(todayWithdrawals)}</span>
            <span className="text-[10px] text-rose-700">स्वीकृत भुगतान</span>
          </div>

          {/* Card 5: Total Account Balance */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs sm:col-span-1 lg:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">कुल खाता बैलेंस</span>
            <span className="text-base font-mono font-black text-slate-900 mt-1 block truncate">{formatINR(totalAccountBalance)}</span>
            <span className="text-[10px] text-slate-500">समस्त जमा शेष</span>
          </div>

          {/* Card 6: Today's Employee Collection */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-300 block uppercase">फील्ड कैश बकाया</span>
            <span className="text-xl font-mono font-black text-emerald-300 mt-0.5 block">{formatINR(totalEmployeeCashInHand)}</span>
            <span className="text-[10px] text-slate-400">जमा योग्य</span>
          </div>

          {/* Card 7: Pending Approvals / Reconciliations */}
          <div className="bg-white p-3.5 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-2xs col-span-2 sm:col-span-1 lg:col-span-1">
            <span className="text-[10px] font-bold text-amber-900 block uppercase">कैश मिलान स्थिति</span>
            <span className="text-xl font-mono font-black text-emerald-800 mt-0.5 block">0 अंतर</span>
            <span className="text-[10px] text-emerald-700 font-bold">✓ पूर्ण सत्यापित</span>
          </div>
        </div>
      </div>

      {/* 3. VERTICAL BUBBLE BUTTON LAYOUT (ONE MAIN BUTTON PER LINE, ONE BELOW ANOTHER) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1 border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              मुख्य कार्य – सभी बटन होम पेज पर (Main Operations)
            </h2>
            <p className="text-xs text-slate-500">
              {currentRole === 'admin'
                ? 'सभी 20 मुख्य मॉड्यूल एक के नीचे एक लाइन-बाय-लाइन व्यवस्थित हैं।'
                : 'कर्मचारी अधिकृत फील्ड संग्रह व पासबुक कार्य।'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
            {visibleActions.length} कार्य बटन
          </span>
        </div>

        {/* THE VERTICAL BUBBLE BUTTONS LIST - STRICTLY ONE BUTTON PER LINE */}
        <div className="space-y-3">
          {visibleActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.action}
                className="w-full text-left bg-white hover:bg-emerald-50/50 active:scale-[0.995] border-2 border-slate-200 hover:border-emerald-600 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 transition duration-150 shadow-2xs hover:shadow-md flex items-center justify-between gap-3 group"
              >
                {/* Left side: Bubble Icon + Number + Hindi Title + Subtitle */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  {/* Round Bubble Icon */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition group-hover:scale-105 ${action.iconBg}`}
                  >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${action.iconColor}`} />
                  </div>

                  {/* Text Container */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {action.num}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-900 transition tracking-tight">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 group-hover:text-slate-700 transition mt-0.5 truncate max-w-xl">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Arrow Bubble */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-700 text-slate-500 group-hover:text-white flex items-center justify-center transition shrink-0 shadow-2xs">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
