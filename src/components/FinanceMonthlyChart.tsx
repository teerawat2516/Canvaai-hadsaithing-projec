import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { FundTransaction } from '../types/village';

interface FinanceMonthlyChartProps {
  transactions: FundTransaction[];
}

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

interface MonthlyPoint {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

function formatThaiMonthLabel(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) {
    return monthKey;
  }
  const beShortYear = String(year + 543).slice(-2);
  return `${THAI_MONTHS_SHORT[monthIdx]} ${beShortYear}`;
}

export const FinanceMonthlyChart: React.FC<FinanceMonthlyChartProps> = ({ transactions }) => {
  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    const map = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
      if (!tx.date) continue;
      const monthKey = tx.date.slice(0, 7); // YYYY-MM
      const current = map.get(monthKey) || { income: 0, expense: 0 };
      if (tx.type === 'income') {
        current.income += Number(tx.amount) || 0;
      } else {
        current.expense += Number(tx.amount) || 0;
      }
      map.set(monthKey, current);
    }

    if (map.size === 0) {
      // Show current month with 0 baseline so chart axes stay visible & transparent
      const nowKey = new Date().toISOString().slice(0, 7);
      return [
        {
          monthKey: nowKey,
          label: formatThaiMonthLabel(nowKey),
          income: 0,
          expense: 0,
          net: 0,
        },
      ];
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, val]) => ({
        monthKey,
        label: formatThaiMonthLabel(monthKey),
        income: val.income,
        expense: val.expense,
        net: val.income - val.expense,
      }));
  }, [transactions]);

  const hasTransactions = transactions.length > 0;

  return (
    <div className="glass-card p-5 md:p-6 rounded-3xl shadow-sm border border-white/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span>กราฟสรุปยอดรายรับ-รายจ่ายรายเดือน</span>
          </h3>
          <p className="text-xs text-slate-500">
            แสดงภาพรวมการรับ-จ่ายเงินกองทุนหมู่บ้านแบบโปร่งใส เพื่อให้ลูกบ้านติดตามสถานะการเงินได้ง่าย
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/70">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            รายรับ
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-semibold border border-rose-200/70">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            รายจ่าย
          </span>
        </div>
      </div>

      <div className="relative w-full h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `฿${value.toLocaleString()}`}
              width={70}
            />
            <Tooltip
              cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0]?.payload as MonthlyPoint | undefined;
                if (!point) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3 text-xs space-y-1.5 min-w-[180px]">
                    <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                      เดือน {label}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-emerald-700 font-medium">รายรับรวม:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        +฿{point.income.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-rose-700 font-medium">รายจ่ายรวม:</span>
                      <span className="font-mono font-bold text-rose-600">
                        -฿{point.expense.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                      <span className="text-slate-600 font-semibold">สุทธิประจำเดือน:</span>
                      <span
                        className={`font-mono font-extrabold ${
                          point.net >= 0 ? 'text-amber-600' : 'text-rose-700'
                        }`}
                      >
                        {point.net >= 0 ? '+' : ''}฿{point.net.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs font-semibold text-slate-700">{value}</span>
              )}
            />
            <Bar
              dataKey="income"
              name="รายรับ (บาท)"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
            <Bar
              dataKey="expense"
              name="รายจ่าย (บาท)"
              fill="#f43f5e"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>

        {!hasTransactions && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xs border border-amber-200/80 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-2 text-xs text-slate-600">
              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
              <span>ยังไม่มีข้อมูลรายรับ-รายจ่าย กราฟจะแสดงผลอัตโนมัติเมื่อมีการบันทึกรายการ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
