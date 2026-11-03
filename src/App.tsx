import React, { useState } from 'react';
import { SavingsDataProvider, useSavingsData } from './context/SavingsDataContext';
import { HomePage } from './components/HomePage';
import { CustomerManagement } from './components/CustomerManagement';
import { AccountOpening } from './components/AccountOpening';
import { DepositModule } from './components/DepositModule';
import { WithdrawalModule } from './components/WithdrawalModule';
import { InterestCalculatorView } from './components/InterestCalculatorView';
import { ReportsView } from './components/ReportsView';
import { ComplianceSettingsView } from './components/ComplianceSettingsView';
import { EmployeePanel } from './components/EmployeePanel';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { ReceiptManagementView } from './components/ReceiptManagementView';
import { MaturityReportView } from './components/MaturityReportView';
import { PassbookSelectorModal } from './components/PassbookSelectorModal';
import { CashHandoverModal } from './components/CashHandoverModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PassbookModal } from './components/PassbookModal';
import { SavingsBondModal } from './components/SavingsBondModal';
import { EODClosingModal } from './components/EODClosingModal';
import { QuickEasyMode } from './components/QuickEasyMode';

import {
  Home,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  CheckCircle,
  Phone,
  Wallet,
  Menu,
  X,
  Zap,
  BookOpen
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    company,
    currentRole,
    setCurrentRole,
    selectedEmployeeId,
    setSelectedEmployeeId,
    employees,
    receiptForPrint,
    setReceiptForPrint,
    passbookForPrint,
    setPassbookForPrint,
    bondForPrint,
    setBondForPrint,
    eodReport,
    setEodReport,
    performEODClosing
  } = useSavingsData();

  // Active module tab: 'home' is the default landing page
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeTabParam, setActiveTabParam] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [showPassbookSelector, setShowPassbookSelector] = useState(false);
  const [isPassbookPrintMode, setIsPassbookPrintMode] = useState(false);
  const [showCashHandover, setShowCashHandover] = useState(false);

  const currentEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  const handleNavigate = (module: string, param?: string) => {
    setActiveTab(module);
    setActiveTabParam(param);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPassbookSelector = (isPrint: boolean) => {
    setIsPassbookPrintMode(isPrint);
    setShowPassbookSelector(true);
  };

  const handleTriggerEOD = () => {
    performEODClosing('राजेश कुमार (शाखा प्रबंधक)');
  };

  // Module human labels in Hindi for Breadcrumbs
  const moduleNames: Record<string, string> = {
    home: 'मुख्य होम पेज',
    customer_add: 'नया ग्राहक जोड़ें',
    customer_list: 'सभी ग्राहक सूची',
    open_account: 'नया बचत खाता खोलें',
    deposit: 'पैसा जमा करें (फ्लेक्सी बचत)',
    withdrawal: 'पैसा निकासी करें',
    calculator: 'ब्याज कैलकुलेटर व लेजर',
    employees: 'कर्मचारी मैनेजमेंट',
    field_collection: 'फील्ड कलेक्शन (कर्मचारी पोर्टल)',
    receipts: 'रसीद मैनेजमेंट',
    reports_daily: 'दैनिक कलेक्शन रिपोर्ट (डे-बुक)',
    reports_all: 'सभी रिपोर्ट (वित्तीय विवरण)',
    reports_ledger: 'फाइनेंशियल लेजर',
    maturity: 'मैच्योरिटी रिपोर्ट',
    settings_company: 'कंपनी सेटिंग',
    settings_system: 'सिस्टम व अनुपालन सेटिंग',
    settings_backup: 'बैकअप और डेटा रिकवरी',
    quick_mode: 'सरल टच मोड'
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header / Sticky Brand Bar (No print) */}
      <header className="no-print bg-emerald-950 text-white sticky top-0 z-40 border-b border-emerald-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2.5 text-left group"
              title="होम पेज पर जाएं"
            >
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-xs border border-emerald-500/60 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition">
                <img
                  src={company.logoUrl || '/vrindavan_logo.jpeg'}
                  alt={company.legalName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                    {company.hindiName}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] bg-emerald-800 text-emerald-200 font-mono px-1.5 py-0.2 rounded border border-emerald-700">
                    CIN: {company.cin}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-300 font-medium">
                  वेबसाइट बचत सॉफ्टवेयर • कुशीनगर, उ.प्र.
                </div>
              </div>
            </button>
          </div>

          {/* Right Header: Home Button, Role Switcher & EOD */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Home button if outside home */}
            {activeTab !== 'home' && (
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-emerald-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">होम पेज</span>
              </button>
            )}

            {/* EOD Closing Button */}
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={handleTriggerEOD}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                title="आज का पूरा हिसाब बंद करें"
              >
                <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden md:inline">आज का हिसाब बंद करें</span>
                <span className="md:hidden">EOD हिसाब</span>
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="bg-emerald-900/90 p-0.5 rounded-xl border border-emerald-700/60 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setCurrentRole('admin')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>एडमिन</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentRole('employee')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  currentRole === 'employee'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>कर्मचारी</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation Bar (Visible whenever outside Home) */}
      {activeTab !== 'home' && (
        <div className="no-print bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <button
                type="button"
                onClick={() => handleNavigate('home')}
                className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>मुख्य होम पेज</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                {moduleNames[activeTab] || activeTab}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← मुख्य होम पेज पर वापस जाएं</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {/* 1. HOMEPAGE VIEW (Default) */}
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenPassbookSelector={handleOpenPassbookSelector}
            onOpenCashHandover={() => setShowCashHandover(true)}
            onOpenEOD={handleTriggerEOD}
          />
        )}

        {/* 01 & 05: Customer Management */}
        {(activeTab === 'customer_add' || activeTab === 'customer_list') && (
          <CustomerManagement
            initialShowAdd={activeTab === 'customer_add'}
            onOpenDepositForCustomer={() => handleNavigate('deposit')}
            onOpenAccountForCustomer={() => handleNavigate('open_account')}
          />
        )}

        {/* 02: Open Account */}
        {activeTab === 'open_account' && (
          <AccountOpening />
        )}

        {/* 03: Deposit */}
        {activeTab === 'deposit' && (
          <DepositModule />
        )}

        {/* 04: Withdrawal */}
        {activeTab === 'withdrawal' && (
          <WithdrawalModule />
        )}

        {/* 09: Interest Calculator */}
        {activeTab === 'calculator' && (
          <InterestCalculatorView />
        )}

        {/* 10: Employees Management */}
        {activeTab === 'employees' && (
          <EmployeeManagementView />
        )}

        {/* 11: Field Collection (Responsive Mobile-Friendly Web View for Field Agents) */}
        {activeTab === 'field_collection' && (
          <EmployeePanel />
        )}

        {/* 13, 15, 16: Reports */}
        {(activeTab === 'reports_daily' || activeTab === 'reports_all' || activeTab === 'reports_ledger') && (
          <ReportsView
            initialReport={
              activeTab === 'reports_daily'
                ? 'day_book'
                : activeTab === 'reports_ledger'
                ? 'ledger'
                : 'daily'
            }
          />
        )}

        {/* 14: Receipt Management */}
        {activeTab === 'receipts' && (
          <ReceiptManagementView />
        )}

        {/* 17: Maturity Report */}
        {activeTab === 'maturity' && (
          <MaturityReportView />
        )}

        {/* 18, 19, 20: Settings (Company, System, Backup) */}
        {(activeTab === 'settings_company' || activeTab === 'settings_system' || activeTab === 'settings_backup') && (
          <ComplianceSettingsView
            initialTab={
              activeTab === 'settings_company'
                ? 'company'
                : activeTab === 'settings_backup'
                ? 'backup'
                : 'compliance'
            }
          />
        )}

        {/* Quick Touch Mode */}
        {activeTab === 'quick_mode' && (
          <QuickEasyMode
            onNavigate={handleNavigate}
            onOpenDeposit={() => handleNavigate('deposit')}
            onOpenWithdrawal={() => handleNavigate('withdrawal')}
            onOpenCustomer={() => handleNavigate('customer_list')}
            onOpenAccount={() => handleNavigate('open_account')}
            onOpenEOD={handleTriggerEOD}
          />
        )}
      </main>

      {/* Website-Only Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="font-bold text-white text-sm">
              {company.legalName}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {company.registeredOffice} • CIN: <span className="font-mono">{company.cin}</span>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <div>
              हेल्पलाइन: <strong className="text-slate-200 font-mono">{company.mobile}</strong> | {company.email}
            </div>
            <div className="text-slate-500 mt-0.5">
              वेबसाइट-ओनली बचत खाता प्रबंधन प्रणाली • सभी मुख्य बटन होम पेज पर उपलब्ध
            </div>
          </div>
        </div>
      </footer>

      {/* Passbook Selector Modal (Buttons 07 & 08) */}
      {showPassbookSelector && (
        <PassbookSelectorModal
          isPrintMode={isPassbookPrintMode}
          onClose={() => setShowPassbookSelector(false)}
        />
      )}

      {/* Cash Handover Modal (Button 12) */}
      {showCashHandover && (
        <CashHandoverModal
          onClose={() => setShowCashHandover(false)}
        />
      )}

      {/* VIP Receipt Modal (Auto-open or Reprint) */}
      {receiptForPrint && (
        <ReceiptModal
          transaction={receiptForPrint}
          onClose={() => setReceiptForPrint(null)}
        />
      )}

      {/* Digital Passbook / Booklet Modal */}
      {passbookForPrint && (
        <PassbookModal
          customer={passbookForPrint.customer}
          account={passbookForPrint.account}
          onClose={() => setPassbookForPrint(null)}
        />
      )}

      {/* Digital Savings Passbook Bond Modal */}
      {bondForPrint && (
        <SavingsBondModal
          customer={bondForPrint.customer}
          account={bondForPrint.account}
          onClose={() => setBondForPrint(null)}
        />
      )}

      {/* End of Day Closing Summary Modal */}
      {eodReport && (
        <EODClosingModal
          summary={eodReport}
          onClose={() => setEodReport(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SavingsDataProvider>
      <MainAppContent />
    </SavingsDataProvider>
  );
}
