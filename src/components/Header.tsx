import React from 'react';
import {
  Menu,
  Shield,
  User,
  Printer,
  Calendar,
  Sparkles,
  FileDown
} from 'lucide-react';
import { UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';
import { FirebaseStatusIndicator, FirebaseConnectionStatus } from './FirebaseStatusIndicator';

interface HeaderProps {
  currentRole: UserRole;
  onToggleRole: () => void;
  onToggleSidebar: () => void;
  onOpenAiAssistant: () => void;
  onOpenExportPrint: () => void;
  activeTabTitle: string;
  firebaseStatus: FirebaseConnectionStatus;
  onRetryFirebase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onToggleRole,
  onToggleSidebar,
  onOpenAiAssistant,
  onOpenExportPrint,
  activeTabTitle,
  firebaseStatus,
  onRetryFirebase,
}) => {
  // Format Thai Buddhist Date
  const today = new Date();
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDay = today.getDate();
  const thaiMonth = thaiMonths[today.getMonth()];
  const thaiYear = today.getFullYear() + 543;
  const thaiFormattedDate = `วัน${['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'][today.getDay()]}ที่ ${thaiDay} ${thaiMonth} พ.ศ. ${thaiYear}`;

  return (
    <header className="glass-card border-b border-slate-200/80 px-4 md:px-7 xl:px-8 py-3.5 md:py-4 flex flex-col gap-2 z-20 no-print sticky top-0 shadow-2xs backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition md:hidden shrink-0"
            title="เปิด/ปิด เมนู"
            aria-label="เปิด/ปิด เมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base xl:text-xl flex items-center gap-2.5 truncate">
              <span className="truncate">{activeTabTitle}</span>
              <span className="text-xs font-medium text-slate-500 hidden xl:inline-block shrink-0">
                · {VILLAGE_META.moo} {VILLAGE_META.subdistrict}
              </span>
            </h2>
            {/* Desktop Date (shown inline on >= xl where full width is available) */}
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{thaiFormattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {/* Firebase Live Connection Status */}
          <FirebaseStatusIndicator
            status={firebaseStatus}
            projectName="Canvaai-hadsaithing projec"
            compact={true}
            onRetry={onRetryFirebase}
          />

          {/* AI Assistant Quick Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition"
            title="เปิด AI ผู้ช่วยหมู่บ้าน"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI ผู้ช่วย</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Export PDF / CSV / Print Mode Button */}
          <button
            onClick={onOpenExportPrint}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/85 hover:bg-white hover:text-slate-900 border border-slate-200 shadow-2xs transition"
            title="ส่งออก PDF / CSV หรือพิมพ์หน้าแอพ"
            aria-label="ส่งออก PDF / CSV หรือพิมพ์หน้าแอพ"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <FileDown className="w-3.5 h-3.5 text-rose-600 sm:hidden" />
            <span className="hidden lg:inline">ส่งออก / พิมพ์</span>
          </button>

          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm border ${
              currentRole === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-500'
            }`}
            title="คลิกเพื่อสลับบทบาท ผู้ใหญ่บ้าน/กรรมการ (Admin) หรือ ลูกบ้าน"
          >
            {currentRole === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">ผู้ดูแลระบบ (Admin)</span>
                <span className="lg:hidden">Admin</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">ชาวบ้าน / ลูกบ้าน</span>
                <span className="lg:hidden">ลูกบ้าน</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full-Width Date Row (never covered or squeezed by Firebase status or buttons) */}
      <div className="flex xl:hidden items-center justify-between gap-2 pt-1.5 border-t border-slate-100/90 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{thaiFormattedDate}</span>
        </div>
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          {VILLAGE_META.moo} {VILLAGE_META.subdistrict}
        </span>
      </div>
    </header>
  );
};
