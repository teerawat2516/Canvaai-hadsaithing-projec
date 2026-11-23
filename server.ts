import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'รูปแบบข้อมูลคำขอไม่ถูกต้อง (Invalid JSON)', status: 'error' });
  }
  next(err);
});

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

// Village management system instruction
const VILLAGE_SYSTEM_INSTRUCTION = `คุณคือ "ผู้ช่วยปัญญาประดิษฐ์อัจฉริยะ ประจำหมู่บ้านหาดทรายทอง หมู่ที่ 7 ต.สร้างนางขาว อ.โพนพิสัย จ.หนองคาย"
บทบาทของคุณคือเป็นที่ปรึกษาด้านการบริหารจัดการชุมชน ให้คำปรึกษาแก่ผู้ใหญ่บ้าน คณะกรรมการหมู่บ้าน (กม.) สมาชิก อสม. และชาวบ้าน

ข้อกำหนดการตอบ:
1. ใช้ภาษาไทยที่ถูกต้อง สุภาพ ชัดเจน กระชับ เข้าใจง่าย เป็นทางการเมื่อเกี่ยวกับระเบียบ/ราชการ และเป็นกันเองเมื่อให้คำแนะนำชาวบ้าน
2. รอบรู้เรื่อง:
   - ระเบียบกระทรวงมหาดไทยว่าด้วยการดำเนินงานของคณะกรรมการหมู่บ้าน (กม.)
   - พ.ร.บ. ลักษณะปกครองท้องที่ พ.ศ. 2457 และที่แก้ไขเพิ่มเติม
   - กองทุนหมู่บ้าน, การจัดเก็บขยะและค่าบำรุงรักษาชุมชน
   - สวัสดิการผู้สูงอายุ, ผู้พิการ, การพัฒนาโครงสร้างพื้นฐาน (ไฟส่องสว่าง, ถนน, ท่อระบายน้ำ)
   - การเขียนหนังสือราชการหมู่บ้าน, ประกาศหอกระจายข่าว, และการไกล่เกลี่ยข้อพิพาทชุมชน
3. สรุปประเด็นเป็นข้อ ๆ อ่านง่ายบนมือถือ ระบุลำดับความสำคัญ แนวทางปฏิบัติที่ทำได้จริง และหน่วยงานที่ต้องประสานงานอย่างชัดเจน`;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timeout (${ms}ms) on ${label}`));
    }, ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Build a compact, safe context string so mobile/large village payloads remain fast
function compactContext(context: any): string {
  if (!context || typeof context !== 'object') return '';
  try {
    const summary = {
      village: context.village?.villageName || 'หมู่บ้านหาดทรายทอง หมู่ 7',
      headman: context.village?.headmanName || 'นายอำนาจ พันนาขา',
      totalResidents: context.totalResidents ?? 0,
      maleCount: context.maleCount ?? 0,
      femaleCount: context.femaleCount ?? 0,
      totalHouseholds: context.totalHouseholds ?? 0,
      elderlyCount: context.elderlyCount ?? 0,
      vulnerableCount: context.vulnerableCount ?? 0,
      openRepairs: Array.isArray(context.openRepairs) ? context.openRepairs.slice(0, 8) : [],
      recentBookingsCount: Array.isArray(context.recentBookings) ? context.recentBookings.length : 0,
      leaders: Array.isArray(context.leaders) ? context.leaders.slice(0, 5) : [],
    };
    return JSON.stringify(summary);
  } catch {
    return '';
  }
}

// Map Gemini API errors into clear Thai messages
function mapGeminiError(error: any): { status: number; message: string } {
  const raw = String(error?.message || error || '');
  if (/GEMINI_API_KEY is not configured/i.test(raw)) {
    return {
      status: 500,
      message: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY กรุณาตรวจสอบใน Settings > Secrets',
    };
  }
  if (/403|PERMISSION_DENIED|API_KEY_INVALID|400/i.test(raw)) {
    return {
      status: 403,
      message: 'ไม่สามารถยืนยันสิทธิ์ Gemini API ได้ กรุณาตรวจสอบ API Key ใน Settings > Secrets',
    };
  }
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return {
      status: 429,
      message: 'ขณะนี้มีการใช้งาน AI เกินโควตาชั่วคราว กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
    };
  }
  if (/timeout/i.test(raw)) {
    return {
      status: 504,
      message: 'การประมวลผล AI ใช้เวลานานกว่าปกติ กรุณาลองส่งคำถามใหม่อีกครั้ง',
    };
  }
  return {
    status: 500,
    message: raw || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API',
  };
}

// Resilient generation helper using active models from SDK guidelines
async function generateVillageAI(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const attempts: Array<{ model: string; timeoutMs: number; config?: Record<string, any> }> = [
    {
      model: 'gemini-4-hydrogen',
      timeoutMs: 18000,
      config: {
        systemInstruction: systemInstruction || VILLAGE_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    },
    {
      model: 'gemini-3.1-flash-lite',
      timeoutMs: 16000,
      config: {
        systemInstruction: systemInstruction || VILLAGE_SYSTEM_INSTRUCTION,
      },
    },
  ];

  let lastError: any = null;

  for (const attempt of attempts) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents: prompt,
          config: attempt.config,
        }),
        attempt.timeoutMs,
        attempt.model
      );

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${attempt.model} invocation issue, trying next fallback:`, err?.message || err);
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error('All Gemini models encountered an error');
}

// API 1: Assistant Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'กรุณาระบุคำถามที่ต้องการปรึกษา AI', status: 'error' });
    }

    const ai = getGeminiClient();
    const contextJson = compactContext(context);
    const contextualPrompt = contextJson
      ? `บริบทข้อมูลหมู่บ้านหาดทรายทอง หมู่ 7:\n${contextJson}\n\nคำถามหรือภารกิจ:\n${prompt.trim()}`
      : prompt.trim();

    const reply = await generateVillageAI(ai, contextualPrompt);
    res.json({ reply: reply || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้', status: 'success' });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    const mapped = mapGeminiError(error);
    res.status(mapped.status).json({
      error: mapped.message,
      status: 'error',
    });
  }
});

// API 2: Official Document & Broadcast Drafter
app.post('/api/gemini/draft-doc', async (req, res) => {
  try {
    const { docType, topic, recipient, keyDetails, applicantName, houseNo } = req.body || {};
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
    const mapped = mapGeminiError(error);
    res.status(mapped.status).json({
      error: mapped.message,
      status: 'error',
    });
  }
});

// API 3: Community Analysis & Strategy Plan
app.post('/api/gemini/analyze-community', async (req, res) => {
  try {
    const { stats, openIssues, financeSummary, focusArea } = req.body || {};
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
    const mapped = mapGeminiError(error);
    res.status(mapped.status).json({
      error: mapped.message,
      status: 'error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Admin passcode verification endpoint
app.post('/api/auth/verify-admin', (req, res) => {
  const raw = typeof req.body?.password === 'string' ? req.body.password : '';
  const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
  const submitted = raw
    .trim()
    .replace(/[๐-๙]/g, (d: string) => String(thaiDigits.indexOf(d)));
  const expected = (process.env.ADMIN_PASSCODE || '501107').trim();

  if (!submitted) {
    return res.status(400).json({ ok: false, error: 'กรุณากรอกรหัสผ่านผู้ดูแลระบบ' });
  }

  const submittedBuf = Buffer.from(submitted, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  const isMatch =
    submittedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(submittedBuf, expectedBuf);

  if (!isMatch) {
    return res.status(401).json({ ok: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' });
  }

  return res.json({ ok: true });
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
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Village Management Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
