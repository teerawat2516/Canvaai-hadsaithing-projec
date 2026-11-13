import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Copy,
  Check,
  Edit3,
  Upload,
  User,
  Shield,
  Award,
  MapPin,
  CheckCircle2,
  X,
  Camera,
  Printer,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { VillageLeader, UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface LeadersViewProps {
  leaders: VillageLeader[];
  currentRole: UserRole;
  onSaveLeader: (leader: VillageLeader) => void;
}

export const LeadersView: React.FC<LeadersViewProps> = ({
  leaders,
  currentRole,
  onSaveLeader,
}) => {
  const [editingLeader, setEditingLeader] = useState<VillageLeader | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Editing Leader
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSoi, setFormSoi] = useState('');
  const [formHouseNo, setFormHouseNo] = useState('');
  const [formResponsibility, setFormResponsibility] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLineId, setFormLineId] = useState('');

  // Segregate Headman and 4 Assistants
  const headman = leaders.find((l) => l.role === 'headman') || leaders[0];
  const assistants = leaders.filter((l) => l.id !== headman?.id);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenEdit = (leader: VillageLeader) => {
    setEditingLeader(leader);
    setFormName(leader.name);
    setFormPosition(leader.positionTitle);
    setFormPhone(leader.phone);
    setFormSoi(leader.soi || '');
    setFormHouseNo(leader.houseNo || '');
    setFormResponsibility(leader.responsibility);
    setFormImageUrl(leader.imageUrl || '');
    setFormLineId(leader.lineId || '');
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormImageUrl(compressedDataUrl);
        } else if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;

    if (!formName.trim() || !formPhone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์ที่ติดต่อได้');
      return;
    }

    const updated: VillageLeader = {
      ...editingLeader,
      name: formName.trim(),
      positionTitle: formPosition.trim(),
      phone: formPhone.trim(),
      soi: formSoi.trim(),
      houseNo: formHouseNo.trim(),
      responsibility: formResponsibility.trim(),
      imageUrl: formImageUrl.trim(),
      lineId: formLineId.trim(),
    };

    onSaveLeader(updated);
    setEditingLeader(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                ทำเนียบผู้นำหมู่บ้านหาดทรายทอง หมู่ที่ 7
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                ผู้ใหญ่บ้านและผู้ช่วยผู้ใหญ่บ้าน 4 คน ฝ่ายปกครองท้องที่ {VILLAGE_META.subdistrict} {VILLAGE_META.district} {VILLAGE_META.province}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>พิมพ์ทำเนียบผู้นำ</span>
          </button>
        </div>
      </div>

      {/* 1. ผู้ใหญ่บ้าน (Featured Hero Section) */}
      {headman && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base md:text-lg text-slate-800">
              ผู้ใหญ่บ้าน (หัวหน้าฝ่ายปกครองท้องที่)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
              ประธานคณะกรรมการหมู่บ้าน (กม.)
            </span>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8 border-2 border-amber-400/50 bg-gradient-to-br from-white via-amber-50/20 to-indigo-50/30 shadow-lg shadow-amber-500/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              {/* Headman Profile Photo */}
              <div className="relative shrink-0">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-slate-300/50 bg-slate-100 flex items-center justify-center">
                  {headman.imageUrl ? (
                    <img
                      src={headman.imageUrl}
                      alt={headman.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-slate-100 to-slate-200">
                      <User className="w-16 h-16 text-slate-300 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-400">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              {/* Headman Details */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs">
                      ผู้นำสูงสุดประจำหมู่บ้าน
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      บ้านเลขที่ {headman.houseNo || '1/1'} ({headman.soi})
                    </span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {headman.name}
                  </h4>
                  <p className="text-sm font-semibold text-indigo-700">
                    {headman.positionTitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 text-xs md:text-sm text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ภารกิจและอำนาจหน้าที่ความรับผิดชอบ:</span>
                  </div>
                  <p className="text-slate-600">{headman.responsibility}</p>
                </div>

                {/* Contact and Actions Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {/* Call Button */}
                  <a
                    href={`tel:${headman.phone.replace(/[^0-9]/g, '')}`}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-600/25 transition flex items-center gap-2 group"
                  >
                    <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>โทรติดต่อ: {headman.phone}</span>
                  </a>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyPhone(headman.id, headman.phone)}
                    className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                    title="คัดลอกเบอร์โทรศัพท์"
                  >
                    {copiedId === headman.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>คัดลอกเบอร์</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button for Admin */}
                  {currentRole === 'admin' && (
                    <button
                      onClick={() => handleOpenEdit(headman)}
                      className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>แก้ไขข้อมูล / รูปภาพ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. ผู้ช่วยผู้ใหญ่บ้าน 4 คน (4 Assistants Section) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base md:text-lg text-slate-800">
              ผู้ช่วยผู้ใหญ่บ้าน 4 คน (คณะทำงานฝ่ายต่างๆ)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            รวม 4 ตำแหน่งปฏิบัติการ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assistants.map((ast, idx) => (
            <div
              key={ast.id}
              className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-lg hover:shadow-indigo-500/5 bg-white/90 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                {/* Assistant Photo */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center">
                    {ast.imageUrl ? (
                      <img
                        src={ast.imageUrl}
                        alt={ast.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                        <User className="w-10 h-10 text-slate-300" />
                        <span className="text-[9px] text-slate-400">ไม่มีรูป</span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                </div>

                {/* Assistant Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                      ผู้ช่วยผู้ใหญ่บ้าน
                    </span>
                    {ast.soi && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {ast.houseNo ? `บ.${ast.houseNo} ` : ''}{ast.soi}
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-base md:text-lg text-slate-900 truncate">
                    {ast.name}
                  </h4>
                  <p className="text-xs font-semibold text-blue-700 leading-tight">
                    {ast.positionTitle}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                    {ast.responsibility}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Phone Dial */}
                  <a
                    href={`tel:${ast.phone.replace(/[^0-9]/g, '')}`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>โทร: {ast.phone}</span>
                  </a>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyPhone(ast.id, ast.phone)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="คัดลอกเบอร์โทรศัพท์"
                  >
                    {copiedId === ast.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Edit Button for Admin */}
                {currentRole === 'admin' && (
                  <button
                    onClick={() => handleOpenEdit(ast)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>แก้ไข</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Edit Modal for Leaders */}
      {editingLeader && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    แก้ไขข้อมูลผู้นำหมู่บ้าน
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingLeader.role === 'headman' ? 'ผู้ใหญ่บ้าน หมู่ที่ 7' : 'ผู้ช่วยผู้ใหญ่บ้าน'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLeader(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              {/* Photo Preview & Upload Controls */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  รูปถ่ายประจำตำแหน่ง (ใส่ URL หรืออัปโหลดไฟล์จากเครื่อง)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-200 bg-slate-100 shrink-0 flex items-center justify-center">
                    {formImageUrl ? (
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition border border-indigo-200">
                        <Upload className="w-3.5 h-3.5" />
                        <span>อัปโหลดรูปภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition border border-rose-200"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="หรือวาง URL รูปภาพ..."
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ตำแหน่ง / ฝ่าย *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    เบอร์โทรติดต่อ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="เช่น 081-987-6543"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500 font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    บ้านเลขที่
                  </label>
                  <input
                    type="text"
                    value={formHouseNo}
                    onChange={(e) => setFormHouseNo(e.target.value)}
                    placeholder="เช่น 1/1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ซอย / คุ้ม
                  </label>
                  <input
                    type="text"
                    value={formSoi}
                    onChange={(e) => setFormSoi(e.target.value)}
                    placeholder="เช่น ซอย 1 หาดทอง"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Responsibility */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ภารกิจหน้าที่ความรับผิดชอบ
                </label>
                <textarea
                  rows={3}
                  value={formResponsibility}
                  onChange={(e) => setFormResponsibility(e.target.value)}
                  placeholder="ระบุหน้าที่ความรับผิดชอบหลัก เช่น ดูแลความสงบเรียบร้อย ไฟส่องสว่าง..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm focus:outline-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLeader(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-xs md:text-sm transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-600/25 transition"
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
