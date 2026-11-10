import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { FundTransaction } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface PrintableReceiptProps {
  transaction: FundTransaction | null;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  // Convert number to Thai text description
  const thaiBahtText = (num: number): string => {
    return `${num.toLocaleString()} บาทถ้วน`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 flex flex-col justify-between max-h-[95vh] overflow-y-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm md:text-base">
              ใบเสร็จรับเงิน / ใบสำคัญรับ-จ่าย กองทุนหมู่บ้าน
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Slip Body */}
        <div className="p-6 md:p-8 border-2 border-slate-300 rounded-2xl bg-white space-y-5 font-sarabun text-slate-900 print:border-black">
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-slate-200">
            <h2 className="font-bold text-base md:text-lg">
              {transaction.type === 'income' ? 'ใบเสร็จรับเงิน' : 'ใบสำคัญจ่ายเงิน'}
            </h2>
            <h3 className="text-xs md:text-sm font-semibold text-slate-800">
              กองทุนเพื่อการพัฒนาหมู่บ้านหาดทรายทอง หมู่ที่ 7
            </h3>
            <p className="text-xs text-slate-600">
              {VILLAGE_META.villageName} {VILLAGE_META.moo} {VILLAGE_META.subdistrict} {VILLAGE_META.district} {VILLAGE_META.province} {VILLAGE_META.zipCode}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-semibold">เลขที่อ้างอิง: </span>
              <span className="font-mono font-bold text-slate-800">{transaction.receiptRef || transaction.id}</span>
            </div>
            <div>
              <span className="font-semibold">วันที่: </span>
              <span>{transaction.date}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="text-xs space-y-2 py-2 border-y border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-600">หมวดหมู่รายการ:</span>
              <span className="font-bold text-slate-900">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">ประเภทรายการ:</span>
              <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {transaction.type === 'income' ? 'รายรับกองทุน' : 'รายจ่ายกองทุน'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">รายละเอียด:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{transaction.description}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <div>จำนวนเงินรวมทั้งสิ้น</div>
              <div className="text-[11px] text-slate-500 font-medium">({thaiBahtText(transaction.amount)})</div>
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              ฿{transaction.amount.toLocaleString()}.-
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs">
            <div className="space-y-6">
              <div className="border-b border-dotted border-slate-400 w-36 mx-auto" />
              <div>
                <p className="font-medium">({transaction.recordedBy || 'นางสมศรี มีสุข'})</p>
                <p className="text-[11px] text-slate-500">
                  {transaction.type === 'income' ? 'ผู้รับเงิน / เหรัญญิก' : 'ผู้จ่ายเงิน / เหรัญญิก'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-dotted border-slate-400 w-36 mx-auto" />
              <div>
                <p className="font-medium">({VILLAGE_META.headmanName})</p>
                <p className="text-[11px] text-slate-500">ผู้ใหญ่บ้าน หมู่ที่ 7</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
            เอกสารทางการออกโดยระบบบัญชีการเงินชุมชน หมู่บ้านหาดทรายทอง หมู่ 7 ต.สร้างนางขาว
          </div>
        </div>
      </div>
    </div>
  );
};
