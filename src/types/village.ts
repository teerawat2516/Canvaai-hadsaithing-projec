export type UserRole = 'admin' | 'resident';

export interface Resident {
  id: string;
  idCardNumber: string;
  prefix: 'นาย' | 'นาง' | 'นางสาว' | 'เด็กชาย' | 'เด็กหญิง';
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: 'ชาย' | 'หญิง';
  houseNo: string;
  soi: string;
  phoneNumber: string;
  occupation: string;
  isHeadOfHouse: boolean;
  isElderly: boolean; // 60+
  isVulnerable: boolean; // ผู้พิการ หรือผู้ป่วยติดเตียง
  vulnerabilityNote?: string;
  welfareBenefits: string[]; // เช่น 'เบี้ยยังชีพผู้สูงอายุ', 'บัตรสวัสดิการแห่งรัฐ', 'อสม.'
  medicalNote?: string;
}

export interface Household {
  houseNo: string;
  soi: string;
  headName: string;
  memberCount: number;
  garbageFeeStatus: 'paid' | 'unpaid' | 'exempt';
  lastPaidMonth?: string;
  phone: string;
}

export interface GarbagePayment {
  id: string;
  receiptNumber: string;
  houseNo: string;
  payerName: string;
  amount: number;
  month: string; // เช่น 'มีนาคม 2569'
  paymentDate: string;
  paymentMethod: 'cash' | 'transfer';
  collectorName: string;
  note?: string;
}

export interface FundTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string; // เช่น 'ค่าธรรมเนียมขยะ', 'ค่าเช่าอุปกรณ์', 'ค่าซ่อมบำรุงไฟฟ้า', 'เงินสนับสนุน อบต.'
  amount: number;
  description: string;
  recordedBy: string;
  receiptRef?: string;
}

export type RepairCategory = 'streetlight' | 'road' | 'water_pipe' | 'waste' | 'animal' | 'noise' | 'other';
export type RepairStatus = 'pending' | 'investigating' | 'in_progress' | 'resolved';
export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RepairTicket {
  id: string;
  ticketCode: string;
  category: RepairCategory;
  title: string;
  description: string;
  location: string; // เช่น 'หน้าบ้านเลขที่ 45 ซอย 3'
  reporterName: string;
  reporterPhone: string;
  reporterHouseNo: string;
  status: RepairStatus;
  priority: RepairPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolutionNote?: string;
  estimatedCost?: number;
}

export interface FacilityBooking {
  id: string;
  bookingCode: string;
  applicantName: string;
  applicantHouseNo: string;
  applicantPhone: string;
  itemType: 'facility' | 'equipment';
  itemName: string; // เช่น 'ศาลาประชาคม', 'เต็นท์ขนาด 4x8', 'เก้าอี้พลาสติก 50 ตัว'
  quantity: number;
  startDate: string;
  endDate: string;
  purpose: string; // เช่น 'งานทำบุญบ้าน', 'งานศพ', 'ประชุมกลุ่มเกษตร'
  status: 'pending' | 'approved' | 'in_use' | 'returned' | 'cancelled';
  depositAmount: number;
  note?: string;
}

export interface VillageAnnouncement {
  id: string;
  title: string;
  content: string;
  broadcastScript?: string; // บทประกาศสำหรับหอกระจายข่าว (เสียงตามสาย)
  category: 'urgent' | 'activity' | 'general' | 'health';
  date: string;
  author: string;
  important: boolean;
}

export interface CommitteeMember {
  id: string;
  name: string;
  position: string; // เช่น 'ผู้ใหญ่บ้าน', 'ผู้ช่วยผู้ใหญ่บ้านฝ่ายปกครอง', 'ประธาน อสม.', 'เหรัญญิกหมู่บ้าน'
  phone: string;
  soi: string;
  responsibility: string;
}
