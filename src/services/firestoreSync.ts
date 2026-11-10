import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Resident,
  GarbagePayment,
  FundTransaction,
  RepairTicket,
  FacilityBooking,
  VillageAnnouncement
} from '../types/village';
import {
  INITIAL_RESIDENTS,
  INITIAL_GARBAGE_PAYMENTS,
  INITIAL_FUND_TRANSACTIONS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_BOOKINGS,
  INITIAL_ANNOUNCEMENTS
} from '../data/initialData';

// Helper to seed initial data if Firestore collection is empty
export async function seedFirestoreIfEmpty() {
  try {
    const resSnap = await getDocs(collection(db, 'residents'));
    if (resSnap.empty) {
      console.log('Seeding initial village data into Firebase (Canvaai-hadsaithing projec)...');
      const batch = writeBatch(db);

      // Seed Residents
      for (const r of INITIAL_RESIDENTS) {
        batch.set(doc(db, 'residents', r.id), r);
      }
      // Seed Garbage Payments
      for (const gp of INITIAL_GARBAGE_PAYMENTS) {
        batch.set(doc(db, 'garbagePayments', gp.id), gp);
      }
      // Seed Fund Transactions
      for (const tx of INITIAL_FUND_TRANSACTIONS) {
        batch.set(doc(db, 'fundTransactions', tx.id), tx);
      }
      // Seed Repair Tickets
      for (const rep of INITIAL_REPAIR_TICKETS) {
        batch.set(doc(db, 'repairTickets', rep.id), rep);
      }
      // Seed Bookings
      for (const bk of INITIAL_BOOKINGS) {
        batch.set(doc(db, 'bookings', bk.id), bk);
      }
      // Seed Announcements
      for (const ann of INITIAL_ANNOUNCEMENTS) {
        batch.set(doc(db, 'announcements', ann.id), ann);
      }

      await batch.commit();
      console.log('Seeded Firebase Firestore successfully!');
      // If already seeded, ensure headman r1 record is up to date with นายอำนาจ พันนาขา
      const r1Ref = doc(db, 'residents', 'r1');
      const r1Snap = await getDoc(r1Ref);
      if (r1Snap.exists() && r1Snap.data()?.lastName !== 'พันนาขา') {
        await setDoc(r1Ref, INITIAL_RESIDENTS[0], { merge: true });
      }

      // Check and clear any old sample transactions to guarantee total is 0 as requested
      const oldTx1 = await getDoc(doc(db, 'fundTransactions', 'tx-1'));
      if (oldTx1.exists()) {
        await clearAllFundTransactions();
      }
    }
  } catch (error) {
    console.warn('Initial seeding note (will use existing or offline):', error);
  }
}

// Subscriptions
export function subscribeResidents(
  onUpdate: (residents: Resident[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'residents';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: Resident[] = [];
      snapshot.forEach((d) => items.push(d.data() as Resident));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to residents:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

export function subscribeGarbagePayments(
  onUpdate: (payments: GarbagePayment[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'garbagePayments';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: GarbagePayment[] = [];
      snapshot.forEach((d) => items.push(d.data() as GarbagePayment));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to garbagePayments:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

export function subscribeFundTransactions(
  onUpdate: (transactions: FundTransaction[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'fundTransactions';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: FundTransaction[] = [];
      snapshot.forEach((d) => items.push(d.data() as FundTransaction));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to fundTransactions:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

export function subscribeRepairTickets(
  onUpdate: (tickets: RepairTicket[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'repairTickets';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: RepairTicket[] = [];
      snapshot.forEach((d) => items.push(d.data() as RepairTicket));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to repairTickets:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

export function subscribeBookings(
  onUpdate: (bookings: FacilityBooking[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'bookings';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: FacilityBooking[] = [];
      snapshot.forEach((d) => items.push(d.data() as FacilityBooking));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to bookings:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

export function subscribeAnnouncements(
  onUpdate: (announcements: VillageAnnouncement[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'announcements';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: VillageAnnouncement[] = [];
      snapshot.forEach((d) => items.push(d.data() as VillageAnnouncement));
      onUpdate(items);
    },
    (err) => {
      console.error('Error subscribing to announcements:', err);
      onError?.(err);
      handleFirestoreError(err, OperationType.LIST, colPath);
    }
  );
}

// Writes
export async function syncResident(resident: Resident) {
  const path = `residents/${resident.id}`;
  try {
    await setDoc(doc(db, 'residents', resident.id), resident, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeResident(id: string) {
  const path = `residents/${id}`;
  try {
    await deleteDoc(doc(db, 'residents', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function syncGarbagePayment(payment: GarbagePayment) {
  const path = `garbagePayments/${payment.id}`;
  try {
    await setDoc(doc(db, 'garbagePayments', payment.id), payment, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncFundTransaction(tx: FundTransaction) {
  const path = `fundTransactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'fundTransactions', tx.id), tx, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeFundTransaction(id: string) {
  const path = `fundTransactions/${id}`;
  try {
    await deleteDoc(doc(db, 'fundTransactions', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function clearAllFundTransactions() {
  const colPath = 'fundTransactions';
  try {
    const snap = await getDocs(collection(db, colPath));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      console.log('Cleared all fund transactions in Firestore to 0');
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, colPath);
  }
}

export async function syncRepairTicket(ticket: RepairTicket) {
  const path = `repairTickets/${ticket.id}`;
  try {
    await setDoc(doc(db, 'repairTickets', ticket.id), ticket, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncBooking(booking: FacilityBooking) {
  const path = `bookings/${booking.id}`;
  try {
    await setDoc(doc(db, 'bookings', booking.id), booking, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function syncAnnouncement(ann: VillageAnnouncement) {
  const path = `announcements/${ann.id}`;
  try {
    await setDoc(doc(db, 'announcements', ann.id), ann, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
