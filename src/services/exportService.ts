import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import {
  Resident,
  FundTransaction,
  RepairTicket,
  FacilityBooking,
  VillageAnnouncement,
  VillageLeader,
} from '../types/village';
import type { TabKey } from '../components/Sidebar';

export interface AppExportData {
  residents: Resident[];
  fundTransactions: FundTransaction[];
  repairTickets: RepairTicket[];
  bookings: FacilityBooking[];
  announcements: VillageAnnouncement[];
  leaders: VillageLeader[];
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
  return `"${str}"`;
}

export function downloadCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>
): void {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTabCsv(tab: TabKey, data: AppExportData): string {
  const dateStamp = new Date().toISOString().slice(0, 10);

  switch (tab) {
    case 'leaders': {
      const filename = `ทำเนียบผู้นำ_หมู่7_${dateStamp}.csv`;
      downloadCsvFile(
        filename,
        ['ชื่อ-นามสกุล', 'ตำแหน่ง', 'บทบาท', 'เบอร์โทรศัพท์', 'บ้านเลขที่', 'ซอย/คุ้ม', 'Line ID', 'หน้าที่รับผิดชอบ'],
        data.leaders.map((l) => [
          l.name,
          l.positionTitle,
          l.role === 'headman' ? 'ผู้ใหญ่บ้าน' : 'ผู้ช่วยผู้ใหญ่บ้าน',
          l.phone,
          l.houseNo || '-',
          l.soi || '-',
          l.lineId || '-',
          l.responsibility,
        ])
      );
      return filename;
    }

    case 'residents': {
      const filename = `ทะเบียนราษฎร์_หมู่7_${dateStamp}.csv`;
      downloadCsvFile(
        filename,
        [
          'เลขประจำตัวประชาชน',
          'คำนำหน้า',
          'ชื่อ',
          'นามสกุล',
          'อายุ',
          'เพศ',
          'บ้านเลขที่',
          'ซอย',
          'เบอร์โทร',
          'อาชีพ',
          'หัวหน้าครอบครัว',
          'ผู้สูงอายุ',
          'ผู้ป่วยติดเตียง/พิการ',
          'สิทธิสวัสดิการ',
        ],
        data.residents.map((r) => [
          r.idCardNumber || '-',
          r.prefix,
          r.firstName,
          r.lastName,
          r.age,
          r.gender,
          r.houseNo,
          r.soi,
          r.phoneNumber || '-',
          r.occupation || '-',
          r.isHeadOfHouse ? 'ใช่' : 'ไม่ใช่',
          r.age >= 60 || r.isElderly ? 'ใช่' : 'ไม่ใช่',
          r.isVulnerable ? 'ใช่' : 'ไม่ใช่',
          (r.welfareBenefits || []).join(' / ') || '-',
        ])
      );
      return filename;
    }

    case 'finance': {
      const filename = `บัญชีการเงินชุมชน_หมู่7_${dateStamp}.csv`;
      downloadCsvFile(
        filename,
        ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน(บาท)', 'ผู้บันทึก', 'เลขอ้างอิง'],
        data.fundTransactions.map((t) => [
          t.date,
          t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
          t.category,
          t.description,
          t.amount,
          t.recordedBy,
          t.receiptRef || '-',
        ])
      );
      return filename;
    }

    case 'repair': {
      const filename = `รายการแจ้งซ่อม_หมู่7_${dateStamp}.csv`;
      const statusMap: Record<string, string> = {
        pending: 'รอดำเนินการ',
        investigating: 'กำลังตรวจสอบ',
        in_progress: 'กำลังแก้ไข',
        resolved: 'เสร็จสิ้น',
      };
      downloadCsvFile(
        filename,
        ['รหัสเรื่อง', 'หัวข้อเรื่อง', 'ประเภท', 'สถานที่', 'ความเร่งด่วน', 'สถานะ', 'ผู้แจ้ง', 'เบอร์โทร', 'วันที่แจ้ง', 'ผู้รับผิดชอบ'],
        data.repairTickets.map((t) => [
          t.ticketCode,
          t.title,
          t.category,
          t.location,
          t.priority,
          statusMap[t.status] || t.status,
          t.reporterName,
          t.reporterPhone || '-',
          t.createdAt.slice(0, 10),
          t.assignedTo || '-',
        ])
      );
      return filename;
    }

    case 'booking': {
      const filename = `รายการยืมคืนอุปกรณ์_หมู่7_${dateStamp}.csv`;
      const statusMap: Record<string, string> = {
        pending: 'รออนุมัติ',
        approved: 'อนุมัติ/กำลังยืม',
        in_use: 'กำลังใช้งาน',
        returned: 'คืนเรียบร้อย',
        cancelled: 'ยกเลิก',
      };
      downloadCsvFile(
        filename,
        ['รหัสจอง', 'รายการอุปกรณ์/สถานที่', 'จำนวน', 'ผู้ยืม', 'บ้านเลขที่', 'เบอร์โทร', 'วันที่เริ่ม', 'วันที่คืน', 'วัตถุประสงค์', 'สถานะ'],
        data.bookings.map((b) => [
          b.bookingCode,
          b.itemName,
          b.quantity,
          b.applicantName,
          b.applicantHouseNo,
          b.applicantPhone || '-',
          b.startDate,
          b.endDate,
          b.purpose,
          statusMap[b.status] || b.status,
        ])
      );
      return filename;
    }

    case 'news': {
      const filename = `ข่าวสารประชาสัมพันธ์_หมู่7_${dateStamp}.csv`;
      downloadCsvFile(
        filename,
        ['วันที่', 'หมวดหมู่', 'ประกาศด่วน', 'หัวข้อประกาศ', 'เนื้อหา', 'ผู้ประกาศ', 'บทพูดเสียงตามสาย'],
        data.announcements.map((a) => [
          a.date,
          a.category,
          a.important ? 'ด่วน' : 'ปกติ',
          a.title,
          a.content,
          a.author,
          a.broadcastScript || '-',
        ])
      );
      return filename;
    }

    case 'dashboard':
    case 'docs':
    default: {
      const totalIncome = data.fundTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const totalExpense = data.fundTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      const filename = `สรุปข้อมูลหมู่บ้าน_หมู่7_${dateStamp}.csv`;
      downloadCsvFile(
        filename,
        ['รายการสรุป', 'ค่าข้อมูล', 'หน่วย'],
        [
          ['ประชากรทั้งหมด', data.residents.length, 'คน'],
          ['จำนวนครัวเรือน', new Set(data.residents.map((r) => r.houseNo)).size, 'หลังคาเรือน'],
          ['ผู้สูงอายุ (60 ปีขึ้นไป)', data.residents.filter((r) => r.isElderly || r.age >= 60).length, 'คน'],
          ['ผู้ป่วยติดเตียง/เปราะบาง', data.residents.filter((r) => r.isVulnerable).length, 'คน'],
          ['รายรับกองทุนสะสม', totalIncome, 'บาท'],
          ['รายจ่ายกองทุนสะสม', totalExpense, 'บาท'],
          ['ยอดเงินคงเหลือสุทธิ', totalIncome - totalExpense, 'บาท'],
          ['เรื่องแจ้งซ่อมค้างดำเนินการ', data.repairTickets.filter((t) => t.status !== 'resolved').length, 'เรื่อง'],
          ['คำขอยืมอุปกรณ์รออนุมัติ', data.bookings.filter((b) => b.status === 'pending').length, 'รายการ'],
          ['ข่าวสารประกาศทั้งหมด', data.announcements.length, 'ประกาศ'],
        ]
      );
      return filename;
    }
  }
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains('no-pdf')) {
        return false;
      }
      return true;
    },
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('ไม่สามารถประมวลผลภาพสำหรับสร้าง PDF ได้'));
    img.src = dataUrl;
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;
  const contentHeightPerPage = pageHeight - margin * 2;

  const imgHeightMm = (img.height * contentWidth) / img.width;

  let heightLeft = imgHeightMm;
  let position = margin;

  pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, imgHeightMm, undefined, 'FAST');
  heightLeft -= contentHeightPerPage;

  while (heightLeft > 1) {
    position = margin - (imgHeightMm - heightLeft);
    pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, imgHeightMm, undefined, 'FAST');
    heightLeft -= contentHeightPerPage;
  }

  pdf.save(filename);
}
