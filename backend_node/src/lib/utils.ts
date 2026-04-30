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

    // Handle JSON arrays (Multi-select)
    if (typeof rawVal === 'string' && rawVal.startsWith('[') && rawVal.endsWith(']')) {
        try {
            const parsed = JSON.parse(rawVal);
            if (Array.isArray(parsed)) return parsed.join(', ');
        } catch (e) {}
    }
    
    return String(rawVal);
};

/**
 * Formats a date or time string to 12h format (e.g. 06:30pm)
 */
export const formatTime12h = (timeVal: any): string => {
    if (!timeVal) return '-';
    if (typeof timeVal === 'string' && (timeVal.toLowerCase().includes('am') || timeVal.toLowerCase().includes('pm'))) {
        return timeVal.toLowerCase();
    }
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
/**
 * Generates an ICS calendar file content for a meeting
 */
export const generateICS = (meeting: any): string => {
    const title = meeting.title;
    const description = (meeting.description || '').replace(/<[^>]*>?/gm, '');
    const location = meeting.location_name || '';
    
    const parseTimeStr = (timeStr: string) => {
        if (!timeStr) return null;
        const matches = timeStr.match(/(\d+):(\d+)(am|pm)/i);
        if (!matches || !matches[1] || !matches[2] || !matches[3]) return null;
        let hours = parseInt(matches[1]);
        const minutes = parseInt(matches[2]);
        const modifier = matches[3].toLowerCase();
        if (modifier === 'pm' && hours < 12) hours += 12;
        if (modifier === 'am' && hours === 12) hours = 0;
        return { hours, minutes };
    };

    const start = parseTimeStr(meeting.start_time);
    const end = parseTimeStr(meeting.end_time);

    const formatICSDate = (date: Date, time?: { hours: number, minutes: number }) => {
        const d = new Date(date);
        if (time) {
            d.setHours(time.hours, time.minutes, 0);
        } else {
            d.setHours(0, 0, 0);
        }
        // Return in UTC YYYYMMDDTHHMMSSZ
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const dtStart = formatICSDate(meeting.meeting_date, start || undefined);
    const dtEnd = formatICSDate(meeting.meeting_date, end || (start ? { hours: start.hours + 1, minutes: start.minutes } : undefined));
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Goa.City//Meeting//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:meeting-${meeting.id}@goa.city`,
        `DTSTAMP:${stamp}`,
        `SUMMARY:${title}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
};

/**
 * Converts a string into a URL-friendly slug
 */
export const slugify = (text: string): string => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')      // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')        // Trim - from start
        .replace(/-+$/, '');       // Trim - from end
};

/**
 * Generates a unique slug by checking the database and appending detail if needed
 */
export async function generateUniqueSlug(
    model: any,
    baseText: string,
    cityId: number,
    date?: Date
): Promise<string> {
    const baseSlug = slugify(baseText);
    let slug = baseSlug;

    // 1. Check if base slug is unique
    const existing = await model.findFirst({
        where: {
            slug: slug,
            city_id: cityId
        },
    });

    if (!existing) return slug;

    // 2. If clash, try adding date info (title-day-month-year)
    if (date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const month = months[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        
        slug = `${baseSlug}-${day}-${month}-${year}`;
        
        const existingWithDate = await model.findFirst({
            where: {
                slug: slug,
                city_id: cityId
            },
        });
        
        if (!existingWithDate) return slug;
    }

    // 3. Fallback: Append incrementing counter
    let counter = 1;
    let finalSlug = slug;
    while (true) {
        counter++;
        finalSlug = `${slug}-${counter}`;
        const collision = await model.findFirst({
            where: {
                slug: finalSlug,
                city_id: cityId
            },
        });
        if (!collision) return finalSlug;
    }
}
