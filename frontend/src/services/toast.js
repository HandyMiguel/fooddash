// services/toast.js
import toast from 'react-hot-toast';

export const showToast = {
  success: (msg) => toast.success(msg, {
    icon: '✅',
    style: { background: '#10B981', color: 'white' }
  }),
  error: (msg) => toast.error(msg, {
    icon: '❌',
    style: { background: '#EF4444', color: 'white' }
  }),
  order: (msg) => toast(msg, {
    icon: '🛵',
    style: { background: '#F97316', color: 'white' }
  }),
};