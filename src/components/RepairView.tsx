import React, { useState } from 'react';
import {
  Wrench,
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
  FileQuestion
} from 'lucide-react';
import {
  RepairTicket,
  RepairCategory,
  RepairStatus,
  RepairPriority,
  UserRole
} from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface RepairViewProps {
  tickets: RepairTicket[];
  currentRole: UserRole;
  onAddTicket: (ticket: RepairTicket) => void;
  onUpdateTicket: (ticket: RepairTicket) => void;
  onOpenAiAdvisor: (prompt: string) => void;
}

export const RepairView: React.FC<RepairViewProps> = ({
  tickets,
  currentRole,
  onAddTicket,
  onUpdateTicket,
  onOpenAiAdvisor,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null);

  // New Ticket form
  const [form, setForm] = useState<{
    category: RepairCategory;
    title: string;
    description: string;
    location: string;
    reporterName: string;
    reporterPhone: string;
    reporterHouseNo: string;
    priority: RepairPriority;
  }>({
    category: 'streetlight',
    title: '',
    description: '',
    location: '',
    reporterName: '',
    reporterPhone: '',
    reporterHouseNo: '',
    priority: 'medium',
  });

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchStatus && matchCat;
  });

  const getCategoryLabel = (cat: RepairCategory) => {
    switch (cat) {
      case 'streetlight':
        return { label: 'ไฟฟ้าส่องสว่าง/ไฟทาง', color: 'bg-amber-100 text-amber-800' };
      case 'water_pipe':
        return { label: 'ท่อประปา/น้ำประปา', color: 'bg-sky-100 text-sky-800' };
      case 'road':
        return { label: 'ถนน/ทางสัญจรชำรุด', color: 'bg-orange-100 text-orange-800' };
      case 'waste':
        return { label: 'ขยะตกค้าง/คูคลอง', color: 'bg-emerald-100 text-emerald-800' };
      case 'animal':
        return { label: 'สัตว์รบกวน/มีพิษ', color: 'bg-red-100 text-red-800' };
      case 'noise':
        return { label: 'เสียงรบกวน/ข้อพิพาท', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'เรื่องร้องเรียนทั่วไป', color: 'bg-slate-100 text-slate-800' };
    }
  };

  const getStatusBadge = (status: RepairStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> รอดำเนินการ
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> กำลังตรวจสอบ
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> กำลังแก้ไข / ประสานงาน
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ดำเนินการเสร็จสิ้น
          </span>
        );
    }
  };

  const getPriorityBadge = (p: RepairPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-600 text-white animate-pulse">ด่วนที่สุด</span>;
      case 'high':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-100 text-rose-700">ด่วน</span>;
      case 'medium':
        return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-700">ปานกลาง</span>;
      case 'low':
        return <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">ปกติ</span>;
    }
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.reporterName) {
      alert('กรุณากรอกหัวข้อเรื่อง สถานที่ และชื่อผู้แจ้ง');
      return;
    }
    const newTicket: RepairTicket = {
      id: `rep-${Date.now()}`,
      ticketCode: `REQ-2569-${(tickets.length + 1).toString().padStart(3, '0')}`,
      category: form.category,
      title: form.title,
      description: form.description,
      location: form.location,
      reporterName: form.reporterName,
      reporterPhone: form.reporterPhone,
      reporterHouseNo: form.reporterHouseNo,
      status: 'pending',
      priority: form.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddTicket(newTicket);
    setIsNewModalOpen(false);
    setForm({
      category: 'streetlight',
      title: '',
      description: '',
      location: '',
      reporterName: '',
      reporterPhone: '',
      reporterHouseNo: '',
      priority: 'medium',
    });
  };

  const handleSaveStatusUpdate = (ticket: RepairTicket) => {
    onUpdateTicket({
      ...ticket,
      updatedAt: new Date().toISOString(),
    });
    setEditingTicket(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-600" />
            <span>แจ้งซ่อมสาธารณูปโภค & เรื่องร้องเรียน</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {tickets.filter((t) => t.status !== 'resolved').length} เรื่องค้างอยู่
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            ช่องทางรับแจ้งไฟทางดับ ท่อประปาแตก ถนนเป็นหลุม ขยะตกค้าง และความเดือดร้อนของชาวบ้าน
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              onOpenAiAdvisor(
                `ช่วยวิเคราะห์รายการแจ้งซ่อมสาธารณะของหมู่บ้านหาดทรายทอง หมู่ 7 ที่ยังค้างอยู่ ${
                  tickets.filter((t) => t.status !== 'resolved').length
                } เรื่อง จัดลำดับความเร่งด่วนตามผลกระทบต่อความปลอดภัยของชาวบ้าน และแนะนำหน่วยงานที่ต้องประสานงาน (การไฟฟ้า, อบต., การประปา)`
              )
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI ช่วยจัดลำดับความเร่งด่วน</span>
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>แจ้งเรื่องใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card p-3 rounded-2xl flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> สถานะ:
          </span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pending', label: 'รอดำเนินการ' },
            { id: 'investigating', label: 'กำลังตรวจสอบ' },
            { id: 'in_progress', label: 'กำลังแก้ไข' },
            { id: 'resolved', label: 'เสร็จสิ้นแล้ว' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedStatus === st.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/70 text-slate-600 hover:bg-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-rose-500"
          >
            <option value="all">ทุกประเภทเรื่อง</option>
            <option value="streetlight">ไฟฟ้าส่องสว่าง</option>
            <option value="water_pipe">ท่อประปา/น้ำรั่ว</option>
            <option value="road">ถนน/ทางสัญจร</option>
            <option value="waste">ขยะ/สิ่งแวดล้อม</option>
            <option value="animal">สัตว์รบกวน/มีพิษ</option>
            <option value="noise">เสียงดัง/ข้อพิพาท</option>
          </select>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTickets.map((t) => {
          const catInfo = getCategoryLabel(t.category);
          return (
            <div
              key={t.id}
              className="glass-card p-5 rounded-2xl space-y-3.5 border border-white/80 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Top Row: Code, Category & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {t.ticketCode}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    {getPriorityBadge(t.priority)}
                  </div>
                  <div>{getStatusBadge(t.status)}</div>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  {t.description}
                </p>

                {/* Location and Reporter Info */}
                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-medium text-slate-800">{t.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> ผู้แจ้ง: {t.reporterName} (บ้าน {t.reporterHouseNo})
                    </span>
                    {t.reporterPhone && (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <Phone className="w-3 h-3" /> {t.reporterPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned or Resolution notes */}
                {t.assignedTo && (
                  <div className="text-xs bg-sky-50 text-sky-900 p-2 rounded-xl border border-sky-100">
                    <span className="font-semibold">ผู้รับผิดชอบ: </span>
                    {t.assignedTo}
                    {t.resolutionNote && (
                      <div className="mt-1 text-slate-700 text-[11px]">
                        <span className="font-semibold text-sky-800">บันทึกการแก้ไข: </span>
                        {t.resolutionNote}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions for Admin */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  แจ้งเมื่อ: {t.createdAt.slice(0, 10)}
                </span>

                {currentRole === 'admin' ? (
                  <button
                    onClick={() => setEditingTicket({ ...t })}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                  >
                    อัปเดตสถานะ / มอบหมายงาน
                  </button>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    {t.status === 'resolved' ? 'แก้ไขเสร็จเรียบร้อย' : 'กำลังดำเนินการตามลำดับ'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Submit New Repair */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" />
                <span>แจ้งซ่อม / แจ้งเรื่องเดือดร้อนในหมู่บ้าน</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3.5 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ประเภทเรื่อง *</label>
                  <select
                    value={form.category}
                    onChange={(e: any) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="streetlight">ไฟฟ้าส่องสว่าง/ไฟทาง</option>
                    <option value="water_pipe">ท่อประปา/น้ำรั่ว</option>
                    <option value="road">ถนน/ทางสัญจรชำรุด</option>
                    <option value="waste">ขยะตกค้าง/คูคลอง</option>
                    <option value="animal">สัตว์รบกวน/มีพิษ</option>
                    <option value="noise">เสียงดัง/ข้อพิพาท</option>
                    <option value="other">เรื่องอื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">ระดับความเร่งด่วน</label>
                  <select
                    value={form.priority}
                    onChange={(e: any) => setForm({ ...form, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="urgent">ด่วนที่สุด (อันตรายต่อชีวิต/ทรัพย์สิน)</option>
                    <option value="high">ด่วน (กระทบการสัญจร/น้ำไม่ไหล)</option>
                    <option value="medium">ปานกลาง (ควรแก้ไขใน 3-5 วัน)</option>
                    <option value="low">ปกติ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">หัวข้อเรื่องที่แจ้ง *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หลอดไฟทางปากซอย 3 ดับ, ท่อน้ำหน้าบ้าน 45 แตก"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">จุดที่เกิดเหตุ / สถานที่อย่างละเอียด *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หน้าเสาไฟต้นที่ 2 ซอย 2 ทรายแก้ว หรือ ตรงข้ามบ้านเลขที่ 12"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">รายละเอียดปัญหา</label>
                <textarea
                  rows={3}
                  placeholder="อธิบายอาการ เช่น ดับมาแล้วกี่วัน หรือมีน้ำไหลนองข้ามผิวถนน..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อผู้แจ้ง *</label>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล"
                    value={form.reporterName}
                    onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">บ้านเลขที่</label>
                  <input
                    type="text"
                    placeholder="เช่น 12"
                    value={form.reporterHouseNo}
                    onChange={(e) => setForm({ ...form, reporterHouseNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={form.reporterPhone}
                    onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md shadow-rose-600/25"
                >
                  ส่งเรื่องแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Update Ticket */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" />
                <span>อัปเดตสถานะและผู้รับผิดชอบ ({editingTicket.ticketCode})</span>
              </h3>
              <button
                onClick={() => setEditingTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">สถานะปัจจุบัน</label>
                <select
                  value={editingTicket.status}
                  onChange={(e: any) =>
                    setEditingTicket({ ...editingTicket, status: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="pending">รอดำเนินการ (Pending)</option>
                  <option value="investigating">กำลังตรวจสอบ (Investigating)</option>
                  <option value="in_progress">กำลังแก้ไข / ประสานงาน (In Progress)</option>
                  <option value="resolved">ดำเนินการเสร็จสิ้น (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ผู้รับผิดชอบ / หน่วยงานที่ประสาน</label>
                <input
                  type="text"
                  value={editingTicket.assignedTo || ''}
                  placeholder="เช่น นายประสิทธิ์ ใจดี (ผู้ช่วยฝ่ายรักษาความสงบ), กองช่าง อบต.สร้างนางขาว"
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, assignedTo: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">บันทึกผลการดำเนินงาน / หมายเหตุ</label>
                <textarea
                  rows={3}
                  value={editingTicket.resolutionNote || ''}
                  placeholder="เช่น ซ่อมเปลี่ยนหลอดไฟเสร็จเรียบร้อยแล้ว หรือ ประสานการประปาเข้าซ่อมแซมช่วงบ่าย"
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, resolutionNote: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ค่าใช้จ่ายถ้ามี (บาท)</label>
                <input
                  type="number"
                  min="0"
                  value={editingTicket.estimatedCost || 0}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, estimatedCost: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatusUpdate(editingTicket)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/25"
                >
                  บันทึกการอัปเดต
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
