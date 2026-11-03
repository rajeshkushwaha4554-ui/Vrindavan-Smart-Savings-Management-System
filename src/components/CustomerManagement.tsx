import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { Customer } from '../types';
import { hindiToEnglish, formatINR } from '../utils/transliteration';
import { UserPlus, Search, User, BookOpen, PlusCircle, CheckCircle2, ShieldCheck, MapPin, Phone, Award } from 'lucide-react';

interface CustomerManagementProps {
  onOpenDepositForCustomer?: (customerId: string) => void;
  onOpenAccountForCustomer?: (customerId: string) => void;
  initialShowAdd?: boolean;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onOpenDepositForCustomer,
  onOpenAccountForCustomer,
  initialShowAdd = false
}) => {
  const { customers, accounts, employees, branches, addCustomer, setPassbookForPrint, setBondForPrint } = useSavingsData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [showAddForm, setShowAddForm] = useState(initialShowAdd);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [nameHindi, setNameHindi] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [mobile, setMobile] = useState('');
  const [altMobile, setAltMobile] = useState('');
  const [village, setVillage] = useState('बरगहा');
  const [postOffice, setPostOffice] = useState('नौरंगिया');
  const [district, setDistrict] = useState('कुशीनगर');
  const [state, setState] = useState('उत्तर प्रदेश');
  const [pincode, setPincode] = useState('274805');
  const [fullAddress, setFullAddress] = useState('');
  const [kycType, setKycType] = useState<Customer['kycType']>('आधार कार्ड');
  const [kycDocRef, setKycDocRef] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('पत्नी (Wife)');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'BR-01');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(employees[0]?.id || 'EMP-101');

  // When user types in Hindi name, automatically transliterate to English!
  const handleHindiNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNameHindi(val);
    const transliterated = hindiToEnglish(val);
    if (transliterated) {
      setNameEnglish(transliterated);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameHindi.trim() || !mobile.trim()) return;

    const resolvedAddress = fullAddress.trim() || `ग्राम - ${village}, पोस्ट - ${postOffice}, कुशीनगर, उत्तर प्रदेश - ${pincode}`;

    const newCust = addCustomer({
      nameHindi: nameHindi.trim(),
      nameEnglish: nameEnglish.trim() || hindiToEnglish(nameHindi),
      guardianName: guardianName.trim() || 'पिता: उपलब्ध नहीं',
      mobile: mobile.trim(),
      altMobile: altMobile.trim() || undefined,
      village: village.trim(),
      postOffice: postOffice.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      fullAddress: resolvedAddress,
      kycType,
      kycDocRef: kycDocRef.trim() || 'XXXX-XXXX-0000',
      nomineeName: nomineeName.trim() || 'उपलब्ध नहीं',
      nomineeRelation: nomineeRelation.trim(),
      dateOfBirth,
      branchId,
      assignedEmployeeId
    });

    setSuccessMsg(`ग्राहक ${newCust.nameHindi} (${newCust.id}) सफलतापूर्वक पंजीकृत हो गया!`);
    setShowAddForm(false);
    // Reset
    setNameHindi('');
    setNameEnglish('');
    setGuardianName('');
    setMobile('');
    setKycDocRef('');
    setNomineeName('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Filter list
  const filteredCustomers = customers.filter(c => {
    const matchSearch =
      searchTerm === '' ||
      c.nameHindi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile.includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase());

    const matchVillage = selectedVillage === 'all' || c.village === selectedVillage;
    return matchSearch && matchVillage;
  });

  const villagesList = Array.from(new Set(customers.map(c => c.village)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            सदस्य व खाताधारक पंजीकरण
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">ग्राहक प्रबंधन (Customer Management)</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            नया ग्राहक जोड़ें, स्वतः अंग्रेजी लिप्यांतरण, KYC दस्तावेज, पासबुक देखें और बचत खाते प्रबंधित करें।
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'सूची देखें (View List)' : '+ नया ग्राहक जोड़ें (Add New Customer)'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Customer Form Modal / Panel */}
      {showAddForm && (
        <form onSubmit={handleCreateCustomer} className="bg-white p-6 rounded-2xl border-2 border-emerald-600/50 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-emerald-950 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-700" />
              <span>नया ग्राहक पंजीकरण फॉर्म (New Customer Registration)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Auto ID: CUST-{1000 + customers.length + 1}
            </span>
          </div>

          {/* Hindi Name & Automatic English Transliteration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                ग्राहक का पूरा नाम (हिंदी में लिखें): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameHindi}
                onChange={handleHindiNameChange}
                placeholder="उदा. राजेश कुमार, अमन कुशवाहा"
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
              <span className="text-[11px] text-emerald-800 mt-1 block">
                * हिंदी में लिखते ही नीचे अंग्रेजी नाम अपने आप तैयार होगा।
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                English Name (Automatic Transliteration): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameEnglish}
                onChange={e => setNameEnglish(e.target.value)}
                placeholder="Rajesh Kumar (Editable)"
                className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-sans"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                आप चाहें तो अंग्रेजी वर्तनी में सुधार कर सकते हैं।
              </span>
            </div>
          </div>

          {/* Guardian Name, Mobile, Alt Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                पिता / पति का नाम: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                placeholder="उदा. पिता: राम प्रसाद"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मोबाइल नंबर (10 अंक): <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9794133636"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                वैकल्पिक मोबाइल (Alternate Mobile):
              </label>
              <input
                type="tel"
                maxLength={10}
                value={altMobile}
                onChange={e => setAltMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="वैकल्पिक फोन नंबर"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ग्राम (Village):</label>
              <input
                type="text"
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">पोस्ट (Post Office):</label>
              <input
                type="text"
                value={postOffice}
                onChange={e => setPostOffice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">जिला (District):</label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">राज्य (State):</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">पिन कोड (PIN):</label>
              <input
                type="text"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* KYC & Nominee Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KYC दस्तावेज प्रकार:</label>
              <select
                value={kycType}
                onChange={e => setKycType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="आधार कार्ड">आधार कार्ड (Aadhaar)</option>
                <option value="पैन कार्ड">पैन कार्ड (PAN Card)</option>
                <option value="वोटर कार्ड">वोटर आईडी (Voter ID)</option>
                <option value="राशन कार्ड">राशन कार्ड (Ration Card)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KYC संदर्भ संख्या / No:</label>
              <input
                type="text"
                value={kycDocRef}
                onChange={e => setKycDocRef(e.target.value)}
                placeholder="उदा. XXXX-XXXX-1234"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">नॉमिनी का नाम (Nominee):</label>
              <input
                type="text"
                value={nomineeName}
                onChange={e => setNomineeName(e.target.value)}
                placeholder="वारिस / नॉमिनी का नाम"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">नॉमिनी संबंध (Relation):</label>
              <select
                value={nomineeRelation}
                onChange={e => setNomineeRelation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                <option value="पत्नी (Wife)">पत्नी (Wife)</option>
                <option value="पति (Husband)">पति (Husband)</option>
                <option value="माता (Mother)">माता (Mother)</option>
                <option value="पिता (Father)">पिता (Father)</option>
                <option value="पुत्र (Son)">पुत्र (Son)</option>
                <option value="पुत्री (Daughter)">पुत्री (Daughter)</option>
                <option value="भाई (Brother)">भाई (Brother)</option>
              </select>
            </div>
          </div>

          {/* Branch & Assigned Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">शाखा (Branch):</label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nameHindi} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">आवंटित कर्मचारी (Assigned Employee):</label>
              <select
                value={assignedEmployeeId}
                onChange={e => setAssignedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameHindi} ({emp.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">जन्म तिथि (DOB):</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              ग्राहक पंजीकृत करें (Save Customer)
            </button>
          </div>
        </form>
      )}

      {/* Customer Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="नाम, मोबाइल, CUST ID से खोजें..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">ग्राम फ़िल्टर:</span>
          <select
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">सभी ग्राम (All Villages)</option>
            {villagesList.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            पंजीकृत ग्राहक सूची (Total: {filteredCustomers.length})
          </h3>
          <span className="text-xs text-slate-500">
            सक्रिय बचत खाते व डिजिटल लेजर
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ग्राहक ID</th>
                <th className="py-3 px-4">ग्राहक नाम (हिंदी / English)</th>
                <th className="py-3 px-4">मोबाइल व पता</th>
                <th className="py-3 px-4">सक्रिय खाते</th>
                <th className="py-3 px-4 text-right">कुल जमा बैलेंस</th>
                <th className="py-3 px-4">आवंटित कर्मचारी</th>
                <th className="py-3 px-4 text-center">कार्यवाही (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    कोई ग्राहक उपलब्ध नहीं है।
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const custAccs = accounts.filter(a => a.customerId === cust.id && a.status === 'active');
                  const totalBal = custAccs.reduce((sum, a) => sum + a.currentBalance, 0);
                  const assignedEmp = employees.find(e => e.id === cust.assignedEmployeeId);

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-900 whitespace-nowrap">
                        {cust.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{cust.nameHindi}</div>
                        <div className="text-[11px] text-slate-500 font-sans">{cust.nameEnglish}</div>
                        <div className="text-[10px] text-slate-400">{cust.guardianName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-mono text-slate-800 font-medium">{cust.mobile}</div>
                        <div className="text-[11px] text-slate-500">{cust.village}, {cust.postOffice}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {custAccs.map(a => (
                            <span key={a.id} className="font-mono text-[11px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {a.accountNumber} ({a.planNameHindi.split(' ')[0]})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                        {formatINR(totalBal)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">
                        {assignedEmp?.nameHindi || 'अमन कुशवाहा'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Passbook */}
                          {custAccs.length > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPassbookForPrint({ customer: cust, account: custAccs[0] })}
                                className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                title="डिजिटल पासबुक देखें व प्रिंट करें"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setBondForPrint({ customer: cust, account: custAccs[0] })}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title="डिजिटल बचत खाता बांड (Savings Bond) देखें व प्रिंट करें"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Quick Deposit button */}
                          {onOpenDepositForCustomer && (
                            <button
                              type="button"
                              onClick={() => onOpenDepositForCustomer(cust.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="जमा प्रविष्टि करें"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
