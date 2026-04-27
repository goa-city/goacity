/**
 * Formats a date string or Date object to dd/mm/yyyy standard.
 * @param date - Date string, number, or Date object
 * @returns Formatted date string (dd/mm/yyyy)
 */
export const formatDate = (date: string | number | Date | null | undefined): string => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Formats a date to include time (dd/mm/yyyy HH:mm)
 */
export const formatDateTime = (date: string | number | Date | null | undefined): string => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    const dateStr = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${dateStr} ${hours}:${minutes}`;
};
