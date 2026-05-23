/**
 * Formats a given amount into Congolese Francs (FC) string representation.
 * Handles null/undefined and defaults to 0.
 *
 * @param {number|string} price - The amount to format
 * @returns {string} Formatted string, e.g., "12 500 FC"
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-CD').format(Number(price) || 0) + ' FC';
};

/**
 * Formats a Date object or ISO string into a standard localized string.
 *
 * @param {string|Date} dateString - The date to format
 * @param {boolean} [includeTime=false] - Whether to include the time in the output
 * @returns {string} Formatted date, e.g., "24 mai 2026" or "24 mai 2026 à 14:30"
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';

  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('fr-FR', options);
};
