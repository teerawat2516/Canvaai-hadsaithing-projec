import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  Clock,
  RotateCcw,
  Check,
  X,
  PackageCheck,
  Home,
  User,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { FacilityBooking, UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface BookingViewProps {
  bookings: FacilityBooking[];
  currentRole: UserRole;
  onAddBooking: (booking: FacilityBooking) => void;
  onUpdateBookingStatus: (id: string, status: FacilityBooking['status']) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  bookings,
  currentRole,
  onAddBooking,
  onUpdateBookingStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    applicantName: '',
    applicantHouseNo: '',
    applicantPhone: '',
    itemType: 'equipment' as 'equipment' | 'facility',
    itemName: VILLAGE_META.availableEquipment[1].name,
    quantity: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    purpose: '',
    depositAmount: 200,
    note: '',
  });

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const getStatusBadge = (status: FacilityBooking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> รออนุมัติ
          </span>
        );
      case 'approved':
      case 'in_use':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
            <PackageCheck className="w-3 h-3" /> ยืมใช้งานอยู่
          </span>
        );
      case 'returned':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> คืนเรียบร้อย
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            ยกเลิก
          </span>
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.applicantName || !form.applicantHouseNo || !form.purpose) {
      alert('กรุณากรอกข้อมูลผู้ยืมและวัตถุประสงค์');
      return;
    }
    const newBooking: FacilityBooking = {
      id: `bk-${Date.now()}`,
      bookingCode: `BK-2569-${(bookings.length + 1).toString().padStart(3, '0')}`,
      applicantName: form.applicantName,
      applicantHouseNo: form.applicantHouseNo,
      applicantPhone: form.applicantPhone,
      itemType: form.itemType,
      itemName: form.itemName,
      quantity: Number(form.quantity),
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose,
      status: currentRole === 'admin' ? 'approved' : 'pending',
      depositAmount: Number(form.depositAmount),
      note: form.note,
    };
    onAddBooking(newBooking);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-violet-600" />
            <span>ยืม-คืนอุปกรณ์ส่วนกลาง & จองสถานที่</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            ระบบจองศาลาประชาคม ยืมเต็นท์ โต๊ะ เก้าอี้ เครื่องเสียง สำหรับงานบุญ งานประเพณีของชาวบ้าน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-600/25 transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นคำขอยืมอุปกรณ์/สถานที่</span>
        </button>
      </div>

      {/* Equipment Catalog Bar */}
      <div className="glass-card p-5 rounded-2xl space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-violet-600" />
          <span>รายการทรัพย์สินและอุปกรณ์ส่วนกลาง (หมู่ 7)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {VILLAGE_META.availableEquipment.map((eq, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs hover:bg-white transition"
            >
              <div className="font-semibold text-xs text-slate-800 truncate">{eq.name}</div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-slate-500">พร้อมใช้งาน:</span>
                <span className="font-bold text-violet-700">
                  {eq.available} / {eq.total} {eq.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Bookings Table */}
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <span className="text-xs font-bold text-slate-500">สถานะคำขอ:</span>
          {['all', 'pending', 'approved', 'returned'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                filterStatus === st
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white/70 text-slate-600 hover:bg-white'
              }`}
            >
              {st === 'all'
                ? 'ทั้งหมด'
                : st === 'pending'
                ? 'รออนุมัติ'
                : st === 'approved'
                ? 'กำลังยืมอยู่'
                : 'คืนเรียบร้อย'}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-white/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-100/90 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">รหัสจอง</th>
                  <th className="py-3 px-4">ผู้ขอยืม</th>
                  <th className="py-3 px-4">รายการอุปกรณ์ / สถานที่</th>
                  <th className="py-3 px-4">วันที่ยืม - คืน</th>
                  <th className="py-3 px-4">วัตถุประสงค์งาน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.applicantName}</div>
                      <div className="text-slate-500 text-xs">
                        บ้านเลขที่ {b.applicantHouseNo} ({b.applicantPhone})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-violet-950">{b.itemName}</div>
                      {b.depositAmount > 0 && (
                        <div className="text-[11px] text-slate-400">
                          มัดจำ: ฿{b.depositAmount.toLocaleString()} บาท
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      <div>เริ่ม: {b.startDate}</div>
                      <div>คืน: {b.endDate}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{b.purpose}</td>
                    <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {currentRole === 'admin' && b.status === 'pending' && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            อนุมัติ
                          </button>
                        )}
                        {currentRole === 'admin' && (b.status === 'approved' || b.status === 'in_use') && (
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'returned')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> รับคืน
                          </button>
                        )}
                        {b.status === 'returned' && (
                          <span className="text-xs text-emerald-600 font-semibold">ส่งคืนแล้ว</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add Booking */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-violet-600" />
                <span>คำขอยืมอุปกรณ์หรือสถานที่ส่วนกลาง</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อผู้ขอยืม *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายทองคำ บุญมี"
                    value={form.applicantName}
                    onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">บ้านเลขที่ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 12 หรือ 35"
                    value={form.applicantHouseNo}
                    onChange={(e) => setForm({ ...form, applicantHouseNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                <input
                  type="tel"
                  placeholder="08x-xxx-xxxx"
                  value={form.applicantPhone}
                  onChange={(e) => setForm({ ...form, applicantPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">อุปกรณ์หรือสถานที่ที่ต้องการยืม *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เต็นท์ผ้าใบ 2 หลัง + โต๊ะ 5 ตัว + เก้าอี้ 50 ตัว"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">วันที่เริ่มยืม *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">กำหนดส่งคืน *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">วัตถุประสงค์การใช้งาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น งานทำบุญขึ้นบ้านใหม่, งานบวช, งานศพ"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-900 border border-violet-200">
                <span className="font-bold">กติกาการยืม: </span>
                โปรดดูแลรักษาอุปกรณ์ให้อยู่ในสภาพสมบูรณ์ ทำความสะอาดก่อนส่งคืน และแจ้งผู้ดูแลอุปกรณ์ (นายบุญส่ง ทรัพย์เจริญ)
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 shadow-md shadow-violet-600/25"
                >
                  ยื่นคำขอ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
