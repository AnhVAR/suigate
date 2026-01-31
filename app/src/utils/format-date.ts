import i18n from '../i18n';

/**
 * Format a date as relative time (e.g., "5m ago", "2h ago").
 * Uses Vietnamese or English based on current language.
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const lang = i18n.language;

  if (diffMins < 1) {
    return lang === 'vi' ? 'Vừa xong' : 'Just now';
  }
  if (diffMins < 60) {
    return lang === 'vi' ? `${diffMins} phút trước` : `${diffMins}m ago`;
  }
  if (diffHrs < 24) {
    return lang === 'vi' ? `${diffHrs} giờ trước` : `${diffHrs}h ago`;
  }
  if (diffDays < 7) {
    return lang === 'vi' ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  }

  return formatDate(date);
};

/**
 * Format a date as short date (e.g., "Jan 15, 2026").
 * Uses locale-appropriate formatting.
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const lang = i18n.language;

  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date with time (e.g., "Jan 15, 10:30 AM").
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  const lang = i18n.language;

  return d.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format seconds as countdown timer (e.g., "5:30").
 */
export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
