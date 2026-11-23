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

async function postJsonWithRetry<T>(
  url: string,
  payload: unknown,
  retries = 1,
  timeoutMs = 45000
): Promise<T> {
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!res.ok) {
        const errData = isJson ? await res.json().catch(() => ({})) : {};
        const msg =
          (errData as { error?: string }).error ||
          (res.status >= 500
            ? `เซิร์ฟเวอร์ขัดข้องชั่วคราว (${res.status})`
            : `ไม่สามารถเชื่อมต่อบริการ AI (${res.status})`);

        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 700));
          continue;
        }
        throw new Error(msg);
      }

      if (!isJson) {
        throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง กรุณารีเฟรชหน้าเว็บแล้วลองใหม่');
      }

      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err?.name === 'AbortError';
      const errMsg = isAbort
        ? 'การประมวลผลใช้เวลานานเกินกำหนด กรุณาลองใหม่อีกครั้ง'
        : err?.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';

      lastErr = new Error(errMsg);

      const isTransientNetwork =
        isAbort ||
        /load failed|failed to fetch|networkerror|network request failed/i.test(errMsg);

      if (isTransientNetwork && attempt < retries) {
        await new Promise((r) => setTimeout(r, 700));
        continue;
      }
      throw lastErr;
    }
  }

  throw lastErr || new Error('โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
}

export async function askGeminiAssistant(
  prompt: string,
  context?: Record<string, any>
): Promise<GeminiChatResponse> {
  try {
    return await postJsonWithRetry<GeminiChatResponse>('/api/gemini/chat', { prompt, context });
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
    return await postJsonWithRetry<GeminiDraftResponse>('/api/gemini/draft-doc', params);
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
    return await postJsonWithRetry<GeminiAnalysisResponse>('/api/gemini/analyze-community', params);
  } catch (err: any) {
    console.error('Failed to run community analysis:', err);
    return {
      analysis: `เกิดข้อผิดพลาดในการวิเคราะห์เชิงลึก: ${err.message}`,
      status: 'error',
      error: err.message,
    };
  }
}

export async function verifyAdminPassword(
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password }),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : {};

    if (!res.ok) {
      return {
        ok: false,
        error: (data as { error?: string }).error || 'รหัสผ่านไม่ถูกต้อง',
      };
    }

    return { ok: Boolean((data as { ok?: boolean }).ok) };
  } catch {
    return {
      ok: false,
      error: 'ไม่สามารถเชื่อมต่อเพื่อตรวจสอบรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
    };
  }
}
