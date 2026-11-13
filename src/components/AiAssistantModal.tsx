import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { askGeminiAssistant } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  thinkingSteps?: string[];
  timestamp: string;
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
      text: `สวัสดีครับผู้ใหญ่บ้านและคณะกรรมการหมู่บ้านหาดทรายทอง หมู่ 7 ผมคือ **"ผู้ช่วย AI อัจฉริยะ ประจำหมู่บ้าน"** ขับเคลื่อนด้วย **Gemini AI (Gemini 3.8 Flash)**

ผมพร้อมให้คำปรึกษาเชิงลึกด้าน:
1. **การบริหารจัดการชุมชน**: พ.ร.บ. ลักษณะปกครองท้องที่, ระเบียบ มท. ว่าด้วย กม.
2. **การเงินชุมชน**: บริหารกองทุนหมู่บ้าน, สมุดบัญชีรายรับ-รายจ่าย, พลังงานสะอาดและสิ่งแวดล้อม
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
  const [showThinkingDetails, setShowThinkingDetails] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await askGeminiAssistant(prompt, villageContext);

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `เกิดข้อผิดพลาดในการเชื่อมต่อ: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-card bg-white/95 rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-white/80">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base md:text-lg">
                  AI ที่ปรึกษาผู้ใหญ่บ้านและคณะกรรมการชุมชน
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-400 text-emerald-950 font-bold uppercase tracking-wider">
                  Gemini 3.8 Flash
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-900/60 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ออนไลน์พร้อมตอบ
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                ระบบวิเคราะห์เชิงลึก วางแผนกลยุทธ์ และให้คำปรึกษาการบริหารหมู่บ้านหาดทรายทอง หมู่ 7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Strategy Topics */}
        <div className="px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            หัวข้อยอดนิยม:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-slate-700 whitespace-nowrap shadow-2xs transition"
            >
              {qp.title}
            </button>
          ))}
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center text-sm shadow-sm ${
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
                  className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-tr-xs'
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

          {/* Loading Indicator with Deep Thinking Animation */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shrink-0 flex items-center justify-center animate-pulse">
                <Brain className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-xs bg-white border border-indigo-200/80 shadow-md text-xs md:text-sm text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-700">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>ผู้ช่วย AI กำลังวิเคราะห์ข้อมูลและประมวลผลคำตอบ...</span>
                </div>
                <div className="space-y-1 text-slate-500 text-xs">
                  <p className="flex items-center gap-1.5 animate-pulse">
                    • ตรวจสอบบริบทข้อมูลประชากรหมู่ที่ 7 และระเบียบราชการที่เกี่ยวข้อง...
                  </p>
                  <p className="flex items-center gap-1.5 animate-pulse delay-100">
                    • วินิจฉัยผลกระทบต่องบประมาณ ความปลอดภัย และสวัสดิการชุมชน...
                  </p>
                  <p className="flex items-center gap-1.5 animate-pulse delay-200">
                    • สังเคราะห์แผนปฏิบัติการและแนวทางปฏิบัติที่ดีที่สุด (Best Practice)...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/90 border-t border-slate-200/80 shrink-0">
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
              placeholder="พิมพ์คำถาม ปรึกษาข้อกฎหมาย ร่างโครงการ หรือแนวทางพัฒนาหมู่บ้าน..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:outline-indigo-500 text-xs md:text-sm bg-white shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>ส่งคำถาม</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2">
            <span>ขับเคลื่อนโดย Google Gemini 3.8 Flash • AI ประจำหมู่บ้านหาดทรายทอง</span>
            <span>ที่ทำการผู้ใหญ่บ้าน หมู่ที่ 7 ต.สร้างนางขาว อ.โพนพิสัย จ.หนองคาย</span>
          </div>
        </div>
      </div>
    </div>
  );
};
