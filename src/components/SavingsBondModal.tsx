import React, { useState, useEffect, useRef } from 'react';
import { Customer, SavingsAccount } from '../types';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR, numberToHindiWords, formatDateDDMMYYYY } from '../utils/transliteration';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Share2,
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  User,
  AlertTriangle,
  QrCode,
  FileCheck
} from 'lucide-react';

interface SavingsBondModalProps {
  customer: Customer;
  account: SavingsAccount;
  onClose: () => void;
}

export const SavingsBondModal: React.FC<SavingsBondModalProps> = ({ customer, account, onClose }) => {
  const { company, branches, employees, transactions } = useSavingsData();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const branch = branches.find(b => b.id === account.branchId) || branches[0];
  const assignedAgent = employees.find(e => e.id === account.assignedEmployeeId) || employees[0];

  // Derive unique bond number
  const bondNumber = account.bondNumber || `BND-2026-${String(account.accountNumber.replace(/\D/g, '') || '000001').padStart(6, '0')}`;

  useEffect(() => {
    // Generate QR verification payload
    const qrData = JSON.stringify({
      doc: 'DIGITAL_SAVINGS_PASSBOOK_BOND',
      company: company.legalName,
      cin: company.cin,
      bondNo: bondNumber,
      accountNo: account.accountNumber,
      cust: `${customer.nameHindi} (${customer.nameEnglish})`,
      mobile: customer.mobile,
      openDate: account.openingDate,
      plan: account.planNameHindi,
      balance: account.currentBalance,
      verifyUrl: `https://vsmpl.in/verify-bond/${bondNumber}`
    });

    QRCode.toDataURL(qrData, {
      width: 170,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [customer, account, bondNumber, company]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*${company.legalName}*
*बचत खाता बांड (DIGITAL SAVINGS PASSBOOK BOND)*
----------------------------------------
बांड संख्या: *${bondNumber}*
खाता संख्या: *${account.accountNumber}*
खाताधारक: *${customer.nameHindi} (${customer.nameEnglish})*
योजना: *${account.planNameHindi}*
खाता खोलने की तारीख: ${account.openingDate}
वर्तमान बैलेंस: ₹${account.currentBalance}
कुल जमा: ₹${account.totalDeposited}
शाखा: ${branch.nameHindi}
----------------------------------------
हेल्पलाइन: ${company.mobile} | CIN: ${company.cin}
सुरक्षित बचत • पारदर्शी हिसाब • आधिकारिक डिजिटल बांड`;

    const encoded = encodeURIComponent(text);
    const phone = customer.mobile ? `91${customer.mobile}` : '';
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Controls Bar (No Print) */}
        <div className="no-print bg-emerald-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                डिजिटल बचत खाता बांड (Digital Savings Passbook Bond)
              </h2>
              <span className="text-xs text-emerald-300 font-mono">
                बांड सं: {bondNumber} • खाता सं: {account.accountNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 बांड प्रिंट करें (Print Bond)</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bond Container */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[85vh] bg-slate-200/70 flex justify-center">
          <div
            ref={printRef}
            className="print-container w-[210mm] min-h-[297mm] bg-white p-6 sm:p-8 border-4 border-double border-emerald-900 rounded-2xl shadow-xl relative text-slate-900 print:shadow-none print:m-0 print:border-emerald-900"
          >
            {/* Subtle Company Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none overflow-hidden z-0">
              <img
                src={company.logoUrl || '/vrindavan_logo.jpeg'}
                alt=""
                className="w-[140mm] h-[140mm] object-contain rotate-[-15deg]"
              />
            </div>

            {/* Inner Gold / Emerald Double Border Frame */}
            <div className="border-2 border-emerald-800/80 p-5 rounded-xl relative z-10 flex flex-col justify-between min-h-[275mm]">
              {/* TOP HEADER */}
              <div>
                <div className="flex items-center justify-between border-b-2 border-emerald-950 pb-3 mb-4">
                  {/* Official Company Logo */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={company.logoUrl || '/vrindavan_logo.jpeg'}
                      alt={company.legalName}
                      className="w-20 h-20 object-contain drop-shadow-xs shrink-0"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                        Official Customer Savings Document
                      </div>
                      <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-tight">
                        {company.hindiName}
                      </h1>
                      <div className="text-xs font-extrabold text-slate-800">
                        {company.legalName}
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                        CIN: <strong>{company.cin}</strong> | {company.registeredOffice}
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Bond Header Tag */}
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <div className="px-3 py-1 bg-emerald-950 text-white rounded-lg text-xs font-bold tracking-wide uppercase mb-1.5 shadow-2xs">
                      बचत खाता बांड
                    </div>
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="QR Verification"
                        className="w-16 h-16 border border-emerald-900/40 rounded p-0.5 bg-white shadow-2xs"
                      />
                    )}
                    <span className="text-[9px] text-emerald-900 font-mono mt-0.5 font-bold">
                      स्कैन सत्यापन QR
                    </span>
                  </div>
                </div>

                {/* Bond Title Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-2 px-4 rounded-xl text-center shadow-xs mb-4">
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase">
                    डिजिटल बचत पासबुक बांड (DIGITAL SAVINGS PASSBOOK BOND)
                  </h2>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    अधिकृत ग्राहक बचत अभिलेख व आंतरिक खाता पासबुक प्रमाण-पत्र
                  </p>
                </div>

                {/* Key Reference Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl">
                    <span className="text-[10px] text-emerald-800 font-semibold block uppercase">बांड संख्या (Bond No)</span>
                    <strong className="text-sm text-emerald-950">{bondNumber}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                    <span className="text-[10px] text-slate-600 font-semibold block uppercase">खाता संख्या (A/C No)</span>
                    <strong className="text-sm text-slate-900">{account.accountNumber}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
                    <span className="text-[10px] text-slate-600 font-semibold block uppercase">ग्राहक ID (Cust ID)</span>
                    <strong className="text-sm text-slate-900">{customer.id}</strong>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl">
                    <span className="text-[10px] text-amber-900 font-semibold block uppercase">खाता खोलने की तारीख</span>
                    <strong className="text-sm text-amber-950">{account.openingDate}</strong>
                  </div>
                </div>

                {/* 2-Column: Customer Details & Account Scheme Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                  {/* Left: Customer Info Card */}
                  <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-800" />
                        <span>खाताधारक विवरण (Account Holder Info)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                        सत्यापित KYC
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <span className="text-slate-500 font-medium">ग्राहक नाम:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        {customer.nameHindi} ({customer.nameEnglish})
                      </span>

                      <span className="text-slate-500 font-medium">पिता/पति नाम:</span>
                      <span className="col-span-2 text-slate-800 font-medium">{customer.guardianName}</span>

                      <span className="text-slate-500 font-medium">मोबाइल नंबर:</span>
                      <span className="col-span-2 font-mono font-bold text-slate-900">{customer.mobile}</span>

                      <span className="text-slate-500 font-medium">पता व ग्राम:</span>
                      <span className="col-span-2 text-slate-800">
                        {customer.village}, {customer.postOffice}, कुशीनगर - {customer.pincode}
                      </span>

                      <span className="text-slate-500 font-medium">नॉमिनी विवरण:</span>
                      <span className="col-span-2 font-semibold text-emerald-950">
                        {customer.nomineeName} ({customer.nomineeRelation})
                      </span>

                      <span className="text-slate-500 font-medium">KYC पहचान:</span>
                      <span className="col-span-2 text-slate-700 font-mono">
                        {customer.kycType}: {customer.kycDocRef}
                      </span>
                    </div>
                  </div>

                  {/* Right: Account & Passbook Terms */}
                  <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-800" />
                        <span>बचत योजना नियम (Savings Scheme Terms)</span>
                      </span>
                      <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.2 rounded-full font-bold">
                        {account.isFlexible ? 'फ्लेक्सी बचत' : 'नियमित बचत'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <span className="text-slate-500 font-medium">योजना का नाम:</span>
                      <span className="col-span-2 font-bold text-emerald-950">{account.planNameHindi}</span>

                      <span className="text-slate-500 font-medium">जमा आवृत्ति:</span>
                      <span className="col-span-2 text-slate-800 font-medium">
                        {account.isFlexible ? 'ऐच्छिक (सुविधानुसार कभी भी)' : `${account.depositFrequency}`}
                      </span>

                      <span className="text-slate-500 font-medium">ब्याज दर:</span>
                      <span className="col-span-2 font-mono font-bold text-emerald-900">
                        {account.annualInterestRate}% वार्षिक (सालाना)
                      </span>

                      <span className="text-slate-500 font-medium">ब्याज आकलन:</span>
                      <span className="col-span-2 text-slate-800">
                        वास्तविक दैनिक क्लोजिंग बैलेंस के आधार पर
                      </span>

                      <span className="text-slate-500 font-medium">अवधि / मैच्योरिटी:</span>
                      <span className="col-span-2 text-slate-800 font-mono">
                        {account.durationMonths} माह ({account.maturityDate || 'अप्रतिबंधित'})
                      </span>

                      <span className="text-slate-500 font-medium">शाखा व एजेंट:</span>
                      <span className="col-span-2 text-slate-800">
                        {branch.nameHindi} • {assignedAgent.nameHindi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Passbook Ledger Summary Connected to Account */}
                <div className="p-3.5 rounded-xl border-2 border-emerald-800/80 bg-white mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-emerald-950 tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>पासबुक लाइव वित्तीय स्थिति (Passbook Ledger Summary)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      दिनांक: {formatDateDDMMYYYY(new Date())}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">कुल जमा राशि</span>
                      <strong className="text-sm text-slate-900">{formatINR(account.totalDeposited)}</strong>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">कुल निकासी</span>
                      <strong className="text-sm text-rose-700">{formatINR(account.totalWithdrawn)}</strong>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">क्रेडिट ब्याज</span>
                      <strong className="text-sm text-emerald-800">{formatINR(account.totalInterestCredited)}</strong>
                    </div>

                    <div className="p-2 bg-emerald-100/70 rounded-lg border border-emerald-400">
                      <span className="text-[10px] text-emerald-900 font-bold block">वर्तमान उपलब्ध बैलेंस</span>
                      <strong className="text-base text-emerald-950 font-black">{formatINR(account.currentBalance)}</strong>
                    </div>
                  </div>
                </div>

                {/* Important Terms & Legal Disclosures */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-[10px] text-slate-700 space-y-1 leading-relaxed mb-4">
                  <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>महत्वपूर्ण शर्तें व वैधानिक प्रकटीकरण (Terms & Statutory Disclosure):</span>
                  </div>
                  <p>
                    1. यह बांड कंपनी के बचत खाता नियमों के अधीन अधिकृत ग्राहक रिकॉर्ड के रूप में जारी किया गया है। यह कोई सरकारी बांड या गारंटीकृत सट्टा निवेश नहीं है।
                  </p>
                  <p>
                    2. <strong>फ्लेक्सी बचत (Flexible Savings):</strong> ग्राहक पर प्रतिदिन या प्रतिमाह निश्चित राशि जमा करने की कोई बाध्यता नहीं है। कोई लेट फीस या पेनल्टी नहीं लगेगी। ग्राहक अपनी सुविधानुसार अधिकृत सीमा के भीतर कितनी भी राशि जमा कर सकता है।
                  </p>
                  <p>
                    3. ब्याज की गणना वास्तविक दैनिक अंतिम शेष (Daily Closing Balance) के आधार पर तय दर अनुसार की जाती है तथा अधिकृत अनुमोदन उपरांत खाते में जोड़ी जाती है।
                  </p>
                </div>
              </div>

              {/* SIGNATURE & SEAL AREA */}
              <div className="pt-4 border-t-2 border-emerald-950 mt-2">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  {/* Customer Signature */}
                  <div className="flex flex-col items-center justify-end h-20">
                    <div className="w-36 border-b border-dashed border-slate-600 mb-1"></div>
                    <span className="font-bold text-slate-900">खाताधारक हस्ताक्षर / अंगूठा</span>
                    <span className="text-[9px] text-slate-500">Customer Signature / Thumb</span>
                  </div>

                  {/* Company Official Seal Area */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800/60 flex flex-col items-center justify-center p-1">
                      <span className="text-[8px] font-bold text-emerald-900 uppercase">आधिकारिक मुहर</span>
                      <span className="text-[7px] text-slate-500">VSMPL SEAL</span>
                    </div>
                  </div>

                  {/* Authorized Branch Signatory */}
                  <div className="flex flex-col items-center justify-end h-20">
                    <div className="w-36 border-b border-slate-800 mb-1 font-signature text-xs text-emerald-950 font-bold">
                      राजेश कुशवाहा
                    </div>
                    <span className="font-bold text-slate-900">अधिकृत अधिकारी / शाखा प्रबंधक</span>
                    <span className="text-[9px] text-slate-500">Authorized Signatory • कुशीनगर</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500 font-mono">
                  {company.legalName} • रजिस्टर्ड कार्यालय: {company.registeredOffice} • हेल्पलाइन: {company.mobile}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
