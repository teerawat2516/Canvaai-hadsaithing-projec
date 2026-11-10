import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Volume2,
  Copy,
  Check,
  Calendar,
  Sparkles,
  AlertCircle,
  Heart,
  Share2,
  X
} from 'lucide-react';
import { VillageAnnouncement, UserRole } from '../types/village';
import { draftOfficialDocument } from '../services/api';

interface NewsViewProps {
  announcements: VillageAnnouncement[];
  currentRole: UserRole;
  onAddAnnouncement: (announcement: VillageAnnouncement) => void;
  onOpenAiAssistant: (prompt: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  announcements,
  currentRole,
  onAddAnnouncement,
  onOpenAiAssistant,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    broadcastScript: '',
    category: 'general' as VillageAnnouncement['category'],
    author: 'นายอำนาจ พันนาขา (ผู้ใหญ่บ้าน)',
    important: false,
  });

  const [isDraftingAi, setIsDraftingAi] = useState(false);

  const filtered = announcements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDraftWithAi = async () => {
    if (!form.title) {
      alert('กรุณากรอกหัวข้อเรื่องที่จะให้ AI ช่วยร่างบทประกาศ');
      return;
    }
    setIsDraftingAi(true);
    try {
      const res = await draftOfficialDocument({
        docType: 'บทประกาศเสียงตามสายหอกระจายข่าว',
        topic: form.title,
        recipient: 'พี่น้องชาวบ้านหมู่ 7 หาดทรายทอง',
        keyDetails: form.content || 'แจ้งข่าวสารทั่วไปในหมู่บ้าน',
      });
      if (res.status === 'success' && res.content) {
        setForm((prev) => ({
          ...prev,
          broadcastScript: res.content,
        }));
      } else {
        alert(res.error || 'เกิดข้อผิดพลาดในการร่างบท');
      }
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('กรุณากรอกหัวข้อและเนื้อหาประกาศ');
      return;
    }
    const newAnn: VillageAnnouncement = {
      id: `ann-${Date.now()}`,
      title: form.title,
      content: form.content,
      broadcastScript: form.broadcastScript || form.content,
      category: form.category,
      date: new Date().toISOString().slice(0, 10),
      author: form.author,
      important: form.important,
    };
    onAddAnnouncement(newAnn);
    setIsModalOpen(false);
    setForm({
      title: '',
      content: '',
      broadcastScript: '',
      category: 'general',
      author: 'นายอำนาจ พันนาขา (ผู้ใหญ่บ้าน)',
      important: false,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-teal-600" />
            <span>ข่าวสารประชาสัมพันธ์ & หอกระจายข่าว</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            ประกาศแจ้งเตือน นัดหมายประชุมหมู่บ้าน บริการสาธารณสุข และบทพูดเสียงตามสายประจำวัน
          </p>
        </div>

        <div className="flex gap-2">
          {currentRole === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างประกาศใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs font-bold text-slate-500">หมวดหมู่:</span>
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'urgent', label: 'ด่วน / สำคัญ' },
          { id: 'health', label: 'สาธารณสุข / อสม.' },
          { id: 'activity', label: 'กิจกรรมชุมชน' },
          { id: 'general', label: 'ทั่วไป' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              selectedCategory === c.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white/70 text-slate-600 hover:bg-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`glass-card p-6 rounded-3xl border transition space-y-4 ${
              item.important ? 'border-amber-400 bg-amber-50/20 shadow-md' : 'border-white/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {item.important && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                    ประกาศด่วน
                  </span>
                )}
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {item.date}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-medium">{item.author}</span>
              </div>

              {item.broadcastScript && (
                <button
                  onClick={() => handleCopyScript(item.id, item.broadcastScript!)}
                  className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5"
                  title="คัดลอกบทพูดนี้ไปใช้ออกอากาศเสียงตามสาย หรือโพสต์ลง LINE กลุ่มหมู่บ้าน"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>คัดลอกบทเสียงตามสาย</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base md:text-lg">{item.title}</h3>
              <p className="text-slate-700 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </div>

            {/* Broadcast Script Box */}
            {item.broadcastScript && (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  <span>บทพูดสำหรับหอกระจายข่าว (เสียงตามสายประจำหมู่บ้าน)</span>
                </div>
                <p className="text-xs text-teal-950 font-sarabun italic leading-relaxed pl-5">
                  "{item.broadcastScript}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: New Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-teal-600" />
                <span>สร้างประกาศใหม่และบทเสียงตามสาย</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">หัวข้อประกาศ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นัดประชุมประจำเดือน หรือ ฉีดวัคซีนป้องกันพิษสุนัขบ้า"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={form.category}
                    onChange={(e: any) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="urgent">ด่วน / สำคัญ</option>
                    <option value="health">สาธารณสุข / อสม.</option>
                    <option value="activity">กิจกรรมชุมชน</option>
                    <option value="general">ทั่วไป</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ผู้ประกาศ</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">เนื้อหาประกาศฉบับเต็ม *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="ระบุรายละเอียด วัน เวลา สถานที่ และสิ่งที่ต้องเตรียม..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* AI Broadcast Drafter Button */}
              <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span>ใช้ Gemini 4 Argon ร่างบทเสียงตามสาย</span>
                  </div>
                  <div className="text-[11px] text-indigo-700">
                    แปลงหัวข้อเป็นคำพูดที่เป็นกันเอง อบอุ่น เหมาะกับหอกระจายข่าว
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isDraftingAi || !form.title}
                  onClick={handleDraftWithAi}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  {isDraftingAi ? 'กำลังคิด...' : 'ให้ AI ช่วยร่าง'}
                </button>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">บทพูดเสียงตามสาย (Broadcast Script)</label>
                <textarea
                  rows={3}
                  placeholder="สวัสดีพ่อแม่พี่น้องชาวหมู่ 7... (หรือกดปุ่ม AI ช่วยร่างด้านบน)"
                  value={form.broadcastScript}
                  onChange={(e) => setForm({ ...form, broadcastScript: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sarabun"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.important}
                  onChange={(e) => setForm({ ...form, important: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-semibold text-rose-700 text-xs">กำหนดให้เป็นประกาศด่วนสำคัญ</span>
              </label>

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
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/25"
                >
                  เผยแพร่ประกาศ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
