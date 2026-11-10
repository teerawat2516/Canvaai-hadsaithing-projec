import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Search,
  Download,
  Calendar,
  X,
  FileText,
  Filter,
  CheckCircle2,
  TrendingUp,
  Tag,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { FundTransaction, UserRole } from '../types/village';
import { VILLAGE_META } from '../data/initialData';

interface FinanceViewProps {
  transactions: FundTransaction[];
  currentRole: UserRole;
  onAddTransaction: (transaction: FundTransaction) => void;
  onPrintTransaction?: (transaction: FundTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onClearAllTransactions?: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  currentRole,
  onAddTransaction,
  onPrintTransaction,
  onDeleteTransaction,
  onClearAllTransactions,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');

  // Transaction form state
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'income' as 'income' | 'expense',
    category: 'เงินสนับสนุน อบต.สร้างนางขาว',
    amount: 1000,
    description: '',
    recordedBy: 'นางสมศรี มีสุข (เหรัญญิก)',
    receiptRef: '',
  });

  // Financial aggregates
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category)));
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filterType === 'all' || t.type === filterType;
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        (t.recordedBy && t.recordedBy.toLowerCase().includes(searchLower)) ||
        (t.receiptRef && t.receiptRef.toLowerCase().includes(searchLower));

      return matchType && matchCat && matchSearch;
    });
  }, [transactions, filterType, selectedCategory, searchTerm]);

  const handleOpenAddModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      type: type,
      category: type === 'income' ? 'เงินสนับสนุน อบต.สร้างนางขาว' : 'ค่าบำรุงรักษาไฟฟ้าส่องสว่าง',
      amount: 500,
      description: '',
      recordedBy: 'นางสมศรี มีสุข (เหรัญญิก)',
      receiptRef: `TX-${Date.now().toString().slice(-6)}`,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) {
      alert('กรุณากรอกรายละเอียดและจำนวนเงินที่ถูกต้อง');
      return;
    }

    const newTx: FundTransaction = {
      id: `tx-${Date.now()}`,
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      recordedBy: form.recordedBy,
      receiptRef: form.receiptRef || undefined,
    };

    onAddTransaction(newTx);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน(บาท)', 'ผู้บันทึก', 'เลขอ้างอิง'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category,
      t.description,
      t.amount,
      t.recordedBy,
      t.receiptRef || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `บัญชีการเงิน_หมู่7_สร้างนางขาว_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-600" />
            <span>บัญชีการเงินชุมชน (กองทุนหมู่บ้าน หมู่ 7)</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            สมุดบัญชีรายรับ-รายจ่าย เงินกองทุนเพื่อการพัฒนาหมู่บ้านหาดทรายทอง ต.สร้างนางขาว
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition flex items-center gap-1.5"
            title="ส่งออกบัญชีการเงินเป็น Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก CSV</span>
          </button>

          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => handleOpenAddModal('income')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกรายรับ</span>
              </button>
              <button
                onClick={() => handleOpenAddModal('expense')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>- บันทึกรายจ่าย</span>
              </button>
              {onClearAllTransactions && (
                <button
                  onClick={() => {
                    if (window.confirm('ยืนยันเคลียร์ยอดรายรับ-รายจ่ายทั้งหมดให้เป็น 0 บาทใช่หรือไม่? ข้อมูลทั้งหมดจะถูกรีเซ็ต')) {
                      onClearAllTransactions();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-2xs transition flex items-center gap-1.5"
                  title="เคลียร์ยอดรายรับ-รายจ่ายทั้งหมดให้เป็น 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>เคลียร์ยอดเป็น 0</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Fund Balance */}
        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-amber-500 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>ยอดเงินกองทุนคงเหลือสุทธิ</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ฿{currentBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            พร้อมตรวจสอบโดยคณะกรรมการหมู่บ้าน (กม.) หมู่ 7
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>รายรับรวมสะสม</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 font-mono">
            +฿{totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            งบสนับสนุน อบต.สร้างนางขาว, ค่าเช่าเต็นท์/อุปกรณ์, เงินบริจาค
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-rose-500 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>รายจ่ายรวมสะสม</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-600 font-mono">
            -฿{totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 pt-1">
            ค่าซ่อมบำรุงไฟทาง, น้ำมันตัดหญ้า, วัสดุพัฒนาชุมชน
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Type Toggle */}
        <div className="flex gap-1.5 items-center w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> ประเภท:
          </span>
          {[
            { id: 'all' as const, label: 'ทั้งหมด' },
            { id: 'income' as const, label: 'รายรับ (+)' },
            { id: 'expense' as const, label: 'รายจ่าย (-)' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterType === item.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/70 text-slate-600 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-amber-500"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายละเอียด..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">วันที่</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">รายละเอียดรายการ</th>
                <th className="py-3 px-4 text-right">จำนวนเงิน (บาท)</th>
                <th className="py-3 px-4">ผู้บันทึก / อ้างอิง</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wallet className="w-10 h-10 text-amber-500/40" />
                      <span className="font-semibold text-sm text-slate-700">ยอดรายรับ-รายจ่ายปัจจุบันเป็น 0 บาท</span>
                      <span className="text-xs text-slate-400">ยังไม่มีรายการบันทึก สามารถกด "+ บันทึกรายรับ" หรือ "- บันทึกรายจ่าย" ด้านบนเพื่อเพิ่มรายการใหม่</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/60 transition">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.type === 'income' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" /> รายรับ
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-rose-600" /> รายจ่าย
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md font-medium">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold font-mono text-sm whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      <div>{tx.recordedBy}</div>
                      {tx.receiptRef && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          อ้างอิง: {tx.receiptRef}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {onPrintTransaction && (
                          <button
                            onClick={() => onPrintTransaction(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="พิมพ์ใบสำคัญรับเงิน / ใบเสร็จ"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {currentRole === 'admin' && onDeleteTransaction && (
                          <button
                            onClick={() => {
                              if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Income or Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                <span>
                  {form.type === 'income' ? 'บันทึกรายรับกองทุน' : 'บันทึกรายจ่ายกองทุน'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs md:text-sm">
              {/* Type Switch */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">ประเภทรายการ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        type: 'income',
                        category: 'เงินสนับสนุน อบต.สร้างนางขาว',
                      })
                    }
                    className={`py-2 rounded-xl font-bold border transition ${
                      form.type === 'income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + รายรับ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        type: 'expense',
                        category: 'ค่าบำรุงรักษาไฟฟ้าส่องสว่าง',
                      })
                    }
                    className={`py-2 rounded-xl font-bold border transition ${
                      form.type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - รายจ่าย
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">วันที่ทำรายการ</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">หมวดหมู่รายการ</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder={
                    form.type === 'income'
                      ? 'เช่น เงินสนับสนุน อบต., ค่าเช่าเต็นท์, เงินบริจาค'
                      : 'เช่น ค่าซ่อมไฟทาง, ค่าน้ำมันตัดหญ้า, ค่าอุปกรณ์'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">จำนวนเงิน (บาท) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-base font-bold text-slate-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">รายละเอียดรายการ *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  placeholder="ระบุที่มา วัตถุประสงค์ หรือสถานที่ เช่น ซื้อหลอดไฟ LED ซ่อมไฟทาง 3 จุด"
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              {/* Recorded by & Ref */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ผู้บันทึก</label>
                  <input
                    type="text"
                    value={form.recordedBy}
                    onChange={(e) => setForm({ ...form, recordedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เลขที่ใบเสร็จ/อ้างอิง</label>
                  <input
                    type="text"
                    placeholder="เช่น REC-001 หรือ อบต-098"
                    value={form.receiptRef}
                    onChange={(e) => setForm({ ...form, receiptRef: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md transition ${
                    form.type === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  }`}
                >
                  บันทึก{form.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
