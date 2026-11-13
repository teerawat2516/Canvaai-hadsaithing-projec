import React from 'react';
import {
  PieChart,
  Users,
  Wallet,
  Wrench,
  CalendarCheck,
  Megaphone,
  FileText,
  Sparkles,
  Home,
  Shield,
  Award,
  User,
  X,
  MapPin,
  Phone
} from 'lucide-react';
import { UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';
import { FirebaseStatusIndicator, FirebaseConnectionStatus } from './FirebaseStatusIndicator';

export type TabKey =
  | 'dashboard'
  | 'leaders'
  | 'residents'
  | 'finance'
  | 'repair'
  | 'booking'
  | 'news'
  | 'docs'
  | 'ai_advisor';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onToggleRole: () => void;
  pendingRepairsCount: number;
  pendingBookingsCount: number;
  firebaseStatus: FirebaseConnectionStatus;
  onRetryFirebase?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  currentRole,
  onToggleRole,
  pendingRepairsCount,
  pendingBookingsCount,
  firebaseStatus,
  onRetryFirebase,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabKey,
      label: 'Dashboard ภาพรวม',
      icon: PieChart,
      activeColor: 'from-sky-500 to-blue-600',
      iconBg: 'bg-sky-100 text-sky-600',
    },
    {
      id: 'leaders' as TabKey,
      label: 'ผู้นำหมู่บ้าน (5 คน)',
      icon: Award,
      activeColor: 'from-blue-600 to-indigo-700',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'residents' as TabKey,
      label: 'ทะเบียนราษฎร์ (หมู่ 7)',
      icon: Users,
      activeColor: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'finance' as TabKey,
      label: 'บัญชีการเงินชุมชน',
      icon: Wallet,
      activeColor: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'repair' as TabKey,
      label: 'แจ้งซ่อม & เรื่องร้องเรียน',
      icon: Wrench,
      activeColor: 'from-rose-500 to-red-600',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: pendingRepairsCount > 0 ? pendingRepairsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'booking' as TabKey,
      label: 'ยืม-คืนอุปกรณ์ & สถานที่',
      icon: CalendarCheck,
      activeColor: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-100 text-violet-600',
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'news' as TabKey,
      label: 'ข่าวสารประชาสัมพันธ์',
      icon: Megaphone,
      activeColor: 'from-teal-500 to-cyan-600',
      iconBg: 'bg-teal-100 text-teal-600',
    },
    {
      id: 'docs' as TabKey,
      label: 'ออกหนังสือ & รายงาน',
      icon: FileText,
      activeColor: 'from-orange-500 to-amber-600',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'ai_advisor' as TabKey,
      label: 'AI วางแผนกลยุทธ์หมู่บ้าน',
      icon: Sparkles,
      activeColor: 'from-indigo-600 via-purple-600 to-pink-600',
      iconBg: 'bg-indigo-100 text-indigo-600',
      isAi: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 glass-card border-r border-white/60 flex flex-col z-40 transition-transform duration-300 shadow-xl no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Header */}
        <div className="p-4 md:p-5 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/30">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">
                {VILLAGE_META.villageName}
              </h1>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {VILLAGE_META.moo} {VILLAGE_META.subdistrict}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher in Sidebar */}
        <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            โหมดใช้งาน:
          </span>
          <button
            onClick={onToggleRole}
            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs transition flex items-center gap-1.5 ${
              currentRole === 'admin'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {currentRole === 'admin' ? (
              <>
                <Shield className="w-3 h-3" />
                ผู้ดูแลระบบ (Admin)
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                ลูกบ้านทั่วไป
              </>
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? `text-white bg-gradient-to-r ${item.activeColor} shadow-md`
                    : 'text-slate-700 hover:bg-white/90 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-white/25 text-white' : item.iconBg
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isAi && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono bg-emerald-400 text-emerald-950 font-bold uppercase animate-pulse">
                      Gemini
                    </span>
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white text-slate-800' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar Info */}
        <div className="p-3.5 border-t border-slate-200/60 bg-white/50 text-xs text-slate-600 space-y-2.5">
          {/* Firebase Connection Status Indicator with Green / Red Light */}
          <FirebaseStatusIndicator
            status={firebaseStatus}
            projectName="Canvaai-hadsaithing projec"
            onRetry={onRetryFirebase}
          />

          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">ผู้ใหญ่บ้าน:</span>
              <span className="text-slate-700 font-medium">{VILLAGE_META.headmanName}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{VILLAGE_META.headmanPhone}</span>
            </div>
            <div className="text-[10px] text-center text-slate-400 pt-1 border-t border-slate-200/40">
              Firebase Firestore Sync • Canvaai-hadsaithing
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
