import React from 'react';
import {
  Users,
  Home,
  HeartHandshake,
  Wallet,
  Wrench,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Resident,
  FundTransaction,
  RepairTicket,
  FacilityBooking,
  VillageAnnouncement
} from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface DashboardViewProps {
  residents: Resident[];
  fundTransactions: FundTransaction[];
  repairTickets: RepairTicket[];
  bookings: FacilityBooking[];
  announcements: VillageAnnouncement[];
  onNavigateTab: (tab: any) => void;
  onOpenAiAssistant: (initialPrompt?: string) => void;
  onNewRepairClick: () => void;
  onNewPaymentClick: () => void;
  onNewBookingClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  residents,
  fundTransactions,
  repairTickets,
  bookings,
  announcements,
  onNavigateTab,
  onOpenAiAssistant,
  onNewRepairClick,
  onNewPaymentClick,
  onNewBookingClick,
}) => {
  // Calculations
  const totalResidents = residents.length;
  const maleCount = residents.filter((r) => r.gender === 'ชาย').length;
  const femaleCount = residents.filter((r) => r.gender === 'หญิง').length;

  const uniqueHouseNos = Array.from(new Set(residents.map((r) => r.houseNo)));
  const totalHouseholds = uniqueHouseNos.length;

  const elderlyCount = residents.filter((r) => r.isElderly || r.age >= 60).length;
  const vulnerableCount = residents.filter((r) => r.isVulnerable).length;

  // Finance calculations
  const totalIncome = fundTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = fundTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const fundBalance = totalIncome - totalExpense;

  // Tickets
  const pendingRepairs = repairTickets.filter((t) => t.status !== 'resolved');
  const urgentRepairs = repairTickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved');
  const activeBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'in_use');

  // Dynamic Soi distribution (extracted from actual resident records without hardcoding)
  const uniqueSois = Array.from(
    new Set(residents.map((r) => (r.soi && r.soi.trim() ? r.soi.trim() : 'ไม่ระบุซอย/คุ้ม')))
  );

  const dynamicSoiStats = uniqueSois.map((soi) => {
    const count = residents.filter((r) => {
      const rSoi = r.soi && r.soi.trim() ? r.soi.trim() : 'ไม่ระบุซอย/คุ้ม';
      return rSoi === soi;
    }).length;
    return { soi, count };
  }).sort((a, b) => b.count - a.count);

  // Recent transactions
  const recentTransactions = fundTransactions.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              ระบบบริหารจัดการอัจฉริยะ • อบต.สร้างนางขาว
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {VILLAGE_META.villageName} {VILLAGE_META.moo}
            </h1>
            <p className="text-sm md:text-base text-emerald-100 max-w-2xl leading-relaxed">
              ยินดีต้อนรับสู่ระบบข้อมูลกลางเพื่อการพัฒนาชุมชน ตรวจสอบทะเบียนราษฎร์ บัญชีการเงินชุมชน
              แจ้งซ่อมและร้องเรียน ยืมของส่วนกลาง และปรึกษาแผนพัฒนาหมู่บ้านด้วย Gemini 4 Argon
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                onOpenAiAssistant(
                  'ช่วยสรุปสถานะภาพรวมของหมู่บ้านหาดทรายทอง หมู่ 7 และวิเคราะห์ 3 ปัญหาเร่งด่วนที่ผู้ใหญ่บ้านควรดำเนินการในสัปดาห์นี้'
                )
              }
              className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:bg-emerald-50 transition flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-violet-600 group-hover:rotate-12 transition-transform" />
              <span>AI วิเคราะห์ภาพรวมด่วน</span>
              <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-mono">
                Argon
              </span>
            </button>
            <button
              onClick={onNewRepairClick}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/50 backdrop-blur-md text-white font-semibold text-sm border border-white/30 transition flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-emerald-200" />
              <span>แจ้งซ่อมด่วน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Warning Banner if there are urgent repairs */}
      {urgentRepairs.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-amber-500/10 border border-rose-300/60 backdrop-blur-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-bold text-rose-900">มีเรื่องแจ้งซ่อมเร่งด่วน ({urgentRepairs.length} เรื่อง): </span>
            <span className="text-rose-800">{urgentRepairs[0].title}</span>
            <span className="text-xs text-rose-600 ml-2">({urgentRepairs[0].location})</span>
          </div>
          <button
            onClick={() => onNavigateTab('repair')}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0"
          >
            ดูรายละเอียด
          </button>
        </div>
      )}

      {/* Primary Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Residents Stat */}
        <div
          onClick={() => onNavigateTab('residents')}
          className="glass-card p-5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ประชากรทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalResidents} <span className="text-xs font-normal text-slate-500">คน</span></div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>ชาย {maleCount} คน</span>
            <span>หญิง {femaleCount} คน</span>
          </div>
        </div>

        {/* Households Stat */}
        <div
          onClick={() => onNavigateTab('residents')}
          className="glass-card p-5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer border-l-4 border-l-sky-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">จำนวนครัวเรือน</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalHouseholds} <span className="text-xs font-normal text-slate-500">หลังคาเรือน</span></div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            {VILLAGE_META.subdistrict} {VILLAGE_META.district}
          </div>
        </div>

        {/* Elderly & Vulnerable Care */}
        <div
          onClick={() => onNavigateTab('residents')}
          className="glass-card p-5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer border-l-4 border-l-pink-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ผู้สูงอายุ / เปราะบาง</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{elderlyCount} <span className="text-xs font-normal text-slate-500">คน</span></div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>อายุ 60 ปีขึ้นไป</span>
            <span className="text-pink-600 font-semibold">ติดเตียง {vulnerableCount} คน</span>
          </div>
        </div>

        {/* Fund Balance */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="glass-card p-5 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer border-l-4 border-l-amber-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">เงินกองทุนหมู่บ้าน</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            ฿{fundBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span className="text-emerald-600">+฿{totalIncome.toLocaleString()}</span>
            <span className="text-rose-500">-฿{totalExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Financial Ledger & Community Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Village Fund Financial Overview Card (Replaces garbage fee card) */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">บัญชีการเงินและกองทุนหมู่บ้าน</h3>
                <p className="text-xs text-slate-500">สรุปรายรับ-รายจ่ายชุมชน</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition"
            >
              + บันทึกรายการ
            </button>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">รายรับสะสม:</span>
                <span className="font-bold text-emerald-600">+฿{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">รายจ่ายสะสม:</span>
                <span className="font-bold text-rose-600">-฿{totalExpense.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60 flex justify-between text-xs font-bold">
                <span className="text-slate-800">ยอดคงเหลือสุทธิ:</span>
                <span className="text-amber-700">฿{fundBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span>รายการล่าสุด:</span>
            <span className="font-medium text-slate-700 truncate max-w-[170px]">
              {recentTransactions[0]?.description || 'ไม่มีรายการ'}
            </span>
          </div>
        </div>

        {/* Repair & Grievance tracker card */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">สถานะแจ้งซ่อมและเรื่องร้องเรียน</h3>
                <p className="text-xs text-slate-500">ติดตามความคืบหน้ารายวัน</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('repair')}
              className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              ดูทั้งหมด <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
              <div className="text-xl font-bold text-amber-700">{pendingRepairs.length}</div>
              <div className="text-xs text-amber-800 font-medium">รอดำเนินการ / กำลังแก้ไข</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div className="text-xl font-bold text-emerald-700">
                {repairTickets.filter((t) => t.status === 'resolved').length}
              </div>
              <div className="text-xs text-emerald-800 font-medium">แก้ไขเสร็จสิ้นแล้ว</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>มีเรื่องแจ้งเข้ามาล่าสุด {repairTickets[0]?.createdAt.slice(0, 10) || 'วันนี้'}</span>
          </div>
        </div>

        {/* Equipment & Village Hall Bookings card */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">ยืม-คืนอุปกรณ์ & สถานที่</h3>
                <p className="text-xs text-slate-500">ศาลาประชาคม, เต็นท์, โต๊ะเก้าอี้</p>
              </div>
            </div>
            <button
              onClick={onNewBookingClick}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              + ขอยืมของ
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-violet-900">กำลังยืมใช้งานสัปดาห์นี้:</span>
              <span className="font-bold text-violet-700">{activeBookings.length} รายการ</span>
            </div>
            {activeBookings.length > 0 ? (
              <p className="text-xs text-slate-600 truncate">
                {activeBookings[0].applicantName} ({activeBookings[0].itemName})
              </p>
            ) : (
              <p className="text-xs text-slate-500">ไม่มีรายการยืมค้างในขณะนี้</p>
            )}
          </div>

          <div className="flex justify-between text-xs text-slate-600 pt-1">
            <span>เต็นท์ผ้าใบว่าง: 4/6 หลัง</span>
            <span>เก้าอี้ว่าง: 190/250 ตัว</span>
          </div>
        </div>
      </div>

      {/* Dynamic Community Area Distribution & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Soi / Area Distribution */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base">การกระจายตัวของประชากรตามซอย / คุ้ม (หมู่ 7)</h3>
              <p className="text-xs text-slate-500">ข้อมูลจากทะเบียนราษฎร์ (กำหนดชื่อซอย/คุ้มเองได้อย่างอิสระ)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {dynamicSoiStats.length} พื้นที่
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {dynamicSoiStats.map((item, idx) => {
              const maxCount = Math.max(...dynamicSoiStats.map((s) => s.count), 1);
              const percent = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.soi}</span>
                    <span className="text-slate-500 font-semibold">{item.count} คน</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Emergency Contacts */}
        <div className="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">เครื่องมือช่วยด่วน</h3>
            </div>
            <p className="text-xs text-slate-600">
              ทางลัดอำนวยความสะดวกสำหรับผู้ใหญ่บ้านและคณะกรรมการ
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigateTab('finance')}
                className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 text-amber-900 text-xs font-semibold flex items-center justify-between transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  เปิดสมุดบัญชีรายรับ-รายจ่าย
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('news')}
                className="w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200/60 text-teal-800 text-xs font-semibold flex items-center justify-between transition text-left"
              >
                <span className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-teal-600" />
                  ร่างประกาศเสียงตามสาย (หอกระจายข่าว)
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('docs')}
                className="w-full p-3 rounded-xl bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 text-orange-800 text-xs font-semibold flex items-center justify-between transition text-left"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  ออกหนังสือรับรองถิ่นที่อยู่ / ประพฤติ
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              เบอร์ติดต่อฉุกเฉินหมู่บ้าน
            </div>
            <div>ผู้ใหญ่บ้าน: {VILLAGE_META.headmanPhone}</div>
            <div>รพ.สต.สร้างนางขาว: 042-456-789</div>
            <div>รถกู้ชีพ/ดับเพลิง อบต.: 1669 / 042-456-111</div>
          </div>
        </div>
      </div>
    </div>
  );
};
