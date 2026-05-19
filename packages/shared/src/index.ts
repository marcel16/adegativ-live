export const PLATFORMS = ['SAMSUNG', 'LG', 'ANDROID_TV', 'ROKU', 'WEB'] as const;
export type TVPlatform = typeof PLATFORMS[number];

export const SUBSCRIPTION_STATUS = ['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED', 'BLOCKED'] as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[number];

export const MEDIA_TYPES = ['VIDEO', 'IMAGE', 'YOUTUBE', 'EXTERNAL'] as const;
export type MediaType = typeof MEDIA_TYPES[number];

export const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'] as const;
export type SchedulePriority = typeof PRIORITIES[number];

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  ADEGAS: {
    BASE: '/api/adegas',
    BY_ID: (id: string) => `/api/adegas/${id}`,
    SUBSCRIPTION: (id: string) => `/api/adegas/${id}/subscription`,
  },
  TV: {
    GENERATE_CODE: '/api/tv/pairing/generate',
    CONFIRM_PAIRING: '/api/tv/pairing/confirm',
    PLAYLIST: (token: string) => `/api/tv/playlist/${token}`,
    BY_ADEGA: (adegaId: string) => `/api/tv/adega/${adegaId}`,
    PING: (id: string) => `/api/tv/${id}/ping`,
    REVOKE: (id: string) => `/api/tv/${id}/revoke`,
  },
  MEDIA: {
    UPLOAD: '/api/media/upload',
    BY_ADEGA: (adegaId: string) => `/api/media/adega/${adegaId}`,
    DELETE: (id: string) => `/api/media/${id}`,
  },
  SCHEDULES: {
    BY_ADEGA: (adegaId: string) => `/api/schedules/adega/${adegaId}`,
    BASE: '/api/schedules',
    ITEMS: (id: string) => `/api/schedules/${id}/items`,
  },
  PLANS: {
    BASE: '/api/plans',
  },
  PAYMENTS: {
    BASE: '/api/payments',
    WEBHOOK: (gateway: string) => `/api/payments/webhook/${gateway}`,
  },
} as const;

export const PAIRING_CODE_LENGTH = 6;
export const PAIRING_CODE_EXPIRY_MINUTES = 10;
export const TRIAL_DAYS = 3;
export const PING_INTERVAL_MS = 30000;
export const PLAYLIST_REFRESH_MS = 60000;
export const PAIRING_POLL_MS = 5000;
