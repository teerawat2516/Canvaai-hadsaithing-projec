import Swal from 'sweetalert2';

export type NotifyType = 'success' | 'error' | 'info' | 'warning';

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3400,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function notifyToast(text: string, type: NotifyType = 'info') {
  return Toast.fire({
    icon: type,
    title: text,
  });
}

export function notifyAlert(
  title: string,
  text?: string,
  icon: NotifyType = 'warning'
) {
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#059669',
  });
}

export async function notifyConfirm(
  title: string,
  text?: string,
  confirmButtonText = 'ยืนยัน',
  icon: NotifyType = 'warning'
): Promise<boolean> {
  const result = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  });
  return Boolean(result.isConfirmed);
}
