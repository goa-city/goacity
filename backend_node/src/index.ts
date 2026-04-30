import 'dotenv/config'; // MUST BE FIRST
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/error.handler.js';

import { whatsapp } from './services/whatsapp.service.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize WhatsApp Service
whatsapp.initialize().catch(err => {
    console.error('Failed to initialize WhatsApp service:', err);
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Error Handling (Must be last)
app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Process-Level Crash Guards — prevent server crash from unhandled errors
process.on('uncaughtException', (error: Error) => {
    console.error('[FATAL] Uncaught Exception:', error);
    // Don't exit — PM2 will restart if the process becomes unresponsive
});

process.on('unhandledRejection', (reason: unknown) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
    // Don't exit — PM2 will restart if the process becomes unresponsive
});
