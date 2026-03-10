import 'dotenv/config';
import { watchCalendar } from './utils/google-calendar.js';

async function setup() {
    console.log('Starting Google Calendar Watch Setup...');
    const result = await watchCalendar();
    console.log('Setup Result:', JSON.stringify(result, null, 2));
    process.exit(0);
}

setup();
