import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Village management system system prompt for High Thinking Gemini 4 Argon
const VILLAGE_SYSTEM_INSTRUCTION = `คุณคือ "ผู้ช่วยปัญญาประดิษฐ์อัจฉริยะ ประจำหมู่บ้านหาดทรายทอง หมู่ที่ 7 ต.สร้างนางขาว อ.โพนพิสัย จ.หนองคาย"
บทบาทของคุณคือเป็นที่ปรึกษาอาวุโสด้านการบริหารจัดการชุมชน ให้คำปรึกษาแก่ผู้ใหญ่บ้าน คณะกรรมการหมู่บ้าน (กม.) สมาชิก อสม. และชาวบ้าน

ข้อกำหนดการตอบ:
1. ใช้ภาษาไทยที่ถูกต้อง สุภาพ ชัดเจน เข้าใจง่าย มีความเป็นทางการเมื่อเกี่ยวกับระเบียบ/ราชการ และเป็นกันเองเมื่อให้คำแนะนำชาวบ้าน
2. รอบรู้เรื่อง:
   - ระเบียบกระทรวงมหาดไทยว่าด้วยการดำเนินงานของคณะกรรมการหมู่บ้าน (กม.)
   - พ.ร.บ. ลักษณะปกครองท้องที่ พ.ศ. 2457 และที่แก้ไขเพิ่มเติม
   - กองทุนหมู่บ้าน, การจัดเก็บขยะและค่าบำรุงรักษาชุมชน
   - สวัสดิการผู้สูงอายุ, ผู้พิการ, การพัฒนาโครงสร้างพื้นฐาน (ไฟส่องสว่าง, ถนน, ท่อระบายน้ำ)
   - การเขียนหนังสือราชการหมู่บ้าน, ประกาศหอกระจายข่าว, และการไกล่เกลี่ยข้อพิพาทชุมชน
3. เมื่อวิเคราะห์ปัญหาหรือวางแผน ให้ใช้ตรรกะเชิงลึก (Deep Reasoning) แสดงขั้นตอนการคิด วินิจฉัยรากของปัญหา ลำดับความสำคัญ และแนวทางปฏิบัติที่ชุมชนทำได้จริง พร้อมกรอบเวลาและหน่วยงานที่ต้องประสานงาน`;

// Resilient generation helper with high-speed models (gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.8-flash)
async function generateVillageAI(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction?: string,
  extraConfig?: any
): Promise<string> {
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || VILLAGE_SYSTEM_INSTRUCTION,
          ...extraConfig,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} invocation issue, trying next fallback:`, err?.message || err);
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  throw lastError || new Error('All Gemini models encountered an error');
}

// API 1: Thinking Assistant Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const ai = getGeminiClient();
    const contextualPrompt = context
      ? `บริบทข้อมูลหมู่บ้านหาดทรายทอง หมู่ 7:\n${JSON.stringify(context, null, 2)}\n\nคำถามหรือภารกิจ:\n${prompt}`
      : prompt;

    const reply = await generateVillageAI(ai, contextualPrompt);
    res.json({ reply: reply || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้', status: 'success' });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      error: error?.message || 'Internal server error while communicating with Gemini API',
      status: 'error',
    });
  }
});

// API 2: High Thinking Official Document & Broadcast Drafter
app.post('/api/gemini/draft-doc', async (req, res) => {
  try {
    const { docType, topic, recipient, keyDetails, applicantName, houseNo } = req.body;
    const ai = getGeminiClient();

    const prompt = `จงร่างเอกสารประเภท: "${docType || 'เอกสารราชการ'}"
เรื่อง: "${topic || 'ไม่มีหัวข้อ'}"
ผู้รับ/กลุ่มเป้าหมาย: "${recipient || 'ชาวบ้านหมู่ 7'}"
ชื่อผู้ยื่นคำขอ/ที่เกี่ยวข้อง: "${applicantName || '-'}" บ้านเลขที่: "${houseNo || '-'}"
รายละเอียดสำคัญ:
${keyDetails || 'ไม่มีรายละเอียดเพิ่มเติม'}

