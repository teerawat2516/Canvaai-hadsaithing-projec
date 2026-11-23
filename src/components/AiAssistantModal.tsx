import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  X,
  Brain,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { askGeminiAssistant } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
  retryPrompt?: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  villageContext: Record<string, any>;
  initialPrompt?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  villageContext,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `สวัสดีครับผู้ใหญ่บ้านและคณะกรรมการหมู่บ้านหาดทรายทอง หมู่ 7 ผมคือ **"ผู้ช่วย AI อัจฉริยะ ประจำหมู่บ้าน"** ขับเคลื่อนด้วย **Gemini AI**

ผมพร้อมให้คำปรึกษาเชิงลึกด้าน:
1. **การบริหารจัดการชุมชน**: พ.ร.บ. ลักษณะปกครองท้องที่, ระเบียบ มท. ว่าด้วย กม.
2. **การเงินชุมชน**: บริหารกองทุนหมู่บ้าน, สมุดบัญชีรายรับ-รายจ่าย, สิ่งแวดล้อม
3. **การพัฒนาโครงสร้างพื้นฐาน**: แผนถนน, ท่อระบายน้ำ, ไฟส่องสว่างโซลาร์เซลล์
4. **สวัสดิการชุมชน**: การดูแลผู้สูงอายุและผู้ป่วยติดเตียงร่วมกับ อสม.
5. **การร่างหนังสือราชการและประกาศหอกระจายข่าว**

สามารถพิมพ์คำถาม หรือเลือกหัวข้อกลยุทธ์ด้านล่างได้เลยครับ`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const lastInitialPromptRef = useRef<string | undefined>(undefined);

  const quickPrompts = [
    {
      title: 'แผนพัฒนาหมู่บ้าน 5 ปี',
      prompt: 'ช่วยวิเคราะห์สถิติประชากรและเรื่องร้องเรียนของหมู่ 7 เพื่อร่างโครงร่าง "แผนพัฒนาหมู่บ้าน 5 ปี" โดยเน้นการแก้ปัญหาน้ำท่วมขังและไฟส่องทาง',
    },
    {
      title: 'บริหารกองทุนและการเงินชุมชน',
      prompt: 'แนะนำกลยุทธ์การบริหารจัดการบัญชีการเงินและกองทุนหมู่บ้านให้โปร่งใส มีสภาพคล่อง และสามารถสนับสนุนโครงการพัฒนาชุมชนได้อย่างต่อเนื่อง',
    },
    {
      title: 'โครงการดูแลผู้สูงอายุ',
      prompt: 'ช่วยออกแบบ "โครงการเยี่ยมบ้านผู้สูงอายุและผู้ป่วยติดเตียงเชิงรุก" โดยบูรณาการ อสม. รพ.สต. และเงินกองทุนหมู่บ้าน',
    },
    {
      title: 'ไกล่เกลี่ยข้อพิพาทชุมชน',
      prompt: 'ขอคำแนะนำและขั้นตอนการไกล่เกลี่ยข้อพิพาทระหว่างเพื่อนบ้านเรื่องสัตว์เลี้ยงและเสียงรบกวน ตามอำนาจหน้าที่ผู้ใหญ่บ้าน',
    },
    {
      title: 'ของบประมาณ อบต.',
      prompt: 'ช่วยร่างข้อเสนอโครงการของบอุดหนุนจาก อบต.สร้างนางขาว วงเงิน 120,000 บาท เพื่อติดตั้งไฟถนนโซลาร์เซลล์ซอย 4 ถึง 8',
    },
  ];

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const prompt = (textToSend ?? inputPrompt).trim();
      if (!prompt || isSendingRef.current) return;

      isSendingRef.current = true;
      setIsLoading(true);
      if (!textToSend) {
        setInputPrompt('');
      }

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);

      try {
        const response = await askGeminiAssistant(prompt, villageContext);
        const isErr = response.status === 'error';

        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: isErr,
          retryPrompt: isErr ? prompt : undefined,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err?.message || 'โปรดลองใหม่อีกครั้ง'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isError: true,
            retryPrompt: prompt,
          },
        ]);
      } finally {
        isSendingRef.current = false;
        setIsLoading(false);
      }
    },
    [inputPrompt, villageContext]
  );

  useEffect(() => {
    if (!isOpen) {
      lastInitialPromptRef.current = undefined;
      return;
    }
    if (initialPrompt && initialPrompt !== lastInitialPromptRef.current) {
      lastInitialPromptRef.current = initialPrompt;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen, handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-card bg-white/95 rounded-3xl shadow-2xl max-w-4xl w-full h-[92dvh] sm:h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white flex items-start sm:items-center justify-between gap-2 shrink-0 shadow-sm">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-extrabold text-sm sm:text-base md:text-lg leading-tight">
                  AI ที่ปรึกษาผู้ใหญ่บ้านและคณะกรรมการชุมชน
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-400 text-emerald-950 font-bold uppercase tracking-wider">
                  Gemini AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-900/60 text-emerald-300 border border-emerald-400/30 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ออนไลน์พร้อมตอบ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-100 mt-0.5 truncate">
                วิเคราะห์ข้อมูล วางแผนกลยุทธ์ และให้คำปรึกษาหมู่บ้านหาดทรายทอง หมู่ 7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition shrink-0"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Strategy Topics */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            หัวข้อยอดนิยม:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 border border-slate-200/80 text-slate-700 whitespace-nowrap shadow-2xs transition"
            >
              {qp.title}
            </button>
          ))}
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 sm:gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl shrink-0 flex items-center justify-center text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div
                  className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-tr-xs'
                      : msg.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-700">
                        <Brain className="w-3.5 h-3.5 text-indigo-500" />
                        <span>คำตอบจาก AI ที่ปรึกษาผู้ใหญ่บ้าน</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                        title="คัดลอกข้อความนี้"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {msg.text}

                  {msg.isError && msg.retryPrompt && (
                    <div className="mt-3 pt-2 border-t border-rose-200/70">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSendMessage(msg.retryPrompt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ลองส่งคำถามใหม่อีกครั้ง</span>
                      </button>
                    </div>
                  )}
                </div>

                <div
                  className={`text-[10px] text-slate-400 px-2 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 sm:gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shrink-0 flex items-center justify-center animate-pulse">
                <Brain className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-3.5 sm:p-4 rounded-3xl rounded-tl-xs bg-white border border-indigo-200/80 shadow-md text-xs sm:text-sm text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-700">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>ผู้ช่วย AI กำลังวิเคราะห์ข้อมูลและประมวลผลคำตอบ...</span>
                </div>
                <div className="space-y-1 text-slate-500 text-xs">
                  <p className="animate-pulse">
                    • ตรวจสอบบริบทข้อมูลหมู่ที่ 7 และระเบียบราชการที่เกี่ยวข้อง...
                  </p>
                  <p className="animate-pulse">
                    • สรุปแนวทางปฏิบัติที่ชัดเจนสำหรับผู้ใหญ่บ้านและชุมชน...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white/90 border-t border-slate-200/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="พิมพ์คำถาม ปรึกษาข้อกฎหมาย หรือร่างโครงการ..."
              disabled={isLoading}
              className="flex-1 min-w-0 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-300 focus:outline-indigo-500 text-base sm:text-sm bg-white shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">ส่งคำถาม</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 px-1 pt-2 gap-2">
            <span className="truncate">ขับเคลื่อนโดย Google Gemini AI • หมู่บ้านหาดทรายทอง</span>
            <span className="hidden sm:inline shrink-0">หมู่ที่ 7 ต.สร้างนางขาว อ.โพนพิสัย จ.หนองคาย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
