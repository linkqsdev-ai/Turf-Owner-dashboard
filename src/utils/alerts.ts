import Swal from 'sweetalert2';

// Base configuration for consistent theme
const themeConfig = {
  customClass: {
    container: 'swal2-premium-container',
    popup: 'swal2-premium-popup',
    title: 'swal2-premium-title',
    confirmButton: 'swal2-premium-confirm',
    cancelButton: 'swal2-premium-cancel',
    icon: 'swal2-premium-icon',
    htmlContainer: 'swal2-premium-text',
    actions: 'swal2-premium-actions'
  },
  buttonsStyling: false,
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  return Swal.fire({
    ...themeConfig,
    title,
    text,
    icon,
    confirmButtonText: 'Acknowledged',
  });
};

export const showSuccess = (title: string, text: string) => showAlert(title, text, 'success');
export const showError = (title: string, text: string) => showAlert(title, text, 'error');
export const showWarning = (title: string, text: string) => showAlert(title, text, 'warning');

export const showConfirm = async (title: string, text: string, confirmText: string = 'Confirm') => {
  const result = await Swal.fire({
    ...themeConfig,
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showToast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const titles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: false,
    customClass: {
      popup: `swal2-premium-toast toast-${icon}`,
      title: `swal2-premium-toast-title text-${icon}`,
      htmlContainer: 'swal2-premium-toast-text',
      closeButton: 'swal2-premium-toast-close'
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    title: titles[icon],
    text: message
  });
};