คำแนะนำการร่าง:
- หากเป็น "ประกาศเสียงตามสาย/หอกระจายข่าว" ให้ขึ้นต้นด้วยคำทักทายที่อบอุ่น ชัดเจน ระบุ วัน เวลา สถานที่ สิ่งที่ต้องเตรียม และสรุปใจความสำคัญแบบกระชับ ภาษาง่าย
- หากเป็น "หนังสือรับรองความประพฤติ/อยู่อาศัย" ให้มีรูปแบบหนังสือราชการหมู่บ้าน ลงท้ายด้วยชื่อผู้ใหญ่บ้าน มีช่องลงลายมือชื่อและประทับตราประจำตำแหน่ง
- หากเป็น "หนังสือนัดประชุมหมู่บ้าน/รายงานการประชุม" ให้มีระเบียบวาระที่ 1-5 ตามมาตรฐานการประชุมราชการ
- หากเป็น "บันทึกข้อตกลงไกล่เกลี่ยข้อพิพาท" ให้ระบุคู่กรณี ข้อตกลง และพยานผู้ใหญ่บ้าน`;

    const content = await generateVillageAI(
      ai,
      prompt,
      `${VILLAGE_SYSTEM_INSTRUCTION}\nสร้างเอกสารอย่างเป็นทางการ สละสลวย ถูกต้องตามแบบแผนงานสารบรรณท้องถิ่น`
    );

    res.json({
      content: content || '',
      status: 'success',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/draft-doc:', error);
    res.status(500).json({
      error: error?.message || 'Error drafting document with Gemini',
      status: 'error',
    });
  }
});

// API 3: High Thinking Community Analysis & Strategy Plan
app.post('/api/gemini/analyze-community', async (req, res) => {
  try {
    const { stats, openIssues, financeSummary, focusArea } = req.body;
    const ai = getGeminiClient();

    const prompt = `ทำการวิเคราะห์เชิงลึก (Deep Strategic Analysis) สำหรับหมู่บ้านหาดทรายทอง หมู่ที่ 7
ข้อมูลสถิติปัจจุบัน:
- ประชากรทั้งหมด: ${stats?.totalResidents || 0} คน (${stats?.households || 0} ครัวเรือน)
- ผู้สูงอายุ/เปราะบาง: ${stats?.elderlyCount || 0} คน
- เรื่องร้องเรียน/แจ้งซ่อมค้างอยู่: ${openIssues?.length || 0} เรื่อง (${JSON.stringify(openIssues?.slice(0, 5) || [])})
- บัญชีการเงิน: รายรับ ${financeSummary?.totalIncome || 0} บาท, รายจ่าย ${financeSummary?.totalExpense || 0} บาท, คงเหลือ ${financeSummary?.balance || 0} บาท
- อัตราการจัดเก็บค่าขยะ: ${financeSummary?.wasteFeeCollectionRate || '85%'}
จุดเน้นพิเศษที่ต้องการให้พิจารณา: ${focusArea || 'ภาพรวมการพัฒนาหมู่บ้านและความเป็นอยู่ของลูกบ้าน'}

จงให้การวิเคราะห์ 4 ด้านหลัก:
1. [การวินิจฉัยปัญหาเร่งด่วนและรากเหง้า]
2. [แผนปฏิบัติการ 30-90 วัน (Action Plan)]
3. [กลยุทธ์การเงินและการจัดเก็บรายได้ชุมชนให้ยั่งยืน]
4. [ข้อเสนอของบประมาณจาก อบต.สร้างนางขาว หรืออำเภอโพนพิสัย]`;

    const analysis = await generateVillageAI(ai, prompt);

    res.json({
      analysis: analysis || '',
      status: 'success',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-community:', error);
    res.status(500).json({
      error: error?.message || 'Error running community analysis',
      status: 'error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Village Management Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
