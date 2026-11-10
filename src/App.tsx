import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Sidebar, TabKey } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ResidentsView } from './components/ResidentsView';
import { FinanceView } from './components/FinanceView';
import { RepairView } from './components/RepairView';
import { BookingView } from './components/BookingView';
import { NewsView } from './components/NewsView';
import { OfficialDocsView } from './components/OfficialDocsView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { PrintableReceipt } from './components/PrintableReceipt';
import { FirebaseConnectionStatus } from './components/FirebaseStatusIndicator';
import { testFirebaseConnection } from './services/firebase';
import {
  seedFirestoreIfEmpty,
  subscribeResidents,
  subscribeGarbagePayments,
  subscribeFundTransactions,
  subscribeRepairTickets,
  subscribeBookings,
  subscribeAnnouncements,
  syncResident,
  removeResident,
  syncGarbagePayment,
  syncFundTransaction,
  removeFundTransaction,
  clearAllFundTransactions,
  syncRepairTicket,
  syncBooking,
  syncAnnouncement,
} from './services/firestoreSync';
import {
  UserRole,
  Resident,
  GarbagePayment,
  FundTransaction,
  RepairTicket,
  FacilityBooking,
  VillageAnnouncement
} from './types/village';
import {
  INITIAL_RESIDENTS,
  INITIAL_GARBAGE_PAYMENTS,
  INITIAL_FUND_TRANSACTIONS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_BOOKINGS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_COMMITTEE,
  VILLAGE_META
} from './data/initialData';

