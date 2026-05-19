'use client';

import toast from 'react-hot-toast';

export const Toast = {
  success: (message: string) => toast.success(message, { duration: 3000 }),
  error: (message: string) => toast.error(message, { duration: 4000 }),
  info: (message: string) => toast(message, { duration: 3000 }),
};
