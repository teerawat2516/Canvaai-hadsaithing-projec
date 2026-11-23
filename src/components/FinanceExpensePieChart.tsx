import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { PieChart as PieChartIcon, Award, Tag } from 'lucide-react';
import { FundTransaction } from '../types/village';

interface FinanceExpensePieChartProps {
  transactions: FundTransaction[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface ExpenseCategoryItem {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  dotClass: string;
}

const CATEGORY_PALETTE = [
  { hex: '#f43f5e', dotClass: 'bg-rose-500' },
  { hex: '#f97316', dotClass: 'bg-orange-500' },
  { hex: '#eab308', dotClass: 'bg-amber-500' },
  { hex: '#8b5cf6', dotClass: 'bg-violet-500' },
  { hex: '#06b6d4', dotClass: 'bg-cyan-500' },
  { hex: '#14b8a6', dotClass: 'bg-teal-500' },
  { hex: '#ec4899', dotClass: 'bg-pink-500' },
  { hex: '#6366f1', dotClass: 'bg-indigo-500' },
];

export const FinanceExpensePieChart: React.FC<FinanceExpensePieChartProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
}) => {
  const { categories, totalExpense } = useMemo(() => {
    const grouped = new Map<string, { amount: number; count: number }>();

    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const amount = Number(tx.amount) || 0;
      if (amount <= 0) continue;

      const cat = (tx.category || '').trim() || 'ไม่ระบุหมวดหมู่';
      const existing = grouped.get(cat) || { amount: 0, count: 0 };
      existing.amount += amount;
      existing.count += 1;
      grouped.set(cat, existing);
    }

    const total = Array.from(grouped.values()).reduce((sum, item) => sum + item.amount, 0);

    const sorted: ExpenseCategoryItem[] = Array.from(grouped.entries())
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([category, data], index) => {
        const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
        return {
          category,
          amount: data.amount,
          count: data.count,
          percentage: total > 0 ? (data.amount / total) * 100 : 0,
          color: palette.hex,
          dotClass: palette.dotClass,
        };
      });

    return { categories: sorted, totalExpense: total };
  }, [transactions]);

  const hasExpenses = categories.length > 0;
  const topCategory = hasExpenses ? categories[0] : null;

  const placeholderData = [{ category: 'ยังไม่มีรายจ่าย', amount: 1, color: '#e2e8f0' }];

  return (
    <div className="glass-card p-5 md:p-6 rounded-3xl shadow-sm border border-white/80 flex flex-col justify-between gap-4 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-rose-500 shrink-0" />
            <span>สรุปรายจ่ายสะสมตามหมวดหมู่</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            วิเคราะห์สัดส่วนการใช้จ่ายเงินกองทุนหมู่บ้านเพื่อความโปร่งใส
          </p>
        </div>

        {hasExpenses && (
          <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/70 text-[11px] font-bold whitespace-nowrap">
            {categories.length} หมวดหมู่
          </span>
        )}
      </div>

      {/* Top Expense Highlight Banner */}
      {topCategory && (
        <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50/80 border border-rose-200/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-rose-600">
                หมวดหมู่ที่ใช้จ่ายสูงสุด
              </div>
              <div className="text-xs md:text-sm font-bold text-slate-800 truncate">
                {topCategory.category}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono font-extrabold text-sm text-rose-600">
              ฿{topCategory.amount.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              {topCategory.percentage.toFixed(1)}% ของรายจ่าย
            </div>
          </div>
        </div>
      )}

      {/* Pie Chart + Ranked List */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
        {/* Donut Pie Chart */}
        <div className="sm:col-span-6 relative h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasExpenses ? categories : placeholderData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="84%"
                paddingAngle={hasExpenses && categories.length > 1 ? 3 : 0}
                stroke="none"
                isAnimationActive={hasExpenses}
                onClick={(_data, index) => {
                  const clicked = categories[index];
                  if (hasExpenses && onSelectCategory && clicked?.category) {
                    onSelectCategory(
                      selectedCategory === clicked.category ? 'all' : clicked.category
                    );
                  }
                }}
              >
                {(hasExpenses ? categories : placeholderData).map((item, idx) => {
                  const isSelected = selectedCategory === item.category;
                  const isDimmed =
                    Boolean(selectedCategory) &&
                    selectedCategory !== 'all' &&
                    !isSelected;
                  return (
                    <Cell
                      key={`cell-${item.category}-${idx}`}
                      fill={item.color}
                      opacity={isDimmed ? 0.35 : 1}
                      className={hasExpenses && onSelectCategory ? 'cursor-pointer outline-none' : 'outline-none'}
                    />
                  );
                })}
              </Pie>

              {hasExpenses && (
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0]?.payload as ExpenseCategoryItem | undefined;
                    if (!item) return null;
                    return (
                      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3 text-xs space-y-1 min-w-[180px] z-20">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
                          <span className="truncate">{item.category}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">ยอดสะสม:</span>
                          <span className="font-mono font-bold text-rose-600">
                            ฿{item.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">สัดส่วน:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-500">จำนวนรายการ:</span>
                          <span className="font-semibold text-slate-700">
                            {item.count} รายการ
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              รายจ่ายรวม
            </span>
            <span
              className={`font-mono font-extrabold text-sm md:text-base ${
                hasExpenses ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              ฿{totalExpense.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Category Breakdown List */}
        <div className="sm:col-span-6 space-y-2 max-h-56 overflow-y-auto pr-1">
          {!hasExpenses ? (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 text-center space-y-1.5">
              <Tag className="w-6 h-6 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-600">
                ยังไม่มีรายการรายจ่ายสะสม
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                กราฟจะคำนวณสัดส่วนและจัดอันดับหมวดหมู่ที่ใช้จ่ายสูงสุดอัตโนมัติเมื่อมีการบันทึกรายจ่าย
              </p>
            </div>
          ) : (
            categories.map((item, idx) => {
              const isSelected = selectedCategory === item.category;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(isSelected ? 'all' : item.category);
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition space-y-1.5 ${
                    isSelected
                      ? 'bg-rose-50/90 border-rose-300 shadow-2xs'
                      : 'bg-white/70 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} />
                      <span className="font-semibold text-slate-700 truncate">
                        {idx + 1}. {item.category}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 shrink-0">
                      ฿{item.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar + percentage */}
                  <div className="flex items-center gap-2">
                    <svg
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      viewBox="0 0 100 6"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect x="0" y="0" width="100" height="6" fill="#f1f5f9" rx="3" />
                      <rect
                        x="0"
                        y="0"
                        width={Math.min(100, Math.max(2, item.percentage))}
                        height="6"
                        fill={item.color}
                        rx="3"
                      />
                    </svg>
                    <span className="text-[10px] font-mono font-bold text-slate-500 w-11 text-right shrink-0">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
