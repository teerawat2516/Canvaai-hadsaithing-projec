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
  timeoutMs = 55000
): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('อุปกรณ์ไม่ได้เชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบสัญญาณแล้วลองใหม่');
  }

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
        const serverMsg = (errData as { error?: string }).error;
        let msg = serverMsg;
        if (!msg) {
          if (res.status === 401 || res.status === 403) {
            msg = `ไม่สามารถยืนยันสิทธิ์การเข้าถึง AI (${res.status}) หากเปิดลิงก์พัฒนาบนมือถือ กรุณาล็อกอินบัญชี Google เดียวกันหรือเปิดผ่านลิงก์แชร์แอป`;
          } else if (res.status === 404 || res.status === 405) {
            msg = `ไม่พบบริการ AI บนเซิร์ฟเวอร์ (${res.status}) กรุณากดเผยแพร่/อัปเดตแอปอีกครั้งแล้วรีเฟรชหน้าเว็บ`;
          } else if (res.status >= 500) {
            msg = `เซิร์ฟเวอร์ขัดข้องชั่วคราว (${res.status})`;
          } else {
            msg = `ไม่สามารถเชื่อมต่อบริการ AI (${res.status})`;
          }
        }

        if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 700));
          continue;
        }
        throw new Error(msg);
      }

      if (!isJson) {
        throw new Error('การเชื่อมต่อถูกขัดจังหวะ (ระบบตอบกลับไม่ใช่ข้อมูล JSON) กรุณาเปิดผ่าน Chrome หรือ Safari แล้วลองใหม่');
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
  context?: Record<string, any>,
  history?: Array<{ role: string; content: string }>
): Promise<GeminiChatResponse> {
  try {
    return await postJsonWithRetry<GeminiChatResponse>('/api/gemini/chat', {
      prompt,
      context,
      history,
    });
  } catch (err: any) {
    console.error('Failed to call Gemini Assistant:', err);
    return {
      reply: `เกิดข้อผิดพลาดในการประมวลผลด้วย AI: ${err.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'}`,
      status: 'error',
      error: err.message,
    };
  }
}

export async function askGeminiAssistantStream(
  prompt: string,
  context: Record<string, any> | undefined,
  history: Array<{ role: string; content: string }> | undefined,
  onChunk: (accumulatedText: string) => void
): Promise<GeminiChatResponse> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      reply: 'อุปกรณ์ไม่ได้เชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบสัญญาณแล้วลองใหม่',
      status: 'error',
      error: 'offline',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let accumulated = '';

  try {
    const res = await fetch('/api/gemini/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ prompt, context, history }),
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') || '';

    if (!res.ok || !contentType.includes('text/event-stream') || !res.body) {
      clearTimeout(timer);
      return await askGeminiAssistant(prompt, context, history);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let streamError: string | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: !done });
      } else if (done) {
        buffer += decoder.decode();
      }

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = done ? '' : events.pop() || '';

      for (const evt of events) {
        for (const line of evt.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const parsed = JSON.parse(jsonStr) as {
              text?: string;
              error?: string;
              done?: boolean;
            };
            if (parsed.error) {
              streamError = parsed.error;
            } else if (parsed.text) {
              accumulated += parsed.text;
              onChunk(accumulated);
            }
          } catch {
            // Ignore malformed partial frame
          }
        }
      }

      if (done) break;
    }

    clearTimeout(timer);

    if (accumulated.trim()) {
      return { reply: accumulated, status: 'success' };
    }

    if (streamError) {
      return {
        reply: `เกิดข้อผิดพลาดในการประมวลผลด้วย AI: ${streamError}`,
        status: 'error',
        error: streamError,
      };
    }

    return await askGeminiAssistant(prompt, context, history);
  } catch (err: any) {
    clearTimeout(timer);
    if (accumulated.trim()) {
      return { reply: accumulated, status: 'success' };
    }
    return await askGeminiAssistant(prompt, context, history);
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

const ADMIN_PASSCODE_SHA256 =
  'a5aec22a5cc81392d66dfa3bb2a321f44ea0ca31105fad837d2f139e6edd0a1d';

function normalizePasscode(raw: string): string {
  const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
  return raw.trim().replace(/[๐-๙]/g, (d) => String(thaiDigits.indexOf(d)));
}

async function verifyPasscodeDigest(normalized: string): Promise<boolean> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex === ADMIN_PASSCODE_SHA256;
  }
  return false;
}

export async function verifyAdminPassword(
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const normalized = normalizePasscode(password);
  if (!normalized) {
    return { ok: false, error: 'กรุณากรอกรหัสผ่านผู้ดูแลระบบ' };
  }

  try {
    const res = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password: normalized }),
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (isJson) {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          error: (data as { error?: string }).error || 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
        };
      }
      return { ok: Boolean((data as { ok?: boolean }).ok) };
    }

    // If proxy/host returned non-JSON (e.g. mobile auth redirect or static preview)
    const fallbackOk = await verifyPasscodeDigest(normalized);
    return fallbackOk
      ? { ok: true }
      : { ok: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' };
  } catch {
    // Offline or unreachable backend fallback
    const fallbackOk = await verifyPasscodeDigest(normalized);
    return fallbackOk
      ? { ok: true }
      : { ok: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง' };
  }
}
