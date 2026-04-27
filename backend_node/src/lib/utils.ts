/**
 * Formats a date string or object to DD/MM/YYYY
 */
export const formatDateDDMMYYYY = (dateVal: any): string => {
    if (!dateVal) return '-';
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '-';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '-';
    }
};

/**
 * Standardizes answer values based on field type
 */
export const formatAnswerValue = (rawVal: any, fieldType: string): string => {
    if (rawVal === null || rawVal === undefined || rawVal === '') return '-';
    
    if (fieldType === 'date') {
        return formatDateDDMMYYYY(rawVal);
    }
    
    if (fieldType === 'choice_bool') {
        return rawVal === '1' || rawVal === 1 || rawVal === true ? 'Yes' : 'No';
    }
    
    return String(rawVal);
};

/**
 * Formats a date or time string to 12h format (e.g. 06:30pm)
 */
export const formatTime12h = (timeVal: any): string => {
    if (!timeVal) return '-';
    try {
        const d = new Date(timeVal);
        if (isNaN(d.getTime())) return '-';
        
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
        
        return `${hoursStr}:${minutes}${ampm}`;
    } catch (e) {
        return '-';
    }
};

/**
 * Parses a 12h or 24h time string into a Date object (with 1970-01-01 base)
 */
export const parseTime24h = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    try {
        // Handle 12h format like 06:30pm or 6:30 PM
        const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
        if (match12 && match12[1] && match12[2] && match12[3]) {
            let hours = parseInt(match12[1]);
            const minutes = parseInt(match12[2]);
            const ampm = match12[3].toLowerCase();
            
            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            
            const d = new Date('1970-01-01T00:00:00Z');
            d.setUTCHours(hours, minutes, 0, 0);
            return d;
        }
        
        // Handle 24h format like 18:30
        const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
        if (match24 && match24[1] && match24[2]) {
            const hours = parseInt(match24[1]);
            const minutes = parseInt(match24[2]);
            const d = new Date('1970-01-01T00:00:00Z');
            d.setUTCHours(hours, minutes, 0, 0);
            return d;
        }

        // Try standard Date parsing
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) return d;

        return null;
    } catch (e) {
        return null;
    }
};
