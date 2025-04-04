/**
 * Formatează data ultimului refresh
 * @param date - Data pentru formatare
 * @returns String formatat cu ora:minute:secunde
 */
export const formatLastRefreshTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * Formatează numeric pentru afișare
 * @param value - Valoarea numerică
 * @returns String formatat cu separatori pentru mii
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
}; 