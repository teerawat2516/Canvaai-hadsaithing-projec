import React, { useState, useRef } from 'react';
import {
  X,
  FileDown,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  FileText
} from 'lucide-react';
import { VILLAGE_META } from '../data/initialData';
import type { TabKey } from './Sidebar';
import {
  AppExportData,
  exportTabCsv,
  downloadElementAsPdf,
} from '../services/exportService';
import { notifyToast, notifyAlert } from '../services/notify';

interface ExportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabKey;
  data: AppExportData;
}

const TAB_LABELS: Record<TabKey, string> = {
  dashboard: 'ภาพรวมหมู่บ้าน',
  leaders: 'ทำเนียบผู้นำหมู่บ้าน',
  residents: 'ทะเบียนราษฎร์',
  finance: 'บัญชีการเงินชุมชน',
  repair: 'แจ้งซ่อม & ร้องเรียน',
  booking: 'ยืม-คืนอุปกรณ์ & สถานที่',
  news: 'ข่าวสารประชาสัมพันธ์',
  docs: 'สรุปข้อมูลเอกสาร',
};

export const ExportPrintModal: React.FC<ExportPrintModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  data,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabKey>(activeTab);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTab(activeTab);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const today = new Date();
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const thaiDate = `${today.getDate()} ${thaiMonths[today.getMonth()]} พ.ศ. ${today.getFullYear() + 543}`;
  const dateStamp = today.toISOString().slice(0, 10);

  const totalIncome = data.fundTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.fundTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const fundBalance = totalIncome - totalExpense;

  const handleDownloadCsv = () => {
    const filename = exportTabCsv(selectedTab, data);
    notifyToast(`ดาวน์โหลด ${filename} เรียบร้อยแล้ว`, 'success');
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const filename = `รายงาน_${TAB_LABELS[selectedTab]}_หมู่7_${dateStamp}.pdf`;
      await downloadElementAsPdf(reportRef.current, filename);
      notifyToast('ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      notifyAlert(
        'ไม่สามารถสร้างไฟล์ PDF ได้',
        err?.message || 'กรุณาลองกดปุ่ม "พิมพ์หน้าแอพ" แล้วเลือก บันทึกเป็น PDF แทนครับ',
        'error'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintAppPage = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 220);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="glass-card bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden border border-slate-200/80">
        {/* Modal Header */}
        <div className="px-5 py-4 md:px-7 md:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-800 via-slate-800 to-emerald-800 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base md:text-lg truncate">
                โหมดส่งออกข้อมูล (PDF / CSV) และพิมพ์หน้าแอพ
              </h3>
              <p className="text-xs text-slate-200/90 truncate">
                เลือกหมวดข้อมูลที่ต้องการดาวน์โหลดเอกสาร หรือสั่งพิมพ์หน้าปัจจุบัน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Dataset Bar */}
        <div className="px-4 py-3.5 md:px-7 bg-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="export-tab-select" className="text-xs font-bold text-slate-600">
              หมวดรายงาน:
            </label>
            <select
              id="export-tab-select"
              value={selectedTab}
              onChange={(e) => setSelectedTab(e.target.value as TabKey)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-emerald-500"
            >
              {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
                <option key={key} value={key}>
                  {TAB_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white shadow-sm transition flex items-center gap-1.5"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              <span>{isGeneratingPdf ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ดาวน์โหลด CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrintAppPage}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์หน้าแอพ</span>
            </button>
          </div>
        </div>

        {/* Clean A4 Report Preview (captured cleanly into PDF) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-200/70">
          <div
            ref={reportRef}
            className="bg-white mx-auto max-w-[794px] p-6 sm:p-9 rounded-2xl shadow-md border border-slate-200 text-slate-900 font-sarabun space-y-6"
          >
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  เอกสารรายงานข้อมูลหมู่บ้านอย่างเป็นทางการ
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {VILLAGE_META.villageName} {VILLAGE_META.moo}
                </h1>
                <p className="text-xs text-slate-600">
                  {VILLAGE_META.subdistrict} {VILLAGE_META.district} {VILLAGE_META.province} {VILLAGE_META.zipCode}
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-800 text-sm">{TAB_LABELS[selectedTab]}</div>
                <div>วันที่ออกรายงาน: {thaiDate}</div>
              </div>
            </div>

            {/* Dynamic Report Content per Tab */}
            {(selectedTab === 'dashboard' || selectedTab === 'docs') && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500">ประชากรทั้งหมด</div>
                    <div className="text-lg font-bold text-slate-900">{data.residents.length} คน</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500">ครัวเรือน</div>
                    <div className="text-lg font-bold text-slate-900">
                      {new Set(data.residents.map((r) => r.houseNo)).size} หลัง
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500">เงินกองทุนคงเหลือ</div>
                    <div className="text-lg font-bold text-emerald-700">
                      ฿{fundBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500">แจ้งซ่อมค้างอยู่</div>
                    <div className="text-lg font-bold text-rose-700">
                      {data.repairTickets.filter((t) => t.status !== 'resolved').length} เรื่อง
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-800 mb-2">สรุปสถานะการดำเนินงานล่าสุด</h4>
                  <table className="w-full text-xs border-collapse border border-slate-300">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-300 p-2 text-left">หมวดงาน</th>
                        <th className="border border-slate-300 p-2 text-right">จำนวน / มูลค่า</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">ผู้สูงอายุ (60 ปีขึ้นไป)</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">
                          {data.residents.filter((r) => r.isElderly || r.age >= 60).length} คน
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">ผู้ป่วยติดเตียง / กลุ่มเปราะบาง</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">
                          {data.residents.filter((r) => r.isVulnerable).length} คน
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">รายรับกองทุนสะสม</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold text-emerald-700">
                          +฿{totalIncome.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">รายจ่ายกองทุนสะสม</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold text-rose-700">
                          -฿{totalExpense.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">รายการยืมอุปกรณ์รออนุมัติ</td>
                        <td className="border border-slate-300 p-2 text-right font-semibold">
                          {data.bookings.filter((b) => b.status === 'pending').length} รายการ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'leaders' && (
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-left">ชื่อ - นามสกุล</th>
                    <th className="border border-slate-300 p-2 text-left">ตำแหน่ง</th>
                    <th className="border border-slate-300 p-2 text-left">เบอร์ติดต่อ</th>
                    <th className="border border-slate-300 p-2 text-left">ที่อยู่ / หน้าที่รับผิดชอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaders.map((l) => (
                    <tr key={l.id}>
                      <td className="border border-slate-300 p-2 font-bold">{l.name}</td>
                      <td className="border border-slate-300 p-2">{l.positionTitle}</td>
                      <td className="border border-slate-300 p-2 font-mono">{l.phone}</td>
                      <td className="border border-slate-300 p-2">
                        <div>บ้าน {l.houseNo || '-'} {l.soi || ''}</div>
                        <div className="text-slate-600">{l.responsibility}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTab === 'residents' && (
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-left">บ้านเลขที่</th>
                    <th className="border border-slate-300 p-2 text-left">ชื่อ - นามสกุล</th>
                    <th className="border border-slate-300 p-2 text-center">อายุ</th>
                    <th className="border border-slate-300 p-2 text-left">เบอร์โทร</th>
                    <th className="border border-slate-300 p-2 text-left">สวัสดิการ / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.residents.map((r) => (
                    <tr key={r.id}>
                      <td className="border border-slate-300 p-2 font-semibold">
                        {r.houseNo} ({r.soi})
                      </td>
                      <td className="border border-slate-300 p-2">
                        {r.prefix}{r.firstName} {r.lastName}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">{r.age} ปี</td>
                      <td className="border border-slate-300 p-2 font-mono">{r.phoneNumber || '-'}</td>
                      <td className="border border-slate-300 p-2">
                        {[
                          r.isVulnerable ? 'เปราะบาง' : null,
                          r.age >= 60 ? 'ผู้สูงอายุ' : null,
                          ...(r.welfareBenefits || []),
                        ]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTab === 'finance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 bg-emerald-50/50">
                    <div className="text-slate-600">รายรับรวม</div>
                    <div className="text-base font-bold text-emerald-700">+฿{totalIncome.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-rose-50/50">
                    <div className="text-slate-600">รายจ่ายรวม</div>
                    <div className="text-base font-bold text-rose-700">-฿{totalExpense.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-slate-600">ยอดคงเหลือสุทธิ</div>
                    <div className="text-base font-bold text-slate-900">฿{fundBalance.toLocaleString()}</div>
                  </div>
                </div>

                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 p-2 text-left">วันที่</th>
                      <th className="border border-slate-300 p-2 text-left">หมวดหมู่</th>
                      <th className="border border-slate-300 p-2 text-left">รายละเอียด</th>
                      <th className="border border-slate-300 p-2 text-right">จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fundTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="border border-slate-300 p-2 whitespace-nowrap">{t.date}</td>
                        <td className="border border-slate-300 p-2">{t.category}</td>
                        <td className="border border-slate-300 p-2">{t.description}</td>
                        <td
                          className={`border border-slate-300 p-2 text-right font-bold whitespace-nowrap ${
                            t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTab === 'repair' && (
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-left">รหัส</th>
                    <th className="border border-slate-300 p-2 text-left">เรื่อง / สถานที่</th>
                    <th className="border border-slate-300 p-2 text-left">ผู้แจ้ง</th>
                    <th className="border border-slate-300 p-2 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.repairTickets.map((t) => (
                    <tr key={t.id}>
                      <td className="border border-slate-300 p-2 font-mono">{t.ticketCode}</td>
                      <td className="border border-slate-300 p-2">
                        <div className="font-bold">{t.title}</div>
                        <div className="text-slate-600">{t.location}</div>
                      </td>
                      <td className="border border-slate-300 p-2">{t.reporterName}</td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">
                        {t.status === 'resolved'
                          ? 'เสร็จสิ้น'
                          : t.status === 'in_progress'
                          ? 'กำลังแก้ไข'
                          : t.status === 'investigating'
                          ? 'กำลังตรวจสอบ'
                          : 'รอดำเนินการ'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTab === 'booking' && (
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-left">รหัส</th>
                    <th className="border border-slate-300 p-2 text-left">รายการที่ยืม / จอง</th>
                    <th className="border border-slate-300 p-2 text-left">ผู้ยืม</th>
                    <th className="border border-slate-300 p-2 text-left">ช่วงวันที่</th>
                    <th className="border border-slate-300 p-2 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="border border-slate-300 p-2 font-mono">{b.bookingCode}</td>
                      <td className="border border-slate-300 p-2 font-semibold">
                        {b.itemName} (จำนวน {b.quantity})
                      </td>
                      <td className="border border-slate-300 p-2">
                        {b.applicantName} (บ้าน {b.applicantHouseNo})
                      </td>
                      <td className="border border-slate-300 p-2 whitespace-nowrap">
                        {b.startDate} - {b.endDate}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">
                        {b.status === 'returned'
                          ? 'คืนแล้ว'
                          : b.status === 'approved' || b.status === 'in_use'
                          ? 'กำลังยืม'
                          : b.status === 'pending'
                          ? 'รออนุมัติ'
                          : 'ยกเลิก'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedTab === 'news' && (
              <div className="space-y-3">
                {data.announcements.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-xl border border-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{a.date} · {a.author}</span>
                      {a.important && (
                        <span className="font-bold text-rose-700">[ประกาศด่วน]</span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900">{a.title}</div>
                    <p className="text-xs text-slate-700 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Report Footer Signature */}
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
              <div>
                <div>ออกโดยระบบบริหารจัดการหมู่บ้านหาดทรายทอง หมู่ที่ 7</div>
                <div>ตำบลสร้างนางขาว อำเภอโพนพิสัย จังหวัดหนองคาย</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-40 border-b border-dotted border-slate-400 mx-auto" />
                <div>
                  <div className="font-semibold text-slate-800">({VILLAGE_META.headmanName})</div>
                  <div>ผู้ใหญ่บ้าน หมู่ที่ 7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
