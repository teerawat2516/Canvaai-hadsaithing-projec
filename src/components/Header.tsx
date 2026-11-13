import React from 'react';
import {
  Menu,
  Shield,
  User,
  Sparkles,
  Printer,
  Calendar,
  Volume2
} from 'lucide-react';
import { UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

import { FirebaseStatusIndicator, FirebaseConnectionStatus } from './FirebaseStatusIndicator';

interface HeaderProps {
  currentRole: UserRole;
  onToggleRole: () => void;
  onToggleSidebar: () => void;
  onOpenAiAssistant: () => void;
  activeTabTitle: string;
  firebaseStatus: FirebaseConnectionStatus;
  onRetryFirebase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onToggleRole,
  onToggleSidebar,
  onOpenAiAssistant,
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
    <header className="glass-card border-b border-white/60 px-4 md:px-6 py-3.5 flex items-center justify-between z-20 no-print sticky top-0 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition md:hidden"
          title="เปิด/ปิด เมนู"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
            <span>{activeTabTitle}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hidden sm:inline-block">
              {VILLAGE_META.moo} {VILLAGE_META.subdistrict}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{thaiFormattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Firebase Live Connection Status Pill (Green for connected, Red for disconnected) */}
        <FirebaseStatusIndicator
          status={firebaseStatus}
          projectName="Canvaai-hadsaithing projec"
          compact={true}
          onRetry={onRetryFirebase}
        />
        {/* Gemini AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="relative group px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
          title="เปิดผู้ช่วย AI หมู่บ้านอัจฉริยะ (Gemini AI)"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AI ที่ปรึกษาผู้ใหญ่บ้าน</span>
          <span className="sm:hidden">AI ผู้ช่วย</span>
          <span className="px-1.5 py-0.2 text-[10px] bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 rounded-full font-mono">
            Gemini
          </span>
        </button>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="p-2 rounded-xl text-slate-600 bg-white/70 hover:bg-white hover:text-slate-800 border border-slate-200 shadow-sm transition"
          title="พิมพ์หน้านี้"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Role Switcher */}
        <button
          onClick={onToggleRole}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
            currentRole === 'admin'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
              : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-500'
          }`}
          title="คลิกเพื่อสลับบทบาท ผู้ใหญ่บ้าน/กรรมการ (Admin) หรือ ลูกบ้าน"
        >
          {currentRole === 'admin' ? (
            <>
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ผู้ดูแลระบบ (Admin)</span>
              <span className="sm:hidden">Admin</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ชาวบ้าน / ลูกบ้าน</span>
              <span className="sm:hidden">ลูกบ้าน</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
