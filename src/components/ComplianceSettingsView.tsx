import React, { useState } from 'react';
import { useSavingsData } from '../context/SavingsDataContext';
import {
  ShieldCheck,
  Building,
  Database,
  Download,
  Upload,
  AlertTriangle,
  History,
  Lock,
  CheckCircle2,
  Users
} from 'lucide-react';

interface ComplianceSettingsViewProps {
  initialTab?: 'compliance' | 'company' | 'backup' | 'audit';
}

export const ComplianceSettingsView: React.FC<ComplianceSettingsViewProps> = ({ initialTab = 'compliance' }) => {
  const {
    company,
    compliance,
    updateCompliance,
    auditLogs,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetToDemoData,
    branches,
    employees
  } = useSavingsData();

  const [activeTab, setActiveTab] = useState<'compliance' | 'company' | 'backup' | 'audit'>(initialTab);
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDatabaseBackup(content);
        setRestoreFeedback({ success: res.success, msg: res.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            नियामकीय अनुपालन व सिस्टम सेटिंग्स
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            सेटिंग्स व वैधानिक अनुपालन (Settings & Compliance)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            आरबीआई/एमसीए दिशा-निर्देश, कंपनी प्रोफाइल, डेटाबेस बैकअप/रीस्टोर एवं पूर्ण ऑडिट ट्रेल।
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>सत्यापित कंपनी लेजर मोड</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>वैधानिक व विनियामक अनुपालन (Legal Compliance)</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'company'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>कंपनी व शाखा विवरण (Company & Branches)</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>बैकअप व डेटा रीस्टोर (Backup & Restore)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>ऑडिट लॉग (Audit Trail)</span>
        </button>
      </div>

      {/* TAB 1: Legal Compliance */}
      {activeTab === 'compliance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                महत्वपूर्ण कानूनी सूचना (Important Statutory Compliance Notice)
              </h3>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                कंपनी के नाम पर ग्राहकों से वास्तविक सार्वजनिक जमा राशि या बचत स्वीकार करने से पहले यह सुनिश्चित करना अनिवार्य है कि कंपनी को संबंधित विनियामक (RBI / Ministry of Corporate Affairs) से जमा स्वीकार करने की कानूनी अनुमति प्राप्त है। केवल "Private Limited" या "Microfinance" नाम होने से जमा लेने की अनुमति नहीं मिलती।
              </p>
              <p className="text-xs text-amber-900 mt-1.5 font-semibold">
                यह सॉफ्टवेयर आंतरिक डिजिटल पासबुक, पारदर्शी लेखांकन, दैनिक संग्रह तथा खाता प्रबंधन हेतु पूर्ण रूप से ऑडिट-अनुकूल तैयार किया गया है।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 font-bold block">लागू कानूनी इकाई श्रेणी:</span>
              <strong className="text-slate-900 text-sm block">{compliance.entityCategory}</strong>
              <div className="text-slate-600">
                पंजीकरण संदर्भ: <span className="font-mono">{compliance.regulatoryReference}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-500 font-bold block">दैनिक संग्रह सुरक्षा सीमा:</span>
              <strong className="text-slate-900 text-sm font-mono block">
                ₹{compliance.maxDailyDepositLimit.toLocaleString('en-IN')} प्रति ग्राहक दैनिक सीमा
              </strong>
              <div className="text-emerald-700 font-semibold">
                स्थिति: अधिकृत आंतरिक बचत बही (Verified Internal Ledger Mode)
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-emerald-950">सॉफ्टवेयर सुरक्षा व जवाबदेही सिद्धांत:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>ग्राहक के जमा पैसे का हिसाब, कंपनी का अपना पैसा और ब्याज की देनदारी हमेशा अलग-अलग रखी जाती है।</li>
              <li>किसी भी परिस्थिति में वित्तीय रिकॉर्ड को डिलीट नहीं किया जाता, केवल अधिकृत रिवर्सल की अनुमति है।</li>
              <li>प्रत्येक लेनदेन में अद्वितीय ट्रांजैक्शन ID, रसीद संख्या एवं संग्रहकर्ता की पहचान दर्ज होती है।</li>
              <li>सभी रसीदों पर डिजिटल सत्यापन क्यूआर कोड और कानूनी अस्वीकरण मुद्रित होता है।</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Company & Branches */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              आधिकारिक कंपनी विवरण (Registered Company Profile)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">कंपनी का पूरा कानूनी नाम:</span>
                <strong className="text-sm text-slate-900">{company.legalName}</strong>
                <div className="text-emerald-800 font-semibold">{company.hindiName}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">कॉर्पोरेट पहचान संख्या (CIN):</span>
                <strong className="text-sm font-mono text-emerald-950">{company.cin}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">पंजीकृत कार्यालय का पता:</span>
                <strong className="text-slate-800">{company.registeredOffice}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">संपर्क विवरण:</span>
                <div>मोबाइल: <strong className="font-mono">{company.mobile}</strong></div>
                <div>ईमेल: <strong className="font-mono">{company.email}</strong></div>
              </div>
            </div>
          </div>

          {/* Branches List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              सक्रिय शाखाएं (Active Branches - Total: {branches.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {branches.map(b => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-sm text-slate-900">{b.nameHindi}</strong>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">{b.code}</span>
                  </div>
                  <div className="text-slate-500">{b.address}</div>
                  <div className="text-[11px] text-emerald-800 font-mono pt-1">फोन: {b.contactNumber}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              डेटाबेस बैकअप एवं डेटा सुरक्षा (Data Backup & Recovery)
            </h3>
            <p className="text-xs text-slate-500">
              अपने पूरे वित्तीय डेटा, ग्राहकों, खातों व ट्रांजैक्शन का सुरक्षित ऑफलाइन JSON बैकअप डाउनलोड करें।
            </p>
          </div>

          {restoreFeedback && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
                restoreFeedback.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {restoreFeedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              )}
              <span>{restoreFeedback.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download Backup */}
            <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-2">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">पूरा डेटाबेस बैकअप डाउनलोड करें</h4>
                <p className="text-xs text-slate-600 mt-1">
                  वर्तमान सभी ग्राहक, बचत खाते, दैनिक जमा रसीदें और ऑडिट लॉग की सिंगल एन्क्रिप्टेड JSON फाइल डाउनलोड होगी।
                </p>
              </div>

              <button
                type="button"
                onClick={exportDatabaseBackup}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>JSON बैकअप फाइल डाउनलोड करें</span>
              </button>
            </div>

            {/* Restore from File */}
            <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">बैकअप फाइल से डेटा रीस्टोर करें</h4>
                <p className="text-xs text-slate-600 mt-1">
                  पहले से डाउनलोड की गई बैकअप फाइल चुनें। सिस्टम फाइल की संरचना की जांच कर सुरक्षित रीस्टोर करेगा।
                </p>
              </div>

              <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>फाइल चुनें और रीस्टोर करें</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>डेटा सुरक्षा: लोकल ब्राउज़र स्टोरेज + बैकअप फाइल आर्काइव</span>
            <button
              onClick={() => {
                if (window.confirm('क्या आप सचमुच डेटाबेस को प्रारंभिक डेमो स्थिति में रीसेट करना चाहते हैं?')) {
                  resetToDemoData();
                }
              }}
              className="text-rose-600 hover:underline"
            >
              प्रारंभिक डेमो डेटा पर रीसेट करें
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              ऑडिट सुरक्षा लॉग (Audit Trail - {auditLogs.length} घटनाएं)
            </h3>
            <span className="text-xs text-slate-500">
              सख्त अपरिवर्तनीय ऑडिट ट्रेल
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[10px] uppercase border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">समय (Timestamp)</th>
                  <th className="py-2.5 px-3">उपयोगकर्ता / पद</th>
                  <th className="py-2.5 px-3">कार्यवाही (Action)</th>
                  <th className="py-2.5 px-3">विवरण (Details)</th>
                  <th className="py-2.5 px-3">सुरक्षा टैग</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{log.displayTime}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-800">{log.actorName}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-emerald-900">{log.action}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-700">{log.details}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] whitespace-nowrap">{log.ipDeviceTag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
