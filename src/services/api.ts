export interface GeminiChatResponse {
  reply: string;
  status: 'success' | 'error';
  error?: string;
}

export interface GeminiDraftResponse {
  content: string;
  status: 'success' | 'error';
  error?: string;
}

export interface GeminiAnalysisResponse {
  analysis: string;
  status: 'success' | 'error';
  error?: string;
}

export async function askGeminiAssistant(
  prompt: string,
  context?: Record<string, any>
): Promise<GeminiChatResponse> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Failed to call Gemini Assistant:', err);
    return {
      reply: `เกิดข้อผิดพลาดในการประมวลผลด้วย AI: ${err.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'}`,
      status: 'error',
      error: err.message,
    };
  }
}

export async function draftOfficialDocument(params: {
  docType: string;
  topic: string;
  recipient?: string;
  keyDetails: string;
  applicantName?: string;
  houseNo?: string;
}): Promise<GeminiDraftResponse> {
  try {
    const res = await fetch('/api/gemini/draft-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Failed to draft official doc:', err);
    return {
      content: `ขออภัย ไม่สามารถร่างเอกสารได้ในขณะนี้: ${err.message}`,
      status: 'error',
      error: err.message,
    };
  }
}

export async function analyzeCommunityData(params: {
  stats: any;
  openIssues: any[];
  financeSummary: any;
  focusArea?: string;
}): Promise<GeminiAnalysisResponse> {
  try {
    const res = await fetch('/api/gemini/analyze-community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Failed to run community analysis:', err);
    return {
      analysis: `เกิดข้อผิดพลาดในการวิเคราะห์เชิงลึก: ${err.message}`,
      status: 'error',
      error: err.message,
    };
  }
}
