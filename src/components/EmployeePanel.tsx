import React, { useState, useEffect } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import {
  Users,
  CheckCircle2,
  Clock,
  Wallet,
  Receipt,
  BookOpen,
  ArrowRight,
  Calculator,
  Search,
  Check,
  Send,
  MapPin,
  Navigation,
  LogIn,
  LogOut,
  AlertCircle,
  Share2,
  Calendar,
  FileText
} from 'lucide-react';

export const EmployeePanel: React.FC = () => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    customers,
    accounts,
    transactions,
    addDeposit,
    setReceiptForPrint,
    setPassbookForPrint,
    submitDailyClosing,
    punchInAttendance,
    punchOutAttendance,
    updateCustomerVisit
  } = useSavingsData();

  const currentEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Customers assigned to this employee
  const assignedCustomers = customers.filter(
    c => c.assignedEmployeeId === currentEmployee.id || !c.assignedEmployeeId
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'collection' | 'history' | 'closing' | 'attendance'>('collection');

  // Quick Deposit modal state
  const [collectingCustId, setCollectingCustId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [depositMethod, setDepositMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [depositRefNo, setDepositRefNo] = useState('');
  const [depositRemarks, setDepositRemarks] = useState('फ्लेक्सी बचत संग्रह');
  const [currentGps, setCurrentGps] = useState<{ lat?: number; lng?: number; locName: string; accuracy?: number }>({
    locName: 'नौरंगिया, कुशीनगर (26.9015° N, 83.9854° E)'
  });

  // Daily Cash Closing Denominations State
  const [denom, setDenom] = useState({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0
  });
  const [closingRemarks, setClosingRemarks] = useState('');
  const [closingSuccess, setClosingSuccess] = useState(false);

  // Capture real GPS on mount or on action with user consent
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCurrentGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            locName: `कुशीनगर फील्ड (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`
          });
        },
        () => {
          // Fallback to designated branch area
          setCurrentGps({
            locName: 'नौरंगिया बरगहा रोड, कुशीनगर (शाखा परिक्षेत्र)'
          });
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Filtered assigned customers
  const filteredAssigned = assignedCustomers.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nameHindi.toLowerCase().includes(term) ||
      c.nameEnglish.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.village.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  });

  // Calculate today's collections by this employee
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEmpTxns = transactions.filter(
    t => t.employeeId === currentEmployee.id && t.date.startsWith(todayStr) && t.type === 'deposit'
  );

  const totalCollectedToday = todayEmpTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalCashCollected = todayEmpTxns.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
  const totalUpiCollected = todayEmpTxns.filter(t => t.paymentMethod === 'upi').reduce((sum, t) => sum + t.amount, 0);
  const totalBankCollected = todayEmpTxns.filter(t => t.paymentMethod === 'bank_transfer').reduce((sum, t) => sum + t.amount, 0);

  const targetAmount = currentEmployee.todayTargetAmount || 5000;
  const cashInHand = currentEmployee.cashInHand || totalCashCollected;

  // Completed vs Pending visits
  const paidCustIds = new Set(todayEmpTxns.map(t => t.customerId));
  const completedCount = assignedCustomers.filter(c => paidCustIds.has(c.id) || c.visitStatus === 'visited_collected').length;
  const pendingCount = Math.max(0, assignedCustomers.length - completedCount);

  // Handle Flexible Deposit Collection
  const handleQuickCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingCustId) return;

    const custAccs = accounts.filter(a => a.customerId === collectingCustId && a.status === 'active');
    if (custAccs.length === 0) return;

    const targetAcc = custAccs[0];
    const newTxn = addDeposit({
      accountId: targetAcc.id,
      amount: depositAmount,
      paymentMethod: depositMethod,
      employeeId: currentEmployee.id,
      referenceNo: depositMethod !== 'cash' ? depositRefNo : undefined,
      remarks: depositRemarks.trim() || 'फ्लेक्सी बचत संग्रह',
      gpsLocation: currentGps.locName,
      coordinates: currentGps.lat && currentGps.lng ? { latitude: currentGps.lat, longitude: currentGps.lng, accuracy: currentGps.accuracy } : undefined
    });

    updateCustomerVisit(collectingCustId, 'visited_collected', 'सफलतापूर्वक संग्रह पूर्ण');
    setReceiptForPrint(newTxn);
    setCollectingCustId(null);
    setDepositRefNo('');
  };

  // Denominations Total
  const calculatedDenomTotal =
    denom.n500 * 500 +
    denom.n200 * 200 +
    denom.n100 * 100 +
    denom.n50 * 50 +
    denom.n20 * 20 +
    denom.n10 * 10 +
    Number(denom.coins || 0);

  const shortOrExcess = calculatedDenomTotal - cashInHand;

  const handleCashClosingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDailyClosing({
      date: new Date().toISOString(),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.nameHindi,
      branchId: currentEmployee.branchId,
      totalCollected: totalCashCollected,
      submittedToOffice: calculatedDenomTotal,
      shortOrExcess,
      denominations: {
        note500: denom.n500,
        note200: denom.n200,
        note100: denom.n100,
        note50: denom.n50,
        note20: denom.n20,
        note10: denom.n10,
        coins: Number(denom.coins || 0)
      },
      verifiedBy: 'अनीता देवी (मुख्य लेखापाल)',
      remarks: closingRemarks.trim() || 'दैनिक नकद हैंडओवर क्लोजिंग',
      status: shortOrExcess === 0 ? 'submitted' : 'discrepancy'
    });

    setClosingSuccess(true);
    setTimeout(() => setClosingSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Employee Profile Strip */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 rounded-3xl shadow-sm border border-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-sm border border-emerald-400">
            {currentEmployee.nameEnglish.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                फील्ड संग्रह ऐप (Field Collection Portal)
              </span>
              <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                {currentEmployee.id}
              </span>
              {currentEmployee.isPunchedIn ? (
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  पंच-इन सक्रिय
                </span>
              ) : (
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  पंच-आउट
                </span>
              )}
            </div>
            <h1 className="text-xl font-extrabold mt-0.5">{currentEmployee.nameHindi}</h1>
            <p className="text-slate-400 text-xs font-mono flex items-center gap-2 mt-0.5">
              <span>मो: {currentEmployee.mobile}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {currentGps.locName}
              </span>
            </p>
          </div>
        </div>

        {/* Attendance & Employee Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {currentEmployee.isPunchedIn ? (
            <button
              type="button"
              onClick={() => punchOutAttendance(currentEmployee.id, currentGps.locName)}
              className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>हाजिरी पंच-आउट (Punch Out)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => punchInAttendance(currentEmployee.id, currentGps.locName, currentGps.lat && currentGps.lng ? { latitude: currentGps.lat, longitude: currentGps.lng } : undefined)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>हाजिरी पंच-इन (Punch In)</span>
            </button>
          )}

          <div className="bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5">
            <span className="text-slate-400">कर्मचारी:</span>
            <select
              value={selectedEmployeeId}
              onChange={e => setSelectedEmployeeId(e.target.value)}
              className="bg-slate-900 text-white border border-slate-600 rounded-lg px-2 py-1 text-xs font-medium focus:outline-hidden"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nameHindi} ({emp.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Individual Employee Cash Ledger Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              व्यक्तिगत संग्रह लेजर (Individual Cash & Digital Ledger)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            आरंभिक नकद (Opening): {formatINR(currentEmployee.openingCash || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-500 block">आज का कुल संग्रह</span>
            <span className="text-base font-mono font-extrabold text-slate-900">{formatINR(totalCollectedToday)}</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl">
            <span className="text-[10px] text-emerald-800 font-semibold block">नकद संग्रह (Cash)</span>
            <span className="text-base font-mono font-extrabold text-emerald-900">{formatINR(totalCashCollected)}</span>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl">
            <span className="text-[10px] text-blue-800 font-semibold block">ऑनलाइन UPI</span>
            <span className="text-base font-mono font-extrabold text-blue-900">{formatINR(totalUpiCollected)}</span>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl">
            <span className="text-[10px] text-purple-800 font-semibold block">बैंक ट्रांसफर</span>
            <span className="text-base font-mono font-extrabold text-purple-900">{formatINR(totalBankCollected)}</span>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
            <span className="text-[10px] text-slate-600 block">कार्यालय में जमा</span>
            <span className="text-base font-mono font-extrabold text-slate-800">
              {formatINR(currentEmployee.cashSubmittedToOffice || 0)}
            </span>
          </div>

          <div className="p-3 bg-emerald-950 text-white rounded-xl shadow-xs">
            <span className="text-[10px] text-emerald-300 block font-semibold">हाथ में शेष नकद</span>
            <span className="text-base font-mono font-black text-emerald-300">{formatINR(cashInHand)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('collection')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'collection'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>आवंटित ग्राहक व फ्लेक्सी कलेक्शन ({assignedCustomers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>आज का संग्रह इतिहास ({todayEmpTxns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('closing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'closing'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>दैनिक कैश क्लोजिंग व हैंडओवर</span>
        </button>
      </div>

      {/* TAB 1: Assigned Customers & Flexible Collection */}
      {activeTab === 'collection' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ग्राहक नाम, मोबाइल, ग्राम या खाता संख्या से खोजें..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssigned.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                कोई आवंटित ग्राहक नहीं मिला।
              </div>
            ) : (
              filteredAssigned.map(cust => {
                const custAccs = accounts.filter(a => a.customerId === cust.id && a.status === 'active');
                const primaryAcc = custAccs[0];
                const isPaidToday = paidCustIds.has(cust.id);

                return (
                  <div
                    key={cust.id}
                    className={`bg-white rounded-3xl border p-5 shadow-2xs transition flex flex-col justify-between ${
                      isPaidToday ? 'border-emerald-300 bg-emerald-50/25' : 'border-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900">{cust.nameHindi}</span>
                            {isPaidToday && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> आज जमा पूर्ण
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {cust.nameEnglish} • ID: <span className="font-mono">{cust.id}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">वर्तमान शेष</span>
                          <span className="font-mono font-extrabold text-emerald-950 text-sm">
                            {formatINR(primaryAcc?.currentBalance || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                        <div>
                          मो: <strong className="font-mono text-slate-800">{cust.mobile}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          ग्राम: {cust.village}, {cust.postOffice}
                        </div>
                        {cust.savingsGoal && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                            बचत लक्ष्य: <strong>{formatINR(cust.savingsGoal)}</strong>
                          </div>
                        )}
                        {cust.lastVisitNotes && (
                          <div className="text-[10px] text-slate-500 italic">
                            नोट: {cust.lastVisitNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {primaryAcc && (
                        <button
                          type="button"
                          onClick={() => setPassbookForPrint({ customer: cust, account: primaryAcc })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>पासबुक</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCollectingCustId(cust.id);
                          setDepositAmount(primaryAcc?.installmentAmount || 100);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
                          isPaidToday
                            ? 'bg-slate-800 text-white hover:bg-slate-900'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{isPaidToday ? 'पुनः ऐच्छिक जमा' : 'फ्लेक्सी जमा लें (Collect)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Flexible Quick Deposit Modal */}
      {collectingCustId && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-700" />
                <span>फ्लेक्सी बचत संग्रह (Flexible Deposit)</span>
              </h3>
              <button
                type="button"
                onClick={() => setCollectingCustId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {(() => {
              const c = customers.find(item => item.id === collectingCustId);
              const acc = accounts.find(a => a.customerId === collectingCustId && a.status === 'active');
              return (
                <div className="text-xs bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{c?.nameHindi} ({c?.nameEnglish})</div>
                  <div className="text-slate-600 font-mono">खाता सं: {acc?.accountNumber} ({acc?.planNameHindi})</div>
                  <div className="flex justify-between items-center pt-1 border-t border-emerald-200/60">
                    <span className="text-slate-600">वर्तमान बैलेंस:</span>
                    <strong className="text-emerald-950 font-mono text-sm">{formatINR(acc?.currentBalance || 0)}</strong>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleQuickCollect} className="space-y-4">
              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  त्वरित राशि (Quick Amount Presets):
                </label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[50, 100, 200, 500, 1000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val)}
                      className={`py-2 text-xs font-mono font-bold rounded-xl border transition ${
                        depositAmount === val
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-emerald-800">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={depositAmount}
                    onChange={e => setDepositAmount(parseFloat(e.target.value) || 0)}
                    placeholder="अन्य ऐच्छिक राशि दर्ज करें..."
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-base font-mono font-bold focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * फ्लेक्सी बचत: कोई निश्चित किस्त बाध्यकारी नहीं है।
                </span>
              </div>

              {/* Mode of Payment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  भुगतान माध्यम (Payment Mode):
                </label>
                <select
                  value={depositMethod}
                  onChange={e => setDepositMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="cash">नकद संग्रह (Cash in Hand)</option>
                  <option value="upi">ऑनलाइन UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">बैंक ट्रांसफर (Direct Bank NEFT)</option>
                </select>
              </div>

              {depositMethod !== 'cash' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UPI / UTR रेफरेंस नंबर:
                  </label>
                  <input
                    type="text"
                    required
                    value={depositRefNo}
                    onChange={e => setDepositRefNo(e.target.value)}
                    placeholder="उदा. UPI/2025/12345678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    * वास्तविक सत्यापन संदर्भ दर्ज करें।
                  </span>
                </div>
              )}

              {/* GPS Location Tag */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{currentGps.locName}</span>
                </div>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                  सत्यापित
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टिप्पणी / विवरण:
                </label>
                <input
                  type="text"
                  value={depositRemarks}
                  onChange={e => setDepositRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCollectingCustId(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={depositAmount <= 0}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  जमा दर्ज करें व VIP रसीद दें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Today's Collection History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              आज का संग्रह इतिहास ({todayEmpTxns.length} रसीदें)
            </h3>
            <span className="font-mono font-extrabold text-emerald-900 text-sm">
              कुल: {formatINR(totalCollectedToday)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">रसीद सं.</th>
                  <th className="py-3 px-4">ग्राहक नाम</th>
                  <th className="py-3 px-4">खाता संख्या</th>
                  <th className="py-3 px-4">समय</th>
                  <th className="py-3 px-4">माध्यम</th>
                  <th className="py-3 px-4 text-right">रकम</th>
                  <th className="py-3 px-4 text-center">रसीद प्रिंट</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {todayEmpTxns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans text-xs">
                      आज अभी तक कोई संग्रह दर्ज नहीं हुआ है।
                    </td>
                  </tr>
                ) : (
                  todayEmpTxns.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-emerald-900">{t.receiptNumber}</td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">{t.customerNameHindi}</td>
                      <td className="py-3 px-4 text-slate-600">{t.accountNumber}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-700 font-sans">{t.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800 text-sm">
                        {formatINR(t.amount)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          type="button"
                          onClick={() => setReceiptForPrint(t)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>देखें / प्रिंट</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Daily Cash Closing & Handover */}
      {activeTab === 'closing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                दैनिक कैश क्लोजिंग व ऑफिस हैंडओवर (Cash Reconciliation Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                दिन भर के नकद संग्रह का नोट-वार मिलान कर कार्यालय में जमा कराएं।
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">कुल नकद बकाया (Expected Cash):</span>
              <span className="font-mono font-extrabold text-base text-emerald-900">{formatINR(cashInHand)}</span>
            </div>
          </div>

          {closingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>दैनिक कैश क्लोजिंग सफलतापूर्वक कार्यालय को जमा कर दी गई है!</span>
            </div>
          )}

          <form onSubmit={handleCashClosingSubmit} className="space-y-5">
            {/* Currency Denomination Counter */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-xs text-slate-700 border-b border-slate-200 flex justify-between">
                <span>नोट का मान (Currency Note)</span>
                <span>संख्या (Count)</span>
                <span className="text-right">कुल रकम (Subtotal ₹)</span>
              </div>

              <div className="p-3 divide-y divide-slate-100 text-xs">
                {/* 500 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹500 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n500 || ''}
                      onChange={e => setDenom({ ...denom, n500: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n500 * 500)}
                  </span>
                </div>

                {/* 200 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹200 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n200 || ''}
                      onChange={e => setDenom({ ...denom, n200: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n200 * 200)}
                  </span>
                </div>

                {/* 100 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹100 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n100 || ''}
                      onChange={e => setDenom({ ...denom, n100: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n100 * 100)}
                  </span>
                </div>

                {/* 50 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹50 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n50 || ''}
                      onChange={e => setDenom({ ...denom, n50: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n50 * 50)}
                  </span>
                </div>

                {/* 20 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹20 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n20 || ''}
                      onChange={e => setDenom({ ...denom, n20: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n20 * 20)}
                  </span>
                </div>

                {/* 10 */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">₹10 नोट</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.n10 || ''}
                      onChange={e => setDenom({ ...denom, n10: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(denom.n10 * 10)}
                  </span>
                </div>

                {/* Coins */}
                <div className="py-2 grid grid-cols-12 items-center gap-2">
                  <span className="col-span-4 font-mono font-bold text-slate-800">सिक्के (Coins)</span>
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      value={denom.coins || ''}
                      onChange={e => setDenom({ ...denom, coins: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-2 py-1 text-center font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <span className="col-span-4 text-right font-mono font-bold text-emerald-900">
                    {formatINR(Number(denom.coins || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Reconciliation Totals Banner */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 block">अपेक्षित संग्रह (In Hand):</span>
                <span className="font-mono font-bold text-sm text-slate-800">{formatINR(cashInHand)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">गिना गया कैश (Calculated):</span>
                <span className="font-mono font-extrabold text-sm text-emerald-900">
                  {formatINR(calculatedDenomTotal)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">अंतर (Short / Excess):</span>
                <span
                  className={`font-mono font-extrabold text-sm ${
                    shortOrExcess === 0
                      ? 'text-emerald-700'
                      : shortOrExcess < 0
                      ? 'text-rose-700'
                      : 'text-blue-700'
                  }`}
                >
                  {shortOrExcess === 0
                    ? '₹0 (पूर्ण मिलान)'
                    : `${shortOrExcess > 0 ? '+' : ''}${formatINR(shortOrExcess)}`}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                क्लोजिंग टिप्पणी (Closing Remarks):
              </label>
              <input
                type="text"
                value={closingRemarks}
                onChange={e => setClosingRemarks(e.target.value)}
                placeholder="कार्यालय में कैश हैंडओवर संबंधित टिप्पणी"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={calculatedDenomTotal <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white shadow-xs transition flex items-center justify-center gap-2 ${
                calculatedDenomTotal <= 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>कैश हैंडओवर क्लोजिंग जमा करें (Submit Cash Closing to Office)</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
