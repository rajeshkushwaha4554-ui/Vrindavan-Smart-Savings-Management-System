import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR } from '../utils/transliteration';
import { PaymentMethod } from '../types';
import { Search, ArrowDownCircle, ShieldAlert, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';

export const WithdrawalModule: React.FC = () => {
  const { customers, accounts, employees, makeWithdrawal, setReceiptForPrint, selectedEmployeeId } = useSavingsData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [withdrawalReason, setWithdrawalReason] = useState('घरेलू आवश्यकता / आपातकालीन खर्च');
  const [authorizedBy, setAuthorizedBy] = useState('राजेश कुमार (शाखा प्रबंधक)');
  const [collectorId, setCollectorId] = useState(selectedEmployeeId || 'EMP-103');
  const [remarks, setRemarks] = useState('स्वीकृत बचत निकासी');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filter
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return false;
    return (
      c.nameHindi.toLowerCase().includes(term) ||
      c.nameEnglish.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.id.toLowerCase().includes(term)
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
    }
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedAccount) {
      setFeedback({ type: 'error', message: 'कृपया बचत खाता चुनें।' });
      return;
    }

    const wdrAmount = parseFloat(amount);
    if (isNaN(wdrAmount) || wdrAmount <= 0) {
      setFeedback({ type: 'error', message: 'कृपया मान्य निकासी राशि दर्ज करें।' });
      return;
    }

    if (wdrAmount > selectedAccount.currentBalance) {
      setFeedback({
        type: 'error',
        message: `अपर्याप्त बैलेंस! उपलब्ध राशि मात्र ${formatINR(selectedAccount.currentBalance)} है। आप अधिक नहीं निकाल सकते।`
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = makeWithdrawal({
        accountId: selectedAccount.id,
        amount: wdrAmount,
        paymentMethod,
        withdrawalReason,
        authorizedBy,
        employeeId: collectorId,
        remarks: remarks.trim()
      });

      if (res.success && res.transaction) {
        setFeedback({
          type: 'success',
          message: `सफलतापूर्वक ₹${wdrAmount} की निकासी दर्ज की गई। रसीद: ${res.transaction.receiptNumber}`
        });
        setReceiptForPrint(res.transaction);
        setAmount('');
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'निकासी दर्ज करने में त्रुटि हुई।'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'सिस्टम त्रुटि हुई।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider">
            सुरक्षित भुगतान व अधिकृत स्वीकृति
          </span>
          <h1 className="text-2xl font-bold mt-0.5">बचत निकासी केंद्र (Withdrawal Counter)</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            खाते का सत्यापन, उपलब्ध शेष राशि की जांच व अधिकृत अधिकारी द्वारा स्वीकृति के बाद ही भुगतान।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 px-4 py-2.5 rounded-xl text-xs font-medium">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <div>
            <div className="text-rose-200 text-[10px]">सुरक्षा जांच:</div>
            <div className="font-bold text-white">शून्य ओवरड्राफ्ट नीति</div>
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
        {/* Left Column: Customer Search & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-700" />
              <span>1. खाताधारक खोजें (Search Account Holder)</span>
            </h2>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="नाम, मोबाइल या ग्राहक ID लिखें..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-600 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {searchTerm.trim().length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white shadow-lg z-10 relative">
                {filteredCustomers.length === 0 ? (
                  <div className="p-3 text-xs text-slate-500 text-center">कोई ग्राहक नहीं मिला।</div>
                ) : (
                  filteredCustomers.map(cust => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleSelectCustomer(cust.id)}
                      className="w-full text-left p-3 hover:bg-rose-50 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{cust.nameHindi} ({cust.nameEnglish})</div>
                        <div className="text-[11px] text-slate-500">ID: {cust.id} | मो: {cust.mobile}</div>
                      </div>
                      <span className="text-xs font-bold text-rose-700">चुनें</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Customer & Balance Verification */}
          {selectedCustomer && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    खाताधारक पहचान
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedCustomer.nameHindi}{' '}
                    <span className="text-xs font-normal text-slate-400">({selectedCustomer.nameEnglish})</span>
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    CUST ID: <span className="text-emerald-400 font-bold">{selectedCustomer.id}</span> | मो: {selectedCustomer.mobile}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-900 text-white flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.nameEnglish.charAt(0)}
                </div>
              </div>

              {/* Customer Account Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  निकासी खाता चुनें (Choose Account):
                </label>
                <div className="space-y-2">
                  {customerAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                        selectedAccountId === acc.id || (!selectedAccountId && selectedAccount?.id === acc.id)
                          ? 'bg-rose-900/60 border-rose-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-xs">{acc.accountNumber}</div>
                        <div className="text-[11px] text-slate-400">{acc.planNameHindi}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">उपलब्ध बैलेंस</div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          {formatINR(acc.currentBalance)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div>नॉमिनी: <strong className="text-white">{selectedCustomer.nomineeName}</strong> ({selectedCustomer.nomineeRelation})</div>
                <div>पता: {selectedCustomer.village}, कुशीनगर</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Withdrawal Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleWithdrawalSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ArrowDownCircle className="w-4 h-4 text-rose-700" />
              <span>2. निकासी राशि एवं स्वीकृति विवरण (Withdrawal Details)</span>
            </h2>

            {/* Current Balance Banner */}
            {selectedAccount && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-rose-800 font-semibold block">खाते में उपलब्ध कुल बैलेंस:</span>
                  <span className="text-2xl font-mono font-extrabold text-rose-950">
                    {formatINR(selectedAccount.currentBalance)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div>खाता: <span className="font-mono font-bold text-slate-900">{selectedAccount.accountNumber}</span></div>
                  <div>योजना: {selectedAccount.planNameHindi}</div>
                </div>
              </div>
            )}

            {/* Withdrawal Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                निकासी राशि (Withdrawal Amount ₹): <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-lg font-bold text-rose-800">₹</span>
                <input
                  type="number"
                  min="1"
                  max={selectedAccount ? selectedAccount.currentBalance : 9999999}
                  step="1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="निकासी राशि लिखें..."
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-lg font-mono font-bold focus:border-rose-600 focus:outline-hidden transition"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                * उपलब्ध शेष राशि से अधिक की निकासी की अनुमति नहीं है।
              </div>
            </div>

            {/* Withdrawal Reason & Authorized Officer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  निकासी का कारण (Reason for Withdrawal): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={withdrawalReason}
                  onChange={e => setWithdrawalReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                >
                  <option value="घरेलू आवश्यकता / आपातकालीन खर्च">घरेलू आवश्यकता / आपातकालीन खर्च</option>
                  <option value="चिकित्सा / दवाई खर्च (Medical)">चिकित्सा / दवाई खर्च (Medical)</option>
                  <option value="कृषि / बीज / खाद खर्च (Agri)">कृषि / बीज / खाद खर्च (Agri)</option>
                  <option value="शिक्षा / फीस (Education)">शिक्षा / फीस (Education)</option>
                  <option value="मियाद पूर्ण / मैच्योरिटी भुगतान (Maturity)">मियाद पूर्ण / मैच्योरिटी भुगतान (Maturity)</option>
                  <option value="अन्य व्यक्तिगत कारण">अन्य व्यक्तिगत कारण</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  स्वीकृति देने वाले अधिकारी (Approved By): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={authorizedBy}
                  onChange={e => setAuthorizedBy(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                >
                  <option value="राजेश कुमार (शाखा प्रबंधक)">राजेश कुमार (शाखा प्रबंधक / Branch Manager)</option>
                  <option value="अनीता देवी (मुख्य लेखापाल)">अनीता देवी (मुख्य लेखापाल / Chief Accountant)</option>
                  <option value="प्रबंध निदेशक (Managing Director)">प्रबंध निदेशक (Managing Director)</option>
                </select>
              </div>
            </div>

            {/* Payment Method & Collector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  भुगतान माध्यम (Payment Mode):
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                >
                  <option value="cash">नकद भुगतान (Cash Payment)</option>
                  <option value="bank_transfer">बैंक ट्रांसफर (Direct Bank NEFT)</option>
                  <option value="upi">ऑनलाइन UPI भुगतान</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  भुगतानकर्ता कर्मचारी (Officer In-charge):
                </label>
                <select
                  value={collectorId}
                  onChange={e => setCollectorId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-600 focus:outline-hidden"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameHindi} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                टिप्पणी / विवरण (Remarks):
              </label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            {/* Calculation Preview */}
            {selectedAccount && parseFloat(amount) > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">वर्तमान शेष:</span>
                  <span className="font-mono font-bold text-slate-800">{formatINR(selectedAccount.currentBalance)}</span>
                </div>
                <div className="text-rose-700 font-bold text-sm">
                  - {formatINR(parseFloat(amount) || 0)}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">निकासी उपरांत शेष:</span>
                  <span className="font-mono font-extrabold text-base text-rose-950">
                    {formatINR(Math.max(0, selectedAccount.currentBalance - (parseFloat(amount) || 0)))}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedAccount || (parseFloat(amount) || 0) <= 0 || (parseFloat(amount) || 0) > (selectedAccount?.currentBalance || 0)}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition flex items-center justify-center gap-2 ${
                isSubmitting || !selectedAccount || (parseFloat(amount) || 0) <= 0 || (parseFloat(amount) || 0) > (selectedAccount?.currentBalance || 0)
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-rose-700 hover:bg-rose-800 active:scale-[0.99]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {isSubmitting ? 'निकासी दर्ज हो रही है...' : 'निकासी स्वीकृत करें व VIP रसीद बनाएं (Authorize & Print Receipt)'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
