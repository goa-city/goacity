/**
 * System-protected template IDs and titles.
 * These templates are critical for system operations and cannot be deleted.
 */
export const SYSTEM_TEMPLATES = {
  EMAIL: {
    OTP: {
      ID: 1,
      TITLE: 'OTP Notification',
    },
    MEETING: {
      ID: 2,
      TITLE: 'Meeting Notification',
    },
  },
  WHATSAPP: {
    DEFAULT: {
      ID: 1,
      TITLE: 'Default Template',
    },
  },
};

export const PROTECTED_EMAIL_IDS = [
  SYSTEM_TEMPLATES.EMAIL.OTP.ID,
  SYSTEM_TEMPLATES.EMAIL.MEETING.ID,
];

export const PROTECTED_WHATSAPP_IDS = [
  SYSTEM_TEMPLATES.WHATSAPP.DEFAULT.ID,
];
