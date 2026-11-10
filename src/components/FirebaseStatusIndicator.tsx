import React from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export type FirebaseConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface FirebaseStatusIndicatorProps {
  status: FirebaseConnectionStatus;
  projectName?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const FirebaseStatusIndicator: React.FC<FirebaseStatusIndicatorProps> = ({
  status,
  projectName = 'Canvaai-hadsaithing projec',
  onRetry,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          status === 'connected'
            ? 'bg-emerald-500/10 text-emerald-800 border-emerald-300'
            : status === 'disconnected'
            ? 'bg-rose-500/10 text-rose-800 border-rose-300'
            : 'bg-amber-500/10 text-amber-800 border-amber-300'
        }`}
        title={`Firebase: ${
          status === 'connected'
            ? `เชื่อมต่อแล้ว (${projectName})`
            : status === 'disconnected'
            ? 'ยังไม่ได้เชื่อมต่อ'
            : 'กำลังตรวจสอบสถานะ'
        }`}
      >
        {status === 'connected' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
        )}
        {status === 'disconnected' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
          </span>
        )}
        {status === 'connecting' && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-spin relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        )}
        <span className="text-[11px] font-bold">
          {status === 'connected' ? 'Firebase เชื่อมต่อแล้ว' : status === 'disconnected' ? 'Firebase ยังไม่เชื่อมต่อ' : 'กำลังเชื่อมต่อ...'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs shadow-xs ${
        status === 'connected'
          ? 'bg-emerald-50/90 border-emerald-300/80 text-emerald-900'
          : status === 'disconnected'
          ? 'bg-rose-50/90 border-rose-300/80 text-rose-900'
          : 'bg-amber-50/90 border-amber-300/80 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* LED Light Indicator */}
        <div className="relative flex items-center justify-center w-5 h-5">
          {status === 'connected' ? (
            <>
              <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </>
          ) : status === 'disconnected' ? (
            <>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_10px_#f43f5e]"></span>
            </>
          ) : (
            <span className="animate-spin inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>
              {status === 'connected'
                ? 'สถานะ: เชื่อมต่อ Firebase แล้ว'
                : status === 'disconnected'
                ? 'สถานะ: ยังไม่ได้เชื่อมต่อ Firebase'
                : 'สถานะ: กำลังตรวจสอบการเชื่อมต่อ...'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
            {projectName}
          </div>
        </div>
      </div>

      {status === 'disconnected' && onRetry && (
        <button
          onClick={onRetry}
          className="p-1.5 rounded-lg bg-rose-200/80 hover:bg-rose-300 text-rose-900 font-bold transition flex items-center gap-1 shrink-0 text-[10px]"
          title="ลองเชื่อมต่อ Firebase ใหม่อีกครั้ง"
        >
          <RefreshCw className="w-3 h-3" />
          <span>เชื่อมต่อใหม่</span>
        </button>
      )}
    </div>
  );
};
