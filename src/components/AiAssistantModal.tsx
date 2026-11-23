import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Trash2,
  Bot,
  User,
  TrendingUp,
  FileText,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import {
  askGeminiAssistant,
  analyzeCommunityData,
  draftOfficialDocument
} from '../services/api';
import { notifyToast, notifyAlert, notifyConfirm } from '../services/notify';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  villageContext: Record<string, any>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  villageContext,
}) => {
  const [mode, setMode] = useState<'chat' | 'analyze' | 'draft'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำหมู่บ้านหาดทรายทอง หมู่ที่ 7 ยินดีให้คำปรึกษาเรื่องการบริหารงานหมู่บ้าน ระเบียบ กม. สวัสดิการชาวบ้าน งานแจ้งซ่อม การเงินชุมชน และการร่างเอกสารครับ พิมพ์คำถามหรือเลือกหัวข้อด้านล่างได้เลย',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Analyze mode state
  const [focusArea, setFocusArea] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Quick draft mode state
  const [draftType, setDraftType] = useState('ประกาศเสียงตามสาย/หอกระจายข่าว');
  const [draftTopic, setDraftTopic] = useState('');
  const [draftDetails, setDraftDetails] = useState('');
  const [draftResult, setDraftResult] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setMode('chat');
      setInput(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    'สรุปภาพรวมหมู่บ้านและงานเร่งด่วนตอนนี้',
    'ช่วยวางแผนเก็บค่าขยะและเพิ่มรายรับชุมชน',
    'แนวทางดูแลผู้สูงอายุและผู้ป่วยติดเตียงในหมู่ 7',
    'ร่างคำกล่าวเปิดประชุมประจำเดือนหมู่บ้านแบบกระชับ',
  ];

  const handleSend = async (customPrompt?: string) => {
    const question = (customPrompt ?? input).trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    const res = await askGeminiAssistant(question, villageContext);

    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: res.reply,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isError: res.status === 'error',
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleRunAnalysis = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const openRepairs = Array.isArray(villageContext.openRepairs)
      ? villageContext.openRepairs
      : [];

    const res = await analyzeCommunityData({
      stats: {
        totalResidents: villageContext.totalResidents || 0,
        households: villageContext.totalHouseholds || 0,
        elderlyCount: villageContext.elderlyCount || 0,
      },
      openIssues: openRepairs,
      financeSummary: {
        totalIncome: villageContext.totalIncome || 0,
        totalExpense: villageContext.totalExpense || 0,
        balance: villageContext.fundBalance || 0,
        wasteFeeCollectionRate: '88%',
      },
      focusArea: focusArea.trim() || undefined,
    });

    setAnalysisResult(res.analysis);
    if (res.status === 'error') {
      notifyToast('ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้', 'error');
    } else {
      notifyToast('วิเคราะห์ข้อมูลหมู่บ้านเสร็จสมบูรณ์', 'success');
    }
    setIsLoading(false);
  };

  const handleQuickDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTopic.trim()) {
      notifyAlert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุหัวข้อหรือเรื่องที่ต้องการร่าง', 'warning');
      return;
    }
    setIsLoading(true);
    const res = await draftOfficialDocument({
      docType: draftType,
      topic: draftTopic.trim(),
      keyDetails: draftDetails.trim(),
    });
    setDraftResult(res.content);
    if (res.status === 'error') {
      notifyToast('ไม่สามารถร่างข้อความได้ในขณะนี้', 'error');
    } else {
      notifyToast('ร่างข้อความด้วย AI เสร็จเรียบร้อย', 'success');
    }
    setIsLoading(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notifyToast('คัดลอกข้อความเรียบร้อยแล้ว', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = async () => {
    const ok = await notifyConfirm(
      'ล้างประวัติการสนทนา?',
      'ข้อความแชททั้งหมดในหน้าต่างนี้จะถูกล้างออก',
      'ล้างประวัติ',
      'warning'
    );
    if (!ok) return;
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'เริ่มบทสนทนาใหม่เรียบร้อยครับ มีเรื่องใดให้ช่วยดูแลเกี่ยวกับหมู่บ้านหาดทรายทอง หมู่ 7 แจ้งได้เลยครับ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 no-print">
      <div className="glass-card bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden border border-slate-200/80">
        {/* Modal Header */}
        <div className="px-5 py-4 md:px-7 md:py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base md:text-lg truncate">
                AI ผู้ช่วยหมู่บ้านหาดทรายทอง หมู่ 7
              </h3>
              <p className="text-xs text-emerald-100/90 truncate">
                ที่ปรึกษางานปกครอง ชุมชน เอกสาร และวิเคราะห์ข้อมูล
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

        {/* Mode Tabs */}
        <div className="px-4 py-3 md:px-7 bg-slate-50/90 border-b border-slate-200/70 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setMode('chat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'chat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>ถาม-ตอบผู้ช่วย</span>
            </button>
            <button
              onClick={() => setMode('analyze')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'analyze'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>วิเคราะห์ข้อมูลหมู่บ้าน</span>
            </button>
            <button
              onClick={() => setMode('draft')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                mode === 'draft'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ช่วยร่างประกาศ/เอกสาร</span>
            </button>
          </div>

          {mode === 'chat' && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-1"
              title="ล้างประวัติแชท"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ล้างแชท</span>
            </button>
          )}
        </div>

        {/* Mode 1: Chat */}
        {mode === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-2xs ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : msg.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-sm'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    <div
                      className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                        msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && !msg.isError && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 text-xs md:text-sm text-slate-600 flex items-center gap-2.5 shadow-2xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>AI กำลังเรียบเรียงคำตอบให้สักครู่...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts + Input Footer */}
            <div className="p-4 md:p-5 border-t border-slate-200/80 bg-white space-y-3 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(qp)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-xs font-medium whitespace-nowrap transition border border-transparent hover:border-emerald-200 shrink-0"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2.5"
              >
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="พิมพ์คำถาม หรือเรื่องที่ต้องการให้ AI ช่วย..."
                  className="flex-1 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-emerald-500 text-sm resize-none leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm transition flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">ส่ง</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* Mode 2: Strategic Community Analysis */}
        {mode === 'analyze' && (
          <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5 bg-slate-50/40">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  วิเคราะห์ข้อมูลและวางแผนพัฒนาหมู่บ้านอัตโนมัติ
                </h4>
                <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
                  ดึงสถิติประชากร ผู้สูงอายุ งานแจ้งซ่อมค้างอยู่ และบัญชีการเงินปัจจุบันมาสรุปแนวทางปฏิบัติ
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเด็นที่ต้องการเน้นเป็นพิเศษ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="เช่น การซ่อมบำรุงไฟส่องสว่าง, แผนดูแลผู้สูงอายุ, การบริหารกองทุนหมู่บ้าน"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span>{isLoading ? 'กำลังวิเคราะห์ข้อมูลหมู่บ้าน...' : 'เริ่มวิเคราะห์ข้อมูลหมู่บ้าน'}</span>
              </button>
            </div>

            {analysisResult && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-sm">ผลการวิเคราะห์และข้อเสนอแนะ</span>
                  <button
                    onClick={() => handleCopy('analysis', analysisResult)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                  >
                    {copiedId === 'analysis' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'analysis' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {analysisResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 3: Quick AI Draft */}
        {mode === 'draft' && (
          <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5 bg-slate-50/40">
            <form
              onSubmit={handleQuickDraft}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ประเภทเอกสาร / ประกาศ
                  </label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    <option value="ประกาศเสียงตามสาย/หอกระจายข่าว">ประกาศเสียงตามสาย / หอกระจายข่าว</option>
                    <option value="หนังสือรับรองความประพฤติ/อยู่อาศัย">หนังสือรับรองความประพฤติ / อยู่อาศัย</option>
                    <option value="หนังสือนัดประชุมหมู่บ้าน/รายงานการประชุม">หนังสือนัดประชุมหมู่บ้าน</option>
                    <option value="บันทึกข้อตกลงไกล่เกลี่ยข้อพิพาท">บันทึกข้อตกลงไกล่เกลี่ยข้อพิพาท</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    หัวข้อ / เรื่อง *
                  </label>
                  <input
                    type="text"
                    value={draftTopic}
                    onChange={(e) => setDraftTopic(e.target.value)}
                    placeholder="เช่น นัดฉีดวัคซีนพิษสุนัขบ้า หรือ เชิญประชุม กม."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รายละเอียดสำคัญ (วัน เวลา สถานที่ ผู้เกี่ยวข้อง)
                </label>
                <textarea
                  rows={3}
                  value={draftDetails}
                  onChange={(e) => setDraftDetails(e.target.value)}
                  placeholder="ระบุข้อมูลสำคัญที่ต้องการให้ AI นำไปเรียบเรียง..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isLoading ? 'AI กำลังร่างข้อความ...' : 'ให้ AI ช่วยร่างข้อความ'}</span>
              </button>
            </form>

            {draftResult && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-sm">ร่างข้อความจาก AI</span>
                  <button
                    onClick={() => handleCopy('draft', draftResult)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                  >
                    {copiedId === 'draft' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === 'draft' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sarabun">
                  {draftResult}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
