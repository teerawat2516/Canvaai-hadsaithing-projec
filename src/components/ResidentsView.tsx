import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Printer,
  Heart,
  AlertTriangle,
  Home,
  Phone,
  CreditCard,
  CheckCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Resident, UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface ResidentsViewProps {
  residents: Resident[];
  currentRole: UserRole;
  onSaveResident: (resident: Resident) => void;
  onDeleteResident: (id: string) => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  currentRole,
  onSaveResident,
  onDeleteResident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all'); // 'all', 'elderly', 'vulnerable', 'head', 'welfare'
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for modal
  const defaultResidentForm: Resident = {
    id: '',
    idCardNumber: '',
    prefix: 'นาย',
    firstName: '',
    lastName: '',
    birthDate: '1980-01-01',
    age: 46,
    gender: 'ชาย',
    houseNo: '',
    soi: '',
    phoneNumber: '',
    occupation: 'เกษตรกรรม',
    isHeadOfHouse: false,
    isElderly: false,
    isVulnerable: false,
    vulnerabilityNote: '',
    welfareBenefits: [],
    medicalNote: '',
  };
  const [formData, setFormData] = useState<Resident>(defaultResidentForm);

  // Filtered residents
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        r.firstName.toLowerCase().includes(searchLower) ||
        r.lastName.toLowerCase().includes(searchLower) ||
        r.houseNo.toLowerCase().includes(searchLower) ||
        (r.soi && r.soi.toLowerCase().includes(searchLower)) ||
        r.idCardNumber.includes(searchLower) ||
        r.phoneNumber.includes(searchLower);

      // Filter Type
      let matchType = true;
      if (filterType === 'elderly') {
        matchType = r.isElderly || r.age >= 60;
      } else if (filterType === 'vulnerable') {
        matchType = r.isVulnerable;
      } else if (filterType === 'head') {
        matchType = r.isHeadOfHouse;
      } else if (filterType === 'welfare') {
        matchType = r.welfareBenefits && r.welfareBenefits.length > 0;
      }

      return matchSearch && matchType;
    });
  }, [residents, searchTerm, filterType]);

  const handleOpenAdd = () => {
    setFormData({
      ...defaultResidentForm,
      id: `r-${Date.now()}`,
    });
    setEditingResident(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res: Resident) => {
    setFormData({ ...res });
    setEditingResident(res);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.houseNo) {
      alert('กรุณากรอกชื่อ นามสกุล และบ้านเลขที่');
      return;
    }
    // Calculate elderly flag automatically
    const isElder = formData.age >= 60;
    onSaveResident({
      ...formData,
      isElderly: isElder,
    });
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'เลขประจำตัวประชาชน',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'อายุ',
      'เพศ',
      'บ้านเลขที่',
      'ซอย',
      'เบอร์โทร',
      'อาชีพ',
      'หัวหน้าครอบครัว',
      'ผู้สูงอายุ',
      'ผู้ป่วยติดเตียง/พิการ',
      'สิทธิสวัสดิการ',
    ];

    const rows = filteredResidents.map((r) => [
      r.idCardNumber,
      r.prefix,
      r.firstName,
      r.lastName,
      r.age,
      r.gender,
      r.houseNo,
      r.soi,
      r.phoneNumber,
      r.occupation,
      r.isHeadOfHouse ? 'ใช่' : 'ไม่ใช่',
      r.isElderly ? 'ใช่' : 'ไม่ใช่',
      r.isVulnerable ? `ใช่ (${r.vulnerabilityNote || '-'})` : 'ไม่ใช่',
      (r.welfareBenefits || []).join('; '),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `รายชื่อราษฎร_หมู่7_หาดทรายทอง_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>ทะเบียนราษฎร์และข้อมูลประชากร</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredResidents.length} รายการ
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            ระบบจัดเก็บประวัติลูกบ้านหมู่ที่ 7 บ้านหาดทรายทอง เพื่อการดูแลสวัสดิการและชุมชน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5"
            title="ส่งออกรายชื่อเป็นไฟล์ Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>

          {currentRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มข้อมูลลูกบ้าน</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, บ้านเลขที่, เบอร์โทร..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs md:text-sm bg-white/80 border border-slate-200 focus:outline-emerald-500 transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          {/* Type Filters */}
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:bg-white'
            }`}
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => setFilterType('elderly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterType === 'elderly'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:bg-white'
            }`}
          >
            <Heart className="w-3 h-3 text-pink-500" />
            ผู้สูงอายุ (60+)
          </button>

          <button
            onClick={() => setFilterType('vulnerable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              filterType === 'vulnerable'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:bg-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            ผู้ป่วยติดเตียง/พิการ
          </button>

          <button
            onClick={() => setFilterType('head')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === 'head'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white/80 text-slate-600 hover:bg-white'
            }`}
          >
            เจ้าบ้าน
          </button>
        </div>
      </div>

      {/* Residents Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">บ้านเลขที่ / ซอย</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4">อายุ / เพศ</th>
                <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4">สถานะ & สวัสดิการ</th>
                <th className="py-3 px-4">หมายเหตุด้านสุขภาพ (อสม.)</th>
                {currentRole === 'admin' && (
                  <th className="py-3 px-4 text-center">จัดการ</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลราษฎรตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/60 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        {r.houseNo}
                      </div>
                      <div className="text-xs text-slate-500">{r.soi}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>
                          {r.prefix}
                          {r.firstName} {r.lastName}
                        </span>
                        {r.isHeadOfHouse && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-medium">
                            เจ้าบ้าน
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {r.idCardNumber || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">
                        {r.age} ปี
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        ({r.gender})
                      </span>
                      {r.age >= 60 && (
                        <div className="text-[10px] text-pink-600 font-semibold flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 inline fill-pink-500" /> ผู้สูงอายุ
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {r.phoneNumber ? (
                        <a
                          href={`tel:${r.phoneNumber}`}
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-mono text-xs"
                        >
                          <Phone className="w-3 h-3" />
                          {r.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                      <div className="text-[11px] text-slate-500">{r.occupation || '-'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {r.isVulnerable && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            ผู้ป่วยติดเตียง/พิการ
                          </span>
                        )}
                        {r.welfareBenefits && r.welfareBenefits.length > 0 ? (
                          r.welfareBenefits.map((w, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                            >
                              {w}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">ทั่วไป</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {r.medicalNote || r.vulnerabilityNote ? (
                        <span className="text-xs text-slate-600 bg-amber-50/70 p-1 rounded border border-amber-200/50 block">
                          {r.vulnerabilityNote || r.medicalNote}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {currentRole === 'admin' && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบข้อมูล "${r.prefix}${r.firstName} ${r.lastName}" ใช่หรือไม่?`)) {
                                onDeleteResident(r.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="ลบข้อมูล"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{editingResident ? 'แก้ไขข้อมูลราษฎร' : 'เพิ่มข้อมูลราษฎรใหม่ (หมู่ 7)'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={formData.prefix}
                    onChange={(e: any) => setFormData({ ...formData, prefix: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อจริง *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เลขบัตร ปชช.</label>
                  <input
                    type="text"
                    value={formData.idCardNumber}
                    placeholder="x-xxxx-xxxxx-xx-x"
                    onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เพศ</label>
                  <select
                    value={formData.gender}
                    onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">บ้านเลขที่ *</label>
                  <input
                    type="text"
                    required
                    value={formData.houseNo}
                    placeholder="เช่น 12 หรือ 24/2"
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ซอย / คุ้ม (พิมพ์ใส่เอง หรือใส่ภายหลัง)</label>
                  <input
                    type="text"
                    value={formData.soi || ''}
                    placeholder="ระบุซอย / คุ้ม (หรือเว้นไว้ใส่เองภายหลัง)"
                    onChange={(e) => setFormData({ ...formData, soi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    placeholder="08x-xxx-xxxx"
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">อาชีพ</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    placeholder="เช่น ค้าขาย, ทำสวนมะพร้าว"
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHeadOfHouse}
                    onChange={(e) => setFormData({ ...formData, isHeadOfHouse: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">เป็นหัวหน้าครอบครัว / เจ้าบ้าน</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVulnerable}
                    onChange={(e) => setFormData({ ...formData, isVulnerable: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-semibold text-rose-700">ผู้ป่วยติดเตียง / ผู้พิการ (ต้องการการดูแลพิเศษ)</span>
                </label>
              </div>

              {formData.isVulnerable && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">รายละเอียดอาการป่วย / ความช่วยเหลือที่ต้องการ</label>
                  <input
                    type="text"
                    value={formData.vulnerabilityNote || ''}
                    placeholder="เช่น ขาอ่อนแรง เคลื่อนไหวไม่ได้ อสม.ต้องมาทำแผล"
                    onChange={(e) => setFormData({ ...formData, vulnerabilityNote: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">ข้อมูลสุขภาพ / อสม. ดูแล</label>
                <input
                  type="text"
                  value={formData.medicalNote || ''}
                  placeholder="เช่น ความดันโลหิตสูง, เบาหวาน, รับยา รพ.สต."
                  onChange={(e) => setFormData({ ...formData, medicalNote: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/30"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
