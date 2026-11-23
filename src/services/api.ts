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
