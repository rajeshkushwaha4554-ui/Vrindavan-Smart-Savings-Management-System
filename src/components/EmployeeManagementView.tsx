import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import { Employee } from '../types';
import { formatINR, hindiToEnglish } from '../utils/transliteration';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  X,
  Plus
} from 'lucide-react';

export const EmployeeManagementView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, branches, customers } = useSavingsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [nameHindi, setNameHindi] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [role, setRole] = useState<Employee['role']>('field_agent');
  const [mobile, setMobile] = useState('');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'BR-01');
  const [targetAmount, setTargetAmount] = useState('10000');
  const [openingCash, setOpeningCash] = useState('0');

  const filteredEmployees = employees.filter(e => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      e.nameHindi.toLowerCase().includes(term) ||
      e.nameEnglish.toLowerCase().includes(term) ||
      e.id.toLowerCase().includes(term) ||
      e.mobile.includes(term) ||
      e.branchName.toLowerCase().includes(term)
    );
  });

  const handleHindiName = (val: string) => {
    setNameHindi(val);
    const eng = hindiToEnglish(val);
    if (eng) setNameEnglish(eng);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameHindi.trim() || !mobile.trim()) {
      alert('कृपया नाम और मोबाइल नंबर अवश्य दर्ज करें।');
      return;
    }

    const branch = branches.find(b => b.id === branchId) || branches[0];
    const newEmp = addEmployee({
      nameHindi: nameHindi.trim(),
      nameEnglish: nameEnglish.trim() || 'Staff',
      role,
      mobile: mobile.trim(),
      branchId: branch.id,
      branchName: branch.nameHindi,
      status: 'active',
      todayTargetAmount: parseFloat(targetAmount) || 10000,
      openingCash: parseFloat(openingCash) || 0,
      todayAssignedCustomersCount: 15
    });

    setSuccessMsg(`कर्मचारी ${newEmp.nameHindi} (${newEmp.id}) सफलतापूर्वक जोड़ा गया!`);
    setShowAddModal(false);
    // Reset form
    setNameHindi('');
    setNameEnglish('');
    setMobile('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            मानव संसाधन व फील्ड स्टाफ प्रबंधन
          </span>
          <h1 className="text-2xl font-bold mt-0.5">कर्मचारी मैनेजमेंट (Employee & Agent Management)</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            फील्ड संग्रह एजेंट, शाखा प्रबंधक और लेखाकारों की सूची, हाजिरी स्थिति, दैनिक संग्रह लक्ष्य व कैश इन हैंड।
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>नया कर्मचारी जोड़ें (Add Employee)</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="कर्मचारी का नाम, ID, मोबाइल या शाखा से खोजें..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div>
            कुल सक्रिय स्टाफ: <strong className="text-emerald-900 font-mono font-bold">{employees.length}</strong>
          </div>
          <div>
            कुल फील्ड कैश: <strong className="text-emerald-900 font-mono font-bold">
              {formatINR(employees.reduce((sum, e) => sum + (e.cashInHand || 0), 0))}
            </strong>
          </div>
        </div>
      </div>

      {/* Employees Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map(emp => {
          const assignedCount = customers.filter(c => c.assignedEmployeeId === emp.id).length;
          const roleLabel =
            emp.role === 'field_agent'
              ? 'फील्ड संग्रहकर्ता'
              : emp.role === 'accountant'
              ? 'लेखाकार (Accountant)'
              : emp.role === 'branch_manager'
              ? 'शाखा प्रबंधक'
              : 'व्यवस्थापक (Admin)';

          return (
            <div
              key={emp.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-bold text-sm">
                      {emp.nameEnglish.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {emp.nameHindi}{' '}
                        <span className="text-xs font-normal text-slate-500">({emp.nameEnglish})</span>
                      </h3>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        {roleLabel} • <span className="font-mono text-slate-500">{emp.id}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.isPunchedIn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {emp.isPunchedIn ? 'ऑन-ड्यूटी' : 'ऑफ-ड्यूटी'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>मोबाइल:</span>
                    </span>
                    <strong className="text-slate-900 font-mono">{emp.mobile}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>शाखा:</span>
                    </span>
                    <span className="font-medium text-slate-800">{emp.branchName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>आवंटित ग्राहक:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">{assignedCount} ग्राहक</span>
                  </div>

                  {emp.punchInLocation && (
                    <div className="flex items-start gap-1.5 text-[10px] text-emerald-800 font-mono pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="truncate">{emp.punchInLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">हाथ में नकद (Cash):</span>
                  <span className="font-mono font-extrabold text-sm text-emerald-950">
                    {formatINR(emp.cashInHand || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">आज का संग्रह:</span>
                  <span className="font-mono font-bold text-sm text-slate-800">
                    {formatINR(emp.todayCollectedAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
            <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">नया कर्मचारी / एजेंट जोड़ें</h3>
                  <p className="text-[11px] text-emerald-200">फील्ड संग्रह व शाखा स्टाफ का पंजीकरण</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कर्मचारी का नाम (हिंदी में): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameHindi}
                  onChange={e => handleHindiName(e.target.value)}
                  placeholder="उदा. अमन कुशवाहा"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कर्मचारी का नाम (English):
                </label>
                <input
                  type="text"
                  value={nameEnglish}
                  onChange={e => setNameEnglish(e.target.value)}
                  placeholder="e.g. Aman Kushwaha"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पद / रोल (Role):
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="field_agent">फील्ड संग्रहकर्ता (Field Agent)</option>
                    <option value="accountant">लेखाकार (Accountant)</option>
                    <option value="branch_manager">शाखा प्रबंधक (Manager)</option>
                    <option value="admin">व्यवस्थापक (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मोबाइल नंबर: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    शाखा (Branch):
                  </label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nameHindi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    दैनिक लक्ष्य (₹ Target):
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  कर्मचारी सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
