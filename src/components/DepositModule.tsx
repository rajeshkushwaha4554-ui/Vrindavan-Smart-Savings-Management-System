import React, { useState, useEffect } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { PaymentMethod } from '../types';
import { Search, PlusCircle, CheckCircle, Wallet, ArrowRight, UserCheck, AlertCircle, MapPin, Sparkles } from 'lucide-react';

export const DepositModule: React.FC = () => {
  const { customers, accounts, employees, addDeposit, setReceiptForPrint, selectedEmployeeId } = useSavingsData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('फ्लेक्सी बचत संग्रह');
  const [collectorId, setCollectorId] = useState(selectedEmployeeId || 'EMP-101');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // GPS state
  const [currentGps, setCurrentGps] = useState<{ lat?: number; lng?: number; locName: string; accuracy?: number }>({
    locName: 'नौरंगिया बरगहा रोड, कुशीनगर (शाखा कार्यालय)'
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCurrentGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            locName: `कुशीनगर संकलन केंद्र (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`
          });
        },
        () => {
          setCurrentGps({
            locName: 'नौरंगिया बरगहा रोड, कुशीनगर (शाखा परिक्षेत्र)'
          });
        },
        { timeout: 8000 }
      );
    }
  }, []);

  // Quick Amount presets
  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  // Filter customers matching search
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return false;
    return (
      c.nameHindi.toLowerCase().includes(term) ||
      c.nameEnglish.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.village.toLowerCase().includes(term)
    );
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerAccounts = accounts.filter(a => a.customerId === selectedCustomerId && a.status === 'active');
  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || customerAccounts[0];

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSearchTerm('');
    const accs = accounts.filter(a => a.customerId === customerId && a.status === 'active');
    if (accs.length > 0) {
      setSelectedAccountId(accs[0].id);
      if (accs[0].installmentAmount > 0) {
        setAmount(String(accs[0].installmentAmount));
      }
    }
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const depAmount = parseFloat(amount);
    if (!selectedAccount) {
      setFeedback({ type: 'error', message: 'कृपया पहले ग्राहक का बचत खाता चुनें।' });
      return;
    }
    if (isNaN(depAmount) || depAmount <= 0) {
      setFeedback({ type: 'error', message: 'कृपया वैध जमा राशि दर्ज करें।' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newTxn = addDeposit({
        accountId: selectedAccount.id,
        amount: depAmount,
        paymentMethod,
        employeeId: collectorId,
        referenceNo: paymentMethod !== 'cash' ? referenceNo : undefined,
        remarks: remarks.trim() || (selectedAccount.isFlexible ? 'फ्लेक्सी बचत ऐच्छिक जमा' : 'दैनिक बचत संग्रह'),
        gpsLocation: currentGps.locName,
        coordinates: currentGps.lat && currentGps.lng ? {
          latitude: currentGps.lat,
          longitude: currentGps.lng,
          accuracy: currentGps.accuracy
        } : undefined
      });

      setFeedback({
        type: 'success',
        message: `सफलतापूर्वक ₹${depAmount} जमा हुआ! रसीद संख्या: ${newTxn.receiptNumber}`
      });

      // Automatically open the VIP Receipt modal
      setReceiptForPrint(newTxn);

      // Reset form slightly
      setReferenceNo('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'जमा दर्ज करने में समस्या आई।'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            दैनिक व मासिक बचत संग्रह
          </span>
          <h1 className="text-2xl font-bold mt-0.5">जमा प्रविष्टि केंद्र (Daily Deposit Counter)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            ग्राहक का खाता खोजें, राशि दर्ज करें और तुरंत आधिकारिक VIP रसीद प्रिंट करें।
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 px-3.5 py-2 rounded-xl text-xs font-medium">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-emerald-300 text-[10px]">लोकेशन जीपीएस:</div>
              <div className="font-semibold text-white truncate max-w-[180px]">
                {currentGps.locName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 px-4 py-2.5 rounded-xl text-xs font-medium">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-300 text-[10px]">सक्रिय संग्रहकर्ता:</div>
              <div className="font-bold text-white">
                {employees.find(e => e.id === collectorId)?.nameHindi || 'अमन कुशवाहा'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Search & Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>1. ग्राहक खोजें (Search Customer)</span>
            </h2>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="नाम (हिंदी/English), मोबाइल या CUST ID लिखें..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Search suggestions dropdown */}
            {searchTerm.trim().length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white shadow-lg z-10 relative">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">
                    कोई ग्राहक नहीं मिला।
                  </div>
                ) : (
                  filteredCustomers.map(cust => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust.id)}
                      className="w-full text-left p-3 hover:bg-emerald-50 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {cust.nameHindi}{' '}
                          <span className="text-slate-500 font-normal">({cust.nameEnglish})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ID: {cust.id} | मो: {cust.mobile} | {cust.village}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-700" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Quick Customer Picker List if nothing is searched */}
            {!selectedCustomerId && !searchTerm && (
              <div className="mt-3">
                <span className="text-[11px] text-slate-500 font-medium block mb-2">हाल के सक्रिय ग्राहक:</span>
                <div className="space-y-1.5">
                  {customers.slice(0, 4).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c.id)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{c.nameHindi}</strong>
                        <div className="text-[10px] text-slate-500 font-mono">{c.id} • {c.village}</div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">चुनें</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Customer Profile Card */}
          {selectedCustomer && (
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    चयनित खाताधारक
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedCustomer.nameHindi}{' '}
                    <span className="text-xs font-normal text-slate-600">({selectedCustomer.nameEnglish})</span>
                  </h3>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    ID: <strong className="text-emerald-950">{selectedCustomer.id}</strong> | मो: {selectedCustomer.mobile}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  {selectedCustomer.nameEnglish.charAt(0)}
                </div>
              </div>

              <div className="text-xs text-slate-700 pt-2 border-t border-emerald-200/70">
                <div>{selectedCustomer.guardianName}</div>
                <div>ग्राम: {selectedCustomer.village}, {selectedCustomer.postOffice}, कुशीनगर</div>
              </div>

              {/* Customer's Accounts Selector */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-emerald-900 block mb-1.5">
                  खाता चुनें (Select Account):
                </label>
                <div className="space-y-2">
                  {customerAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        if (acc.installmentAmount > 0) setAmount(String(acc.installmentAmount));
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                        selectedAccountId === acc.id || (!selectedAccountId && selectedAccount?.id === acc.id)
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                          : 'bg-white text-slate-900 border-emerald-200 hover:border-emerald-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold">{acc.accountNumber}</span>
                          {acc.isFlexible && (
                            <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-bold">
                              फ्लेक्सी
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] ${selectedAccountId === acc.id ? 'text-emerald-200' : 'text-slate-600'}`}>
                          {acc.planNameHindi} • {acc.isFlexible ? 'ऐच्छिक राशि' : `किस्त: ${formatINR(acc.installmentAmount)}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] ${selectedAccountId === acc.id ? 'text-emerald-300' : 'text-slate-500'}`}>
                          वर्तमान शेष
                        </div>
                        <div className={`font-mono font-bold text-sm ${selectedAccountId === acc.id ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          {formatINR(acc.currentBalance)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deposit Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmitDeposit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>2. जमा विवरण दर्ज करें (Deposit Form)</span>
              </h2>
              {selectedAccount?.isFlexible && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  फ्लेक्सी बचत सक्षम
                </span>
              )}
            </div>

            {/* Flexible Savings Info Banner */}
            {selectedAccount && selectedAccount.isFlexible && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300/80 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>फ्लेक्सी ऐच्छिक बचत (Flexible Savings Rule)</span>
                    <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.2 rounded-full font-semibold">
                      कोई फिक्स किस्त या जुर्माना नहीं
                    </span>
                  </div>
                  <div className="text-emerald-800 text-[11px] mt-0.5">
                    ग्राहक पर रोज ₹100 जमा करने की कोई बाध्यता नहीं है। ग्राहक जब चाहे, जितनी चाहे निर्धारित अनुमत राशि (उदा. ₹50, ₹100, ₹200, ₹500, ₹1,000) जमा कर सकता है। ब्याज वास्तविक दैनिक क्लोजिंग बैलेंस के आधार पर आकलित होगा।
                  </div>
                </div>
              </div>
            )}

            {/* GPS Tag info pill */}
            <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">रसीद GPS स्थान: <strong>{currentGps.locName}</strong></span>
              </div>
              {currentGps.accuracy && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                  ±{currentGps.accuracy}m सटीकता
                </span>
              )}
            </div>

            {/* Quick Amount Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                त्वरित राशि बटन (Quick Amounts):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition ${
                      amount === String(val)
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                जमा राशि (Deposit Amount ₹): <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-lg font-bold text-emerald-800">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="राशि दर्ज करें..."
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-lg font-mono font-bold focus:border-emerald-600 focus:outline-hidden transition"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  भुगतान माध्यम (Payment Method):
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="cash">नकद (Cash)</option>
                  <option value="upi">ऑनलाइन UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="bank_transfer">बैंक ट्रांसफर (NEFT / IMPS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संग्रहकर्ता / कर्मचारी (Collector):
                </label>
                <select
                  value={collectorId}
                  onChange={e => setCollectorId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameHindi} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference No for UPI/Bank */}
            {paymentMethod !== 'cash' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI / बैंक यूटीआर नंबर (UTR / Transaction Reference):
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  placeholder="उदा. UPI/2025/12345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                विवरण / टिप्पणी (Remarks):
              </label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="उदा. दैनिक बचत, 5 दिन की किस्त"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            {/* Balance Preview Box */}
            {selectedAccount && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">वर्तमान शेष:</span>
                  <span className="font-mono font-bold text-slate-800">{formatINR(selectedAccount.currentBalance)}</span>
                </div>
                <div className="text-emerald-700 font-bold text-sm">
                  + {formatINR(parseFloat(amount) || 0)}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">जमा के बाद नया शेष:</span>
                  <span className="font-mono font-extrabold text-base text-emerald-900">
                    {formatINR(selectedAccount.currentBalance + (parseFloat(amount) || 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedAccount}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center gap-2 ${
                isSubmitting || !selectedAccount
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {isSubmitting ? 'प्रक्रिया चल रही है...' : 'जमा सुरक्षित करें व VIP रसीद बनाएं (Save & Print VIP Receipt)'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
