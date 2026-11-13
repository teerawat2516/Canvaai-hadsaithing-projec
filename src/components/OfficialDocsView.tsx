import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  Copy,
  Check,
  Building,
  UserCheck,
  Calendar,
  Send
} from 'lucide-react';
import { Resident, UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';
import { draftOfficialDocument } from '../services/api';

interface OfficialDocsViewProps {
  residents: Resident[];
  currentRole: UserRole;
  onOpenAiAssistant: (prompt: string) => void;
}

export const OfficialDocsView: React.FC<OfficialDocsViewProps> = ({
  residents,
  currentRole,
  onOpenAiAssistant,
}) => {
  const [docType, setDocType] = useState<string>('cert_residence');
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || '');
  const [topic, setTopic] = useState<string>('ขอรับรองถิ่นที่อยู่และความประพฤติ');
  const [purpose, setPurpose] = useState<string>('เพื่อนำไปใช้ประกอบการสมัครงานและทำธุรกรรมการเงิน');
  const [extraDetails, setExtraDetails] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedResident = residents.find((r) => r.id === selectedResidentId) || residents[0];

  const today = new Date();
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const thaiDateString = `${today.getDate()} ${thaiMonths[today.getMonth()]} พ.ศ. ${today.getFullYear() + 543}`;

  // Default templates generator
  const handleGenerateTemplate = () => {
    if (!selectedResident) return;

    if (docType === 'cert_residence') {
      const text = `หนังสือรับรองถิ่นที่อยู่และความประพฤติ
ที่ทำการผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง
ตำบลสร้างนางขาว อำเภอโพนพิสัย จังหวัดหนองคาย

วันที่ ${thaiDateString}

หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า:
${selectedResident.prefix}${selectedResident.firstName} ${selectedResident.lastName} อายุ ${selectedResident.age} ปี สัญชาติไทย
เลขประจำตัวประชาชน: ${selectedResident.idCardNumber || '3-xxxx-xxxxx-xx-x'}
ปัจจุบันมีภูมิลำเนาและพักอาศัยอยู่จริง ณ บ้านเลขที่ ${selectedResident.houseNo} ${selectedResident.soi} 
ตำบลสร้างนางขาว อำเภอโพนพิสัย จังหวัดหนองคาย

ข้าพเจ้า นายอำนาจ พันนาขา ตำแหน่ง ผู้ใหญ่บ้านหมู่ที่ 7 ขอรับรองว่าบุคคลดังกล่าวเป็นผู้มีถิ่นที่อยู่ในหมู่บ้านจริง มีความประพฤติเรียบร้อย ไม่เคยมีประวัติเสื่อมเสียหรือสร้างความเดือดร้อนรำคาญให้แก่ชุมชนและสังคมแต่ประการใด และเป็นผู้ให้ความร่วมมือในกิจกรรมสาธารณประโยชน์ของหมู่บ้านเป็นอย่างดีสม่ำเสมอ

หนังสือรับรองฉบับนี้ออกให้เพื่อ: ${purpose}

จึงออกหนังสือฉบับนี้ไว้เป็นหลักฐานสำคัญ


(ลงชื่อ).....................................................................
      (นายอำนาจ พันนาขา)
      ผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง
      (ประทับตราประจำตำแหน่ง)`;
      setGeneratedContent(text);
    } else if (docType === 'meeting_notice') {
      const text = `หนังสือเชิญประชุมประจำเดือนคณะกรรมการหมู่บ้าน (กม.)
ที่ทำการผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง
ตำบลสร้างนางขาว อำเภอโพนพิสัย จังหวัดหนองคาย

วันที่ ${thaiDateString}

เรื่อง: ขอเชิญประชุมคณะกรรมการหมู่บ้านและผู้นำชุมชน ประจำเดือนมีนาคม 2569
เรียน: คณะกรรมการหมู่บ้าน (กม.), อสม. และตัวแทนคุ้มบ้านทุกท่าน

ด้วย ที่ทำการผู้ใหญ่บ้านหมู่ที่ 7 กำหนดจัดให้มีการประชุมประจำเดือนเพื่อติดตามความก้าวหน้าโครงการพัฒนาชุมชน บัญชีการเงินกองทุนหมู่บ้าน และการเตรียมความพร้อมจัดกิจกรรมงานประเพณีสงกรานต์สรงน้ำพระผู้สูงอายุ

จึงขอเชิญท่านเข้าร่วมประชุม ในวันอาทิตย์ที่ 15 มีนาคม 2569 เวลา 09.00 น. ณ ศาลาประชาคมหมู่บ้านหาดทรายทอง

ระเบียบวาระการประชุม:
วาระที่ 1: เรื่องที่ประธานแจ้งให้ที่ประชุมทราบ (นโยบายจากอำเภอและ อบต.สร้างนางขาว)
วาระที่ 2: รับรองรายงานการประชุมครั้งที่ผ่านมา
วาระที่ 3: สรุปรายงานรายรับ-รายจ่ายบัญชีการเงินกองทุนหมู่บ้าน
วาระที่ 4: การพิจารณาจัดซื้อชุดแบตเตอรี่และหลอดไฟส่องสว่างซอย 2 และซอย 4
วาระที่ 5: เรื่องอื่นๆ (การดูแลผู้ป่วยติดเตียงโดย อสม. และเปิดรับเรื่องร้องเรียน)

จึงเรียนมาเพื่อโปรดเข้าร่วมประชุมโดยพร้อมเพรียงกัน


(ลงชื่อ).....................................................................
      (นายอำนาจ พันนาขา)
      ผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง`;
      setGeneratedContent(text);
    } else if (docType === 'subdistrict_request') {
      const text = `บันทึกข้อความ / หนังสือขอความอนุเคราะห์
ที่ทำการผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง ตำบลสร้างนางขาว

ที่ ชุมชน ม.7 / 2569 / 014                                       วันที่ ${thaiDateString}

เรื่อง: ขอความอนุเคราะห์สนับสนุนงบประมาณซ่อมแซมผิวจราจรคอนกรีตและท่อระบายน้ำ
เรียน: นายกองค์การบริหารส่วนตำบลสร้างนางขาว

สิ่งที่ส่งมาด้วย: 1. ภาพถ่ายจุดชำรุดทรุดตัวบริเวณสามแยกซอย 1 เชื่อมซอย 3 จำนวน 4 รูป
                2. รายชื่อราษฎรผู้ได้รับผลกระทบ จำนวน 35 ครัวเรือน

ด้วย ราษฎรหมู่ที่ 7 บ้านหาดทรายทอง ได้รับความเดือดร้อนจากการที่ผิวจราจรคอนกรีตบริเวณสามแยกทางเชื่อมซอย 1 ถึงซอย 3 เกิดการทรุดตัวเป็นหลุมกว้างและทรายใต้ผิวทางเริ่มไหลลงท่อระบายน้ำ ก่อให้เกิดอันตรายต่อการสัญจรของเด็ก ผู้สูงอายุ และยานพาหนะของประชาชน

ในการนี้ คณะกรรมการหมู่บ้านได้ร่วมกับชาวบ้านตรวจสอบแล้วเห็นควรขอความอนุเคราะห์จากองค์การบริหารส่วนตำบลสร้างนางขาว ได้โปรดจัดส่งเจ้าหน้าที่กองช่างเข้าดำเนินการสำรวจและประมาณการงบประมาณซ่อมแซมโดยเร่งด่วน เพื่อความปลอดภัยในชีวิตและทรัพย์สินของพี่น้องประชาชน

จึงเรียนมาเพื่อโปรดพิจารณาให้ความอนุเคราะห์ และขอขอบพระคุณเป็นอย่างสูงมา ณ โอกาสนี้


(ลงชื่อ).....................................................................
      (นายอำนาจ พันนาขา)
      ผู้ใหญ่บ้าน หมู่ที่ 7 บ้านหาดทรายทอง`;
      setGeneratedContent(text);
    }
  };

  // Draft with Gemini 4 Argon High Thinking
  const handleDraftWithAi = async () => {
    setIsDrafting(true);
    try {
      const res = await draftOfficialDocument({
        docType:
          docType === 'cert_residence'
            ? 'หนังสือรับรองความประพฤติและถิ่นที่อยู่'
            : docType === 'meeting_notice'
            ? 'หนังสือเชิญประชุมหมู่บ้าน'
            : docType === 'dispute_settlement'
            ? 'บันทึกข้อตกลงไกล่เกลี่ยข้อพิพาทชุมชน'
            : 'หนังสือราชการขอความอนุเคราะห์ อบต.',
        topic,
        applicantName: selectedResident
          ? `${selectedResident.prefix}${selectedResident.firstName} ${selectedResident.lastName}`
          : 'ชาวบ้านหมู่ 7',
        houseNo: selectedResident?.houseNo || '1/1',
        recipient: docType === 'subdistrict_request' ? 'นายก อบต.สร้างนางขาว' : 'ผู้เกี่ยวข้อง',
        keyDetails: `วัตถุประสงค์: ${purpose}\nรายละเอียดเพิ่มเติม: ${extraDetails || 'ไม่มี'}\nข้อมูลผู้ใหญ่บ้าน: นายอำนาจ พันนาขา หมู่ 7 ต.สร้างนางขาว อ.โพนพิสัย จ.หนองคาย`,
      });

      if (res.status === 'success' && res.content) {
        setGeneratedContent(res.content);
      } else {
        alert(res.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600" />
            <span>ออกหนังสือราชการ & เอกสารรับรองหมู่บ้าน</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            สร้างหนังสือรับรองความประพฤติ หนังสือนัดประชุม หนังสือขอรับงบประมาณ พร้อมพิมพ์ลายเซ็นตราประทับ
          </p>
        </div>

        <div className="flex gap-2">
          {generatedContent && (
            <>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/25 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสารราชการ (A4)</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Configurations */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl space-y-4 no-print">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-600" />
            <span>กำหนดค่าเอกสาร</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">ประเภทเอกสาร</label>
            <select
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setGeneratedContent('');
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm font-semibold text-slate-800"
            >
              <option value="cert_residence">หนังสือรับรองถิ่นที่อยู่และความประพฤติ</option>
              <option value="meeting_notice">หนังสือเชิญประชุมประจำเดือนหมู่บ้าน / กม.</option>
              <option value="subdistrict_request">หนังสือขอความอนุเคราะห์ / งบประมาณ อบต.</option>
              <option value="dispute_settlement">บันทึกข้อตกลงไกล่เกลี่ยข้อพิพาทชุมชน</option>
            </select>
          </div>

          {docType === 'cert_residence' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">เลือกลูกบ้านผู้ขอหนังสือรับรอง</label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm"
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    บ้านเลขที่ {r.houseNo} - {r.prefix}
                    {r.firstName} {r.lastName} ({r.soi})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">วัตถุประสงค์ / เรื่อง</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น เพื่อนำไปใช้เป็นหลักฐานการขอสินเชื่อเพื่อการเกษตร"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม / ข้อความเฉพาะ</label>
            <textarea
              rows={3}
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              placeholder="ระบุข้อเท็จจริง หรือเงื่อนไขเพิ่มเติม..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs md:text-sm"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleGenerateTemplate}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs md:text-sm transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>สร้างร่างจากแบบฟอร์มมาตรฐาน</span>
            </button>

            {/* AI Generator Button */}
            <button
              onClick={handleDraftWithAi}
              disabled={isDrafting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isDrafting ? 'AI กำลังคิดและร่างเอกสาร...' : 'ให้ AI ช่วยร่างอย่างเป็นทางการ (Gemini AI)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Document Preview (Printable View) */}
        <div className="lg:col-span-7">
          <div className="glass-card bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 text-slate-900 font-sarabun min-h-[600px] flex flex-col justify-between">
            {generatedContent ? (
              <div className="space-y-6">
                {/* Official Crest Header */}
                <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xl mb-1 shadow-inner">
                    ตรา
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 leading-tight">
                    {VILLAGE_META.villageName} {VILLAGE_META.moo}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {VILLAGE_META.subdistrict} {VILLAGE_META.district} {VILLAGE_META.province} {VILLAGE_META.zipCode}
                  </p>
                </div>

                {/* Printable Document Body */}
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sarabun text-slate-800">
                  {generatedContent}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 stroke-1" />
                <h4 className="font-bold text-slate-600 text-base">ยังไม่มีการสร้างเอกสาร</h4>
                <p className="text-xs max-w-sm">
                  เลือกประเภทเอกสารทางด้านซ้าย แล้วกดปุ่ม "สร้างร่างจากแบบฟอร์ม" หรือกดให้ "AI ช่วยร่างอย่างเป็นทางการ" เพื่อดูตัวอย่างก่อนพิมพ์
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
