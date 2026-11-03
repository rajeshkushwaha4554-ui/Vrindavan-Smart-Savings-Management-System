import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { useSavingsData } from '../context/SavingsDataContext';
import { formatINR, numberToHindiWords } from '../utils/transliteration';
import QRCode from 'qrcode';
import { Printer, Download, Share2, X, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { company, customers, accounts } = useSavingsData();
  const [format, setFormat] = useState<'portrait' | 'landscape' | 'thermal'>('portrait');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const customer = customers.find(c => c.id === transaction.customerId);
  const account = accounts.find(a => a.id === transaction.accountId);

  useEffect(() => {
    // Generate QR code data
    const qrPayload = JSON.stringify({
      company: 'VRINDAVAN SMALL MICROFINANCE PVT LTD',
      cin: company.cin,
      txnId: transaction.id,
      rcp: transaction.receiptNumber,
      account: transaction.accountNumber,
      customer: `${transaction.customerNameHindi} (${transaction.customerNameEnglish})`,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.displayDate,
      balance: transaction.currentBalance,
      verify: 'GENUINE_VSMPL_RECORD'
    });

    QRCode.toDataURL(qrPayload, {
      width: 160,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [transaction, company]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const isDeposit = transaction.type === 'deposit';
    const msg = `*${company.legalName}*
*${isDeposit ? 'जमा रसीद (DEPOSIT RECEIPT)' : 'निकासी रसीद (WITHDRAWAL RECEIPT)'}*
------------------------------
रसीद सं: ${transaction.receiptNumber}
ट्रांजैक्शन ID: ${transaction.id}
तारीख: ${transaction.displayDate}
खाता संख्या: ${transaction.accountNumber}
ग्राहक नाम: ${transaction.customerNameHindi}
रकम: ${formatINR(transaction.amount)} (${numberToHindiWords(transaction.amount)})
पिछला बैलेंस: ${formatINR(transaction.previousBalance)}
वर्तमान बैलेंस: ${formatINR(transaction.currentBalance)}
संग्रहकर्ता: ${transaction.employeeName} (${transaction.employeeId})
शाखा: ${transaction.branchName}
------------------------------
कुशीनगर, उत्तर प्रदेश | हेल्पलाइन: ${company.mobile}
सुरक्षित बचत • सही हिसाब • पारदर्शी रिपोर्ट`;

    const encoded = encodeURIComponent(msg);
    const phone = customer?.mobile ? `91${customer.mobile}` : '';
    const whatsappUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const isDeposit = transaction.type === 'deposit';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Modal Controls Header (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              VS
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                VIP {isDeposit ? 'जमा रसीद' : 'निकासी रसीद'} पूर्वावलोकन
              </h2>
              <span className="text-xs text-slate-400">
                रसीद सं: {transaction.receiptNumber} | {transaction.accountNumber}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="bg-slate-800 rounded-lg p-0.5 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setFormat('portrait')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  format === 'portrait' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                खड़ी (Portrait)
              </button>
              <button
                type="button"
                onClick={() => setFormat('landscape')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  format === 'landscape' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                आड़ी (Landscape)
              </button>
              <button
                type="button"
                onClick={() => setFormat('thermal')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  format === 'thermal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                थर्मल (80mm)
              </button>
            </div>

            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="WhatsApp पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-4 sm:p-8 overflow-x-auto bg-slate-100 flex justify-center">
          <div ref={printRef} className="print-container">
            {/* 1. PORTRAIT VIEW */}
            {format === 'portrait' && (
              <div className="w-[195mm] min-h-[260mm] bg-white p-8 border-2 border-emerald-900 rounded-lg shadow-md relative text-slate-900 print:shadow-none print:m-0 print:border-emerald-800 overflow-hidden">
                {/* Subtle Company Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden z-0">
                  <img
                    src={company.logoUrl || '/vrindavan_logo.jpeg'}
                    alt=""
                    className="w-[120mm] h-[120mm] object-contain rotate-[-15deg]"
                  />
                </div>

                {/* Outer border decoration */}
                <div className="border border-emerald-800/40 p-5 rounded-md relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-4">
                    <div className="flex items-center gap-3.5">
                      {/* White logo on dark green header box */}
                      <div className="bg-emerald-950 p-2 rounded-2xl flex items-center justify-center border border-emerald-800 shadow-md shrink-0">
                        <img
                          src={company.logoUrl || '/vrindavan_logo.jpeg'}
                          alt={company.legalName}
                          className="w-14 h-14 object-contain filter brightness-0 invert"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-emerald-800 tracking-wider uppercase">
                          Regd. under Ministry of Corporate Affairs, Govt. of India
                        </div>
                        <h1 className="text-xl font-extrabold text-emerald-950 leading-tight">
                          VRINDAVAN SMALL MICROFINANCE PRIVATE LIMITED
                        </h1>
                        <h2 className="text-sm font-semibold text-emerald-800">
                          वृंदावन स्मॉल माइक्रोफाइनेंस प्राइवेट लिमिटेड
                        </h2>
                        <div className="text-xs text-slate-700 mt-1 font-mono">
                          CIN: <span className="font-bold">{company.cin}</span> | PAN: {company.pan}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-600">
                      <div className="font-medium">{company.registeredOffice}</div>
                      <div>मो: <span className="font-bold font-mono text-slate-900">{company.mobile}</span></div>
                      <div>ईमेल: <span className="font-mono text-slate-900">{company.email}</span></div>
                      <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        शाखा: {transaction.branchName}
                      </div>
                    </div>
                  </div>

                  {/* Title Bar */}
                  <div className="my-3 flex items-center justify-between bg-emerald-900 text-white px-4 py-2 rounded-md shadow-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span className="font-bold text-sm tracking-wide">
                        {isDeposit ? 'आधिकारिक बचत जमा रसीद (DEPOSIT RECEIPT)' : 'आधिकारिक बचत निकासी रसीद (WITHDRAWAL RECEIPT)'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-emerald-200 font-medium">
                      ओरिजिनल ग्राहक प्रति (Original Customer Copy)
                    </div>
                  </div>

                  {/* Meta Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-md font-mono mb-4">
                    <div>
                      <span className="text-slate-500 block text-[10px]">रसीद संख्या:</span>
                      <strong className="text-emerald-900 text-sm">{transaction.receiptNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">ट्रांजैक्शन ID:</span>
                      <strong className="text-slate-800">{transaction.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">तारीख व समय:</span>
                      <strong className="text-slate-800">{transaction.displayDate} {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">भुगतान माध्यम:</span>
                      <strong className="text-slate-900 uppercase">{transaction.paymentMethod}</strong>
                    </div>
                  </div>

                  {/* Customer & Account Details Table */}
                  <div className="border border-slate-300 rounded-md overflow-hidden mb-4">
                    <table className="w-full text-xs">
                      <tbody>
                        <tr className="border-b border-slate-200 bg-slate-50/70">
                          <td className="py-2 px-3 font-semibold text-slate-600 w-1/4">ग्राहक का नाम:</td>
                          <td className="py-2 px-3 font-bold text-slate-900 text-sm">
                            {transaction.customerNameHindi}{' '}
                            <span className="text-slate-500 font-normal text-xs">({transaction.customerNameEnglish})</span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-600 w-1/4">ग्राहक ID (CUST ID):</td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-900">{transaction.customerId}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="py-2 px-3 font-semibold text-slate-600">पिता/पति का नाम:</td>
                          <td className="py-2 px-3 text-slate-800">{customer?.guardianName || 'उपलब्ध नहीं'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-600">मोबाइल नंबर:</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{customer?.mobile || company.mobile}</td>
                        </tr>
                        <tr className="border-b border-slate-200 bg-slate-50/70">
                          <td className="py-2 px-3 font-semibold text-slate-600">बचत खाता संख्या:</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 text-sm">{transaction.accountNumber}</td>
                          <td className="py-2 px-3 font-semibold text-slate-600">योजना का प्रकार:</td>
                          <td className="py-2 px-3 font-semibold text-emerald-800">
                            {account?.planNameHindi || (account?.planType === 'daily' ? 'दैनिक बचत' : 'मासिक बचत')}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-semibold text-slate-600">पता:</td>
                          <td className="py-2 px-3 text-slate-700" colSpan={3}>
                            {customer?.fullAddress || 'ग्राम - नौरंगिया, कुशीनगर, उत्तर प्रदेश'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Statement Box */}
                  <div className="bg-emerald-50/60 border-2 border-emerald-800/60 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-3 text-center border-b border-emerald-200 pb-3 mb-3">
                      <div className="border-r border-emerald-200">
                        <span className="text-[11px] text-slate-600 block">पिछला बैलेंस (Previous Balance)</span>
                        <span className="text-base font-mono font-bold text-slate-800">{formatINR(transaction.previousBalance)}</span>
                      </div>
                      <div className="border-r border-emerald-200 bg-white/70 py-1 rounded-md shadow-2xs">
                        <span className="text-[11px] text-emerald-900 font-bold block">
                          {isDeposit ? 'जमा राशि (Deposit Amount)' : 'निकासी राशि (Withdrawal Amount)'}
                        </span>
                        <span className={`text-xl font-mono font-extrabold ${isDeposit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isDeposit ? '+' : '-'} {formatINR(transaction.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-600 block">वर्तमान बैलेंस (Current Balance)</span>
                        <span className="text-lg font-mono font-extrabold text-emerald-950">{formatINR(transaction.currentBalance)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-emerald-950 font-medium flex items-center justify-between">
                      <div>
                        <span className="text-slate-600">राशि शब्दों में: </span>
                        <strong className="underline text-emerald-900 font-semibold">{numberToHindiWords(transaction.amount)}</strong>
                      </div>
                      {transaction.referenceNo && (
                        <div className="text-slate-500 font-mono text-[11px]">
                          Ref: {transaction.referenceNo}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks & GPS Location */}
                  <div className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>विवरण / Remarks: </strong> {transaction.remarks || 'दैनिक बचत संग्रह'}
                      {transaction.withdrawalReason && (
                        <span className="text-rose-700 font-semibold ml-2">निकासी कारण: {transaction.withdrawalReason}</span>
                      )}
                    </div>
                    {transaction.gpsLocation && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        स्थान: {transaction.gpsLocation}
                      </div>
                    )}
                  </div>

                  {/* Bottom Verification Section: QR + Signatures */}
                  <div className="grid grid-cols-4 gap-3 items-end pt-3 border-t border-slate-300">
                    <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-md">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Verification" className="w-20 h-20" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 animate-pulse" />
                      )}
                      <span className="text-[9px] text-slate-500 text-center font-mono mt-0.5">स्कैन कर सत्यापन करें</span>
                    </div>

                    <div className="text-center">
                      <div className="h-14 flex items-end justify-center">
                        <span className="font-cursive text-sm text-slate-700 italic">
                          {transaction.employeeName}
                        </span>
                      </div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-700">
                        संग्रहकर्ता / कर्मचारी हस्ताक्षर
                        <div className="text-[10px] text-slate-500 font-mono">ID: {transaction.employeeId}</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="h-14 flex items-end justify-center">
                        <div className="w-16 h-12 rounded-full border border-dashed border-emerald-600 flex items-center justify-center text-[9px] font-bold text-emerald-800 rotate-[-12deg]">
                          VSMPL SEAL
                        </div>
                      </div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-700">
                        कंपनी मोहर / अधिकृत मुहर
                        <div className="text-[10px] text-slate-500">Authorized Seal</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="h-14 flex items-end justify-center">
                        <span className="text-xs text-slate-400">हस्ताक्षर / अंगूठा</span>
                      </div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] text-slate-700">
                        ग्राहक के हस्ताक्षर
                        <div className="text-[10px] text-slate-500">Customer Signature</div>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Footer */}
                  <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500 flex items-center justify-between">
                    <div>
                      * यह एक कंप्यूटर जनरेटेड वैध रसीद है। किसी भी असुविधा के लिए संपर्क करें: {company.mobile}
                    </div>
                    <div>
                      VRINDAVAN SMALL MICROFINANCE PVT. LTD. • KUSHINAGAR (U.P.)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LANDSCAPE VIEW */}
            {format === 'landscape' && (
              <div className="w-[270mm] min-h-[180mm] bg-white p-6 border-2 border-emerald-900 rounded-lg shadow-md relative text-slate-900 print:shadow-none print:m-0 print:border-emerald-800 overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none overflow-hidden z-0">
                  <img
                    src={company.logoUrl || '/vrindavan_logo.jpeg'}
                    alt=""
                    className="w-[110mm] h-[110mm] object-contain rotate-[-15deg]"
                  />
                </div>

                <div className="border border-emerald-800/40 p-4 rounded-md relative z-10">
                  {/* Top Company Header */}
                  <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-950 p-1.5 rounded-xl flex items-center justify-center border border-emerald-800 shadow-sm shrink-0">
                        <img
                          src={company.logoUrl || '/vrindavan_logo.jpeg'}
                          alt={company.legalName}
                          className="w-12 h-12 object-contain filter brightness-0 invert"
                        />
                      </div>
                      <div>
                        <h1 className="text-lg font-black text-emerald-950 leading-tight">
                          VRINDAVAN SMALL MICROFINANCE PRIVATE LIMITED
                        </h1>
                        <h2 className="text-xs font-bold text-emerald-800">
                          वृंदावन स्मॉल माइक्रोफाइनेंस प्राइवेट लिमिटेड (नौरंगिया बरगहा रोड, कुशीनगर)
                        </h2>
                        <div className="text-[11px] text-slate-600 font-mono">
                          CIN: <strong>{company.cin}</strong> | फोन: {company.mobile} | ईमेल: {company.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-emerald-900 text-white rounded text-xs font-bold tracking-wide">
                        {isDeposit ? 'VIP जमा रसीद (DEPOSIT RECEIPT)' : 'VIP निकासी रसीद (WITHDRAWAL RECEIPT)'}
                      </div>
                      <div className="text-xs font-mono font-semibold text-emerald-900 mt-1">
                        रसीद सं: {transaction.receiptNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {transaction.displayDate} {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Body Layout */}
                  <div className="grid grid-cols-12 gap-4 mt-3 mb-3">
                    {/* Customer & Account Info (7 cols) */}
                    <div className="col-span-7 border border-slate-300 rounded-md p-3 text-xs bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-slate-200">
                        <div>
                          <span className="text-slate-500 block text-[10px]">ग्राहक का नाम (Customer Name):</span>
                          <strong className="text-sm text-slate-900">{transaction.customerNameHindi}</strong>
                          <div className="text-slate-600 text-[11px]">({transaction.customerNameEnglish})</div>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ग्राहक ID / CUST ID:</span>
                          <strong className="font-mono text-emerald-900 text-sm">{transaction.customerId}</strong>
                          <div className="text-slate-600 text-[11px]">पिता: {customer?.guardianName || 'उपलब्ध'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="text-slate-500 block text-[10px]">खाता संख्या (Account No):</span>
                          <strong className="font-mono text-slate-900 text-sm">{transaction.accountNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">योजना (Savings Scheme):</span>
                          <strong className="text-emerald-800">{account?.planNameHindi || 'दैनिक/मासिक बचत'}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                        <div>पता: {customer?.fullAddress || 'कुशीनगर, उत्तर प्रदेश'} | मो: {customer?.mobile || company.mobile}</div>
                        <div>कर्मचारी: <strong>{transaction.employeeName}</strong> ({transaction.employeeId}) | शाखा: {transaction.branchName}</div>
                      </div>
                    </div>

                    {/* Financial Figures Box (5 cols) */}
                    <div className="col-span-5 bg-emerald-50 border-2 border-emerald-700/80 rounded-md p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-600 border-b border-emerald-200 pb-1 mb-2">
                          <span>पिछला बैलेंस (Previous Balance):</span>
                          <span className="font-mono font-bold">{formatINR(transaction.previousBalance)}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-950">
                            {isDeposit ? 'जमा रकम (Deposit Amount):' : 'निकासी रकम (Withdrawal):'}
                          </span>
                          <span className={`text-xl font-mono font-extrabold ${isDeposit ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isDeposit ? '+' : '-'} {formatINR(transaction.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-white p-2 rounded border border-emerald-300">
                          <span className="font-bold text-slate-900 text-xs">वर्तमान शेष (Current Balance):</span>
                          <span className="font-mono font-extrabold text-emerald-900 text-base">{formatINR(transaction.currentBalance)}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-emerald-900 font-semibold mt-2 pt-1 border-t border-emerald-200">
                        शब्दों में: {numberToHindiWords(transaction.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Signatures & QR Section */}
                  <div className="grid grid-cols-12 gap-3 items-end pt-2 border-t border-slate-300">
                    <div className="col-span-3 flex items-center gap-2">
                      {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-16 h-16 border border-slate-200 p-0.5 rounded" />}
                      <div className="text-[9px] text-slate-500 font-mono leading-tight">
                        TXN: {transaction.id}<br />
                        मोड: {transaction.paymentMethod.toUpperCase()}<br />
                        सत्यापित डिजिटल रिकॉर्ड
                      </div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="h-10 flex items-end justify-center text-xs font-medium text-slate-700">
                        {transaction.employeeName}
                      </div>
                      <div className="border-t border-slate-400 pt-0.5 text-[10px] text-slate-600">
                        संग्रहकर्ता हस्ताक्षर
                      </div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="h-10 flex items-end justify-center">
                        <div className="px-2 py-0.5 border border-dashed border-emerald-700 text-[9px] font-bold text-emerald-900 rotate-[-5deg]">
                          VSMPL OFFICIAL
                        </div>
                      </div>
                      <div className="border-t border-slate-400 pt-0.5 text-[10px] text-slate-600">
                        कंपनी अधिकृत मोहर
                      </div>
                    </div>

                    <div className="col-span-3 text-center">
                      <div className="h-10 flex items-end justify-center text-[11px] text-slate-400">
                        हस्ताक्षर
                      </div>
                      <div className="border-t border-slate-400 pt-0.5 text-[10px] text-slate-600">
                        ग्राहक के हस्ताक्षर
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. THERMAL 80MM VIEW */}
            {format === 'thermal' && (
              <div className="w-[80mm] min-h-[140mm] bg-white p-3 border border-slate-400 font-mono text-[11px] leading-tight text-black shadow-md print:shadow-none print:m-0 print:border-none">
                <div className="text-center border-b border-black pb-2 mb-2">
                  <div className="flex justify-center mb-1">
                    <img
                      src={company.logoUrl || '/vrindavan_logo.jpeg'}
                      alt={company.legalName}
                      className="w-12 h-12 object-contain filter grayscale"
                    />
                  </div>
                  <div className="font-bold text-sm tracking-tight uppercase">VRINDAVAN SMALL MICROFINANCE</div>
                  <div className="text-[10px]">वृंदावन स्मॉल माइक्रोफाइनेंस प्रा. लि.</div>
                  <div className="text-[9px]">CIN: {company.cin}</div>
                  <div className="text-[9px]">नौरंगिया बरगहा रोड, कुशीनगर</div>
                  <div className="text-[9px]">मो: {company.mobile}</div>
                </div>

                <div className="text-center font-bold text-xs uppercase my-1 bg-black text-white py-0.5">
                  {isDeposit ? '*** DEPOSIT RECEIPT ***' : '*** WITHDRAWAL RECEIPT ***'}
                </div>

                <div className="space-y-0.5 border-b border-dashed border-black pb-1 mb-1">
                  <div>रसीद सं : <strong>{transaction.receiptNumber}</strong></div>
                  <div>TXN ID  : {transaction.id}</div>
                  <div>तारीख    : {transaction.displayDate} {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>शाखा     : {transaction.branchName}</div>
                </div>

                <div className="space-y-0.5 border-b border-dashed border-black pb-1 mb-1">
                  <div>ग्राहक   : <strong>{transaction.customerNameHindi}</strong></div>
                  <div>Eng     : {transaction.customerNameEnglish}</div>
                  <div>Cust ID : {transaction.customerId}</div>
                  <div>खाता सं  : <strong>{transaction.accountNumber}</strong></div>
                  <div>योजना    : {account?.planNameHindi || 'बचत खाता'}</div>
                </div>

                <div className="my-2 border-y border-black py-1">
                  <div className="flex justify-between">
                    <span>पिछला बैलेंस:</span>
                    <span>{formatINR(transaction.previousBalance)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs my-0.5">
                    <span>{isDeposit ? 'जमा राशि:' : 'निकासी राशि:'}</span>
                    <span>{formatINR(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs">
                    <span>वर्तमान शेष:</span>
                    <span>{formatINR(transaction.currentBalance)}</span>
                  </div>
                </div>

                <div className="text-[9px] mb-2 leading-tight">
                  शब्दों में: {numberToHindiWords(transaction.amount)}
                </div>

                <div className="text-[9px] mb-2">
                  कर्मचारी: {transaction.employeeName} ({transaction.employeeId})<br />
                  माध्यम: {transaction.paymentMethod.toUpperCase()}<br />
                  GPS: {transaction.gpsLocation || 'नौरंगिया'}
                </div>

                {qrCodeUrl && (
                  <div className="flex flex-col items-center my-2">
                    <img src={qrCodeUrl} alt="QR" className="w-20 h-20" />
                    <span className="text-[8px] text-center">डिजिटल सत्यापन कोड</span>
                  </div>
                )}

                <div className="text-center text-[9px] border-t border-black pt-1 mt-2">
                  धन्यवाद! सुरक्षित भविष्य की बचत।<br />
                  VRINDAVAN SMALL MICROFINANCE
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