export default function App() {
  // Role State
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('village_role') as UserRole) || 'admin';
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Firebase Real-time Connection Status (connected: green light, disconnected: red light)
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>('connecting');

  // App Data with LocalStorage Cache fallback
  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem('village_residents_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RESIDENTS;
      }
    }
    return INITIAL_RESIDENTS;
  });

  const [garbagePayments, setGarbagePayments] = useState<GarbagePayment[]>(() => {
    const saved = localStorage.getItem('village_garbage_payments');
    return saved ? JSON.parse(saved) : INITIAL_GARBAGE_PAYMENTS;
  });

  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>(() => {
    const saved = localStorage.getItem('village_fund_transactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_FUND_TRANSACTIONS;
  });

  const [repairTickets, setRepairTickets] = useState<RepairTicket[]>(() => {
    const saved = localStorage.getItem('village_repair_tickets');
    return saved ? JSON.parse(saved) : INITIAL_REPAIR_TICKETS;
  });

  const [bookings, setBookings] = useState<FacilityBooking[]>(() => {
    const saved = localStorage.getItem('village_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [announcements, setAnnouncements] = useState<VillageAnnouncement[]>(() => {
    const saved = localStorage.getItem('village_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);

  // Printable Receipt / Voucher
  const [activeReceipt, setActiveReceipt] = useState<FundTransaction | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Connection Checker Function
  const checkConnection = useCallback(async () => {
    setFirebaseStatus('connecting');
    const isOk = await testFirebaseConnection();
    if (isOk) {
      setFirebaseStatus('connected');
      showToast('🟢 เชื่อมต่อ Firebase สำเร็จ (Canvaai-hadsaithing projec)', 'success');
    } else {
      setFirebaseStatus('disconnected');
      showToast('🔴 ยังไม่ได้เชื่อมต่อ Firebase (กำลังทำงานในโหมด Offline)', 'error');
    }
  }, [showToast]);

  // Boot: Test connection, seed data if empty, and attach real-time listeners
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    const initFirebase = async () => {
      await checkConnection();

      // Seed if Firestore has no documents
      await seedFirestoreIfEmpty();

      // Listen to residents
      const unSubRes = subscribeResidents(
        (items) => {
          if (items && items.length > 0) {
            setResidents(items);
            localStorage.setItem('village_residents_v2', JSON.stringify(items));
          }
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubRes);

      // Listen to garbage payments
      const unSubGarb = subscribeGarbagePayments(
        (items) => {
          if (items && items.length > 0) {
            setGarbagePayments(items);
            localStorage.setItem('village_garbage_payments', JSON.stringify(items));
          }
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubGarb);

      // Listen to fund transactions
      const unSubFund = subscribeFundTransactions(
        (items) => {
          setFundTransactions(items || []);
          localStorage.setItem('village_fund_transactions_v2', JSON.stringify(items || []));
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubFund);

      // Listen to repair tickets
      const unSubRep = subscribeRepairTickets(
        (items) => {
          if (items && items.length > 0) {
            setRepairTickets(items);
            localStorage.setItem('village_repair_tickets', JSON.stringify(items));
          }
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubRep);

      // Listen to bookings
      const unSubBk = subscribeBookings(
        (items) => {
          if (items && items.length > 0) {
            setBookings(items);
            localStorage.setItem('village_bookings', JSON.stringify(items));
          }
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubBk);

      // Listen to announcements
      const unSubAnn = subscribeAnnouncements(
        (items) => {
          if (items && items.length > 0) {
            setAnnouncements(items);
            localStorage.setItem('village_announcements', JSON.stringify(items));
          }
        },
        () => setFirebaseStatus('disconnected')
      );
      unsubs.push(unSubAnn);
    };

    initFirebase();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [checkConnection]);

  // Sync state to LocalStorage as secondary offline backup
  useEffect(() => {
    localStorage.setItem('village_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('village_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('village_garbage_payments', JSON.stringify(garbagePayments));
  }, [garbagePayments]);

  useEffect(() => {
    localStorage.setItem('village_fund_transactions_v2', JSON.stringify(fundTransactions));
  }, [fundTransactions]);

  useEffect(() => {
    localStorage.setItem('village_repair_tickets', JSON.stringify(repairTickets));
  }, [repairTickets]);

  useEffect(() => {
    localStorage.setItem('village_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('village_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const handleToggleRole = () => {
    setCurrentRole((prev) => {
      const nextRole = prev === 'admin' ? 'resident' : 'admin';
      showToast(
        nextRole === 'admin'
          ? 'สลับเป็นโหมด: ผู้ดูแลระบบ (Admin / ผู้ใหญ่บ้าน)'
          : 'สลับเป็นโหมด: ชาวบ้าน / ลูกบ้านหมู่ 7',
        'info'
      );
      return nextRole;
    });
  };

  const handleOpenAiAssistant = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAiModalOpen(true);
  };

  // Resident Handlers (Sync to Firebase)
  const handleSaveResident = async (res: Resident) => {
    setResidents((prev) => {
      const index = prev.findIndex((r) => r.id === res.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = res;
        return next;
      }
      return [res, ...prev];
    });

    try {
      await syncResident(res);
      showToast(`บันทึกข้อมูลราษฎร: ${res.prefix}${res.firstName} ${res.lastName} สำเร็จและซิงค์ Firebase แล้ว`, 'success');
    } catch {
      showToast(`บันทึกข้อมูลในเครื่องแล้ว (Firebase ออฟไลน์)`, 'info');
    }
  };

  const handleDeleteResident = async (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
    try {
      await removeResident(id);
      showToast('ลบข้อมูลใน Firebase เรียบร้อยแล้ว', 'success');
    } catch {
      showToast('ลบข้อมูลเรียบร้อยแล้ว', 'info');
    }
  };

  // Finance Handlers (Sync to Firebase)
  const handleAddPayment = async (payment: GarbagePayment) => {
    setGarbagePayments((prev) => [payment, ...prev]);

    const fundTx: FundTransaction = {
      id: `tx-garb-${payment.id}`,
      date: payment.paymentDate,
      type: 'income',
      category: 'ค่าธรรมเนียมจัดเก็บขยะ',
      amount: payment.amount,
      description: `ค่าขยะบ้านเลขที่ ${payment.houseNo} (${payment.payerName}) รอบ ${payment.month}`,
      recordedBy: payment.collectorName,
      receiptRef: payment.receiptNumber,
    };
    setFundTransactions((prev) => [fundTx, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      await syncGarbagePayment(payment);
      await syncFundTransaction(fundTx);
      showToast(`บันทึกชำระค่าขยะบ้านเลขที่ ${payment.houseNo} ฿${payment.amount} ลง Firebase เรียบร้อย`, 'success');
    } catch {
      showToast(`บันทึกชำระค่าขยะแล้ว (ออฟไลน์)`, 'info');
    }
  };

  const handleAddTransaction = async (tx: FundTransaction) => {
    setFundTransactions((prev) => [tx, ...prev]);
    try {
      await syncFundTransaction(tx);
      showToast(`บันทึก${tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'} ฿${tx.amount.toLocaleString()} ลง Firebase สำเร็จ`, 'success');
    } catch {
      showToast(`บันทึกรายการสำเร็จ`, 'info');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setFundTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await removeFundTransaction(id);
      showToast('ลบรายการบัญชีการเงินเรียบร้อยแล้ว', 'info');
    } catch {
      showToast('ลบรายการเรียบร้อยแล้ว (ออฟไลน์)', 'info');
    }
  };

  const handleClearAllTransactions = async () => {
    setFundTransactions([]);
    localStorage.setItem('village_fund_transactions_v2', JSON.stringify([]));
    try {
      await clearAllFundTransactions();
      showToast('เคลียร์ยอดรายรับ-รายจ่ายทั้งหมดเป็น 0 บาทเรียบร้อยแล้ว', 'success');
    } catch {
      showToast('เคลียร์ยอดรายรับ-รายจ่ายทั้งหมดเป็น 0 บาทเรียบร้อยแล้ว (ออฟไลน์)', 'info');
    }
  };

  // Repair Ticket Handlers (Sync to Firebase)
  const handleAddTicket = async (ticket: RepairTicket) => {
    setRepairTickets((prev) => [ticket, ...prev]);
    try {
      await syncRepairTicket(ticket);
      showToast(`ส่งเรื่องแจ้งซ่อม "${ticket.title}" ลง Firebase เรียบร้อยแล้ว (${ticket.ticketCode})`, 'success');
    } catch {
      showToast(`ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว (${ticket.ticketCode})`, 'info');
    }
  };

  const handleUpdateTicket = async (ticket: RepairTicket) => {
    setRepairTickets((prev) => {
      const index = prev.findIndex((t) => t.id === ticket.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = ticket;
        return next;
      }
      return prev;
    });

    if (ticket.status === 'resolved') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    try {
      await syncRepairTicket(ticket);
      showToast(`อัปเดตสถานะเรื่อง "${ticket.ticketCode}" ใน Firebase สำเร็จ`, 'success');
    } catch {
      showToast(`อัปเดตสถานะเรื่อง "${ticket.ticketCode}" เรียบร้อย`, 'info');
    }
  };

  // Booking Handlers (Sync to Firebase)
  const handleAddBooking = async (booking: FacilityBooking) => {
    setBookings((prev) => [booking, ...prev]);
    try {
      await syncBooking(booking);
      showToast(`ยื่นคำขอยืม "${booking.itemName}" ลง Firebase เรียบร้อยแล้ว`, 'success');
    } catch {
      showToast(`ยื่นคำขอยืม "${booking.itemName}" เรียบร้อยแล้ว`, 'info');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: FacilityBooking['status']) => {
    const updated = bookings.find((b) => b.id === id);
    if (updated) {
      const newBooking = { ...updated, status };
      setBookings((prev) => prev.map((b) => (b.id === id ? newBooking : b)));
      try {
        await syncBooking(newBooking);
        showToast(`อัปเดตสถานะการยืมเป็น "${status}" ใน Firebase สำเร็จ`, 'success');
      } catch {
        showToast(`อัปเดตสถานะการยืมเป็น "${status}"`, 'info');
      }
    }
  };

  // Announcement Handlers (Sync to Firebase)
  const handleAddAnnouncement = async (ann: VillageAnnouncement) => {
    setAnnouncements((prev) => [ann, ...prev]);
    try {
      await syncAnnouncement(ann);
      showToast(`เผยแพร่ประกาศ "${ann.title}" ลง Firebase เรียบร้อยแล้ว`, 'success');
    } catch {
      showToast(`เผยแพร่ประกาศ "${ann.title}" เรียบร้อยแล้ว`, 'info');
    }
  };

  // Pending counts
  const pendingRepairsCount = repairTickets.filter((t) => t.status !== 'resolved').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  const tabTitles: Record<TabKey, string> = {
    dashboard: 'Dashboard ภาพรวมหมู่บ้าน',
    residents: 'ทะเบียนราษฎร์ (หมู่ 7)',
    finance: 'บัญชีการเงินชุมชน',
    repair: 'แจ้งซ่อม & เรื่องร้องเรียน',
    booking: 'ยืม-คืนอุปกรณ์ & สถานที่',
    news: 'ข่าวสารประชาสัมพันธ์',
    docs: 'ออกหนังสือ & รายงาน',
    ai_advisor: 'AI วางแผนกลยุทธ์หมู่บ้าน',
  };

  // Village context object for Gemini High Thinking
  const villageContext = {
    village: VILLAGE_META,
    totalResidents: residents.length,
    maleCount: residents.filter((r) => r.gender === 'ชาย').length,
    femaleCount: residents.filter((r) => r.gender === 'หญิง').length,
    totalHouseholds: new Set(residents.map((r) => r.houseNo)).size,
    elderlyCount: residents.filter((r) => r.isElderly || r.age >= 60).length,
    vulnerableCount: residents.filter((r) => r.isVulnerable).length,
    openRepairs: repairTickets
      .filter((t) => t.status !== 'resolved')
      .map((t) => ({
        code: t.ticketCode,
        category: t.category,
        title: t.title,
        location: t.location,
        priority: t.priority,
        status: t.status,
      })),
    recentBookings: bookings.filter((b) => b.status === 'approved' || b.status === 'in_use'),
    committee: INITIAL_COMMITTEE,
    firebaseProject: 'Canvaai-hadsaithing projec',
    firebaseConnected: firebaseStatus === 'connected',
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl text-xs md:text-sm font-semibold shadow-2xl border animate-in slide-in-from-top-4 duration-200 flex items-center gap-2.5 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-500/40'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-500/40'
              : 'bg-slate-900 text-white border-white/20'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toastMessage.type === 'success'
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                : toastMessage.type === 'error'
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                : 'bg-sky-400'
            }`}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar with Firebase Connection Status Card */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ai_advisor') {
            setIsAiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentRole={currentRole}
        onToggleRole={handleToggleRole}
        pendingRepairsCount={pendingRepairsCount}
        pendingBookingsCount={pendingBookingsCount}
        firebaseStatus={firebaseStatus}
        onRetryFirebase={checkConnection}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          currentRole={currentRole}
          onToggleRole={handleToggleRole}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenAiAssistant={() => handleOpenAiAssistant()}
          activeTabTitle={tabTitles[activeTab]}
          firebaseStatus={firebaseStatus}
          onRetryFirebase={checkConnection}
        />

        {/* Scrollable View Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              residents={residents}
              fundTransactions={fundTransactions}
              repairTickets={repairTickets}
              bookings={bookings}
              announcements={announcements}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAiAssistant={handleOpenAiAssistant}
              onNewRepairClick={() => setActiveTab('repair')}
              onNewPaymentClick={() => setActiveTab('finance')}
              onNewBookingClick={() => setActiveTab('booking')}
            />
          )}

          {activeTab === 'residents' && (
            <ResidentsView
              residents={residents}
              currentRole={currentRole}
              onSaveResident={handleSaveResident}
              onDeleteResident={handleDeleteResident}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              transactions={fundTransactions}
              currentRole={currentRole}
              onAddTransaction={handleAddTransaction}
              onPrintTransaction={(tx) => setActiveReceipt(tx)}
              onDeleteTransaction={handleDeleteTransaction}
              onClearAllTransactions={handleClearAllTransactions}
            />
          )}

          {activeTab === 'repair' && (
            <RepairView
              tickets={repairTickets}
              currentRole={currentRole}
              onAddTicket={handleAddTicket}
              onUpdateTicket={handleUpdateTicket}
              onOpenAiAdvisor={handleOpenAiAssistant}
            />
          )}

          {activeTab === 'booking' && (
            <BookingView
              bookings={bookings}
              currentRole={currentRole}
              onAddBooking={handleAddBooking}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          )}

          {activeTab === 'news' && (
            <NewsView
              announcements={announcements}
              currentRole={currentRole}
              onAddAnnouncement={handleAddAnnouncement}
              onOpenAiAssistant={handleOpenAiAssistant}
            />
          )}

          {activeTab === 'docs' && (
            <OfficialDocsView
              residents={residents}
              currentRole={currentRole}
              onOpenAiAssistant={handleOpenAiAssistant}
            />
          )}
        </div>
      </main>

      {/* AI Assistant Modal (Gemini 4 Argon with High Thinking Mode) */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        villageContext={villageContext}
        initialPrompt={aiInitialPrompt}
      />

      {/* Printable Receipt / Voucher Modal */}
      {activeReceipt && (
        <PrintableReceipt
          transaction={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
}
