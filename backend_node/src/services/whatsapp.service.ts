import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import prisma from '../lib/prisma.js';

export class WhatsAppService {
    private static instance: WhatsAppService;
    private client: any;
    private cityId: number = 1; // Default to 1 for now
    private heartbeatInterval: any = null;

    private constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: `city-${this.cityId}`,
                dataPath: './.wwebjs_auth'
            }),
            authTimeoutMs: 60000,
            qrMaxRetries: 0,
            takeoverOnConflict: true,
            takeoverTimeoutMs: 10000,
            puppeteer: {
                executablePath: '/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ],
                headless: true
            },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        this.setupEventListeners();
    }

    public static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    private setupEventListeners() {
        this.client.on('qr', async (qr: string) => {
            console.log('--- WHATSAPP QR RECEIVED ---');
            qrcode.generate(qr, { small: true });
            
            // Save QR to DB for the Admin Panel
            await prisma.whatsAppSession.upsert({
                where: { id: 1 },
                update: { 
                    qr_code: qr, 
                    status: 'QR_READY', 
                    last_active: new Date() 
                },
                create: { 
                    id: 1, 
                    city_id: this.cityId, 
                    qr_code: qr, 
                    status: 'QR_READY' 
                }
            });
        });

        this.client.on('ready', async () => {
            console.log('WhatsApp Client is Ready!');
            await prisma.whatsAppSession.upsert({
                where: { id: 1 },
                update: { 
                    status: 'CONNECTED', 
                    qr_code: null, 
                    last_active: new Date() 
                },
                create: { 
                    id: 1, 
                    city_id: this.cityId, 
                    status: 'CONNECTED' 
                }
            });
        });

        this.client.on('loading_screen', (percent: string, message: string) => {
            console.log('WhatsApp Loading:', percent, message);
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp Authenticated Successfully');
        });

        this.client.on('auth_failure', async (msg: string) => {
            console.error('WhatsApp Authentication Failure:', msg);
            await prisma.whatsAppSession.update({
                where: { id: 1 },
                data: { status: 'DISCONNECTED' }
            });
        });

        this.client.on('disconnected', async (reason: string) => {
            console.log('WhatsApp Client Disconnected:', reason);
            await prisma.whatsAppSession.update({
                where: { id: 1 },
                data: { status: 'DISCONNECTED' }
            });
        });

        this.client.on('message', async (msg: any) => {
            console.log(`[WhatsApp] Raw message event from ${msg.from}`);
            await this.handleIncomingMessage(msg);
        });

        this.client.on('message_create', async (msg: any) => {
            // This captures messages sent FROM the phone itself
            if (msg.fromMe) {
                console.log(`[WhatsApp] Message created by me (Phone): ${msg.to}`);
                await this.handleOutgoingFromPhone(msg);
            }
        });

        this.client.on('change_state', (state: string) => {
            console.log('WhatsApp State Change:', state);
        });

        // Start heartbeat to monitor connection health
        let failureCount = 0;
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.heartbeatInterval = setInterval(async () => {
            try {
                if (this.client.pupPage) {
                    // Check if page is still alive
                    const isHealthy = await this.client.pupPage.evaluate(() => true);
                    if (isHealthy) {
                        failureCount = 0;
                        console.log(`[Heartbeat] Connection Healthy`);
                    } else {
                        failureCount++;
                        console.error(`[Heartbeat] Page not healthy (${failureCount}/5)`);
                    }
                }
            } catch (err) {
                failureCount++;
                console.error(`[Heartbeat] Failure detected (${failureCount}/5)`, err);
            }

            if (failureCount >= 5) {
                console.log('--- PERSISTENT FAILURE DETECTED. AUTO-RESTARTING CLIENT ---');
                failureCount = 0;
                this.restart().catch(console.error);
            }
        }, 30000);

        // Run cleanup and recovery on start
        this.performCleanup().catch(console.error);
        this.recoverOngoingBroadcasts().catch(console.error);
    }

    private async performCleanup() {
        console.log('[WhatsApp] Running scheduled log cleanup (60 day policy)...');
        try {
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            // 1. Delete old logs
            const deletedLogs = await prisma.whatsAppLog.deleteMany({
                where: {
                    timestamp: { lt: sixtyDaysAgo }
                }
            });

            // 2. Delete old broadcasts
            const deletedBroadcasts = await prisma.whatsAppBroadcast.deleteMany({
                where: {
                    created_at: { lt: sixtyDaysAgo }
                }
            });

            console.log(`[WhatsApp] Cleanup complete. Purged ${deletedLogs.count} logs and ${deletedBroadcasts.count} broadcasts.`);
        } catch (err) {
            console.error('[WhatsApp] Cleanup failed:', err);
        }
    }

    private async recoverOngoingBroadcasts() {
        console.log('[WhatsApp] Checking for interrupted broadcasts...');
        try {
            const ongoing = await prisma.whatsAppBroadcast.findMany({
                where: { status: 'ONGOING' }
            });

            if (ongoing.length > 0) {
                console.log(`[WhatsApp] Found ${ongoing.length} stuck broadcasts. Marking as FAILED.`);
                await prisma.whatsAppBroadcast.updateMany({
                    where: { status: 'ONGOING' },
                    data: { 
                        status: 'FAILED',
                        updated_at: new Date()
                    }
                });
            }
        } catch (err) {
            console.error('[WhatsApp] Recovery failed:', err);
        }
    }

    private async checkHealth(): Promise<boolean> {
        try {
            if (!this.client.pupPage || this.client.pupPage.isClosed()) return false;
            // Test if evaluate works
            const result = await this.client.pupPage.evaluate(() => 1);
            return result === 1;
        } catch (err) {
            console.log('[WhatsApp] Health check caught error (likely detached frame)');
            return false;
        }
    }

    public async restart() {
        console.log('Restarting WhatsApp Client...');
        try {
            await this.client.destroy();
            // Re-initialize a new client
            this.client = new Client(this.client.options);
            this.setupEventListeners();
            await this.client.initialize();
            console.log('WhatsApp Client Re-initialized');
        } catch (error) {
            console.error('Failed to restart WhatsApp client:', error);
        }
    }

    public async refresh() {
        console.log('Manual Refresh Requested...');
        if (this.client.pupPage) {
            await this.client.pupPage.reload({ waitUntil: 'networkidle0' });
            console.log('Page Reloaded Successfully');
            return true;
        }
        return false;
    }

    private async handleIncomingMessage(msg: any) {
        console.log(`[WhatsApp] Processing incoming from: ${msg.from}`);
        
        // Handle both standard @c.us and new @lid identifiers
        if (msg.from.endsWith('@c.us') || msg.from.endsWith('@lid')) {
            const id = msg.from.split('@')[0];
            
            // Match with member in DB
            // 1. Try matching by phone
            let member = await prisma.member.findFirst({
                where: { 
                    OR: [
                        { phone: id },
                        { phone: `+${id}` },
                        { phone: { contains: id.length > 10 ? id.slice(-10) : id } }
                    ]
                }
            });

            // 2. Try matching by saved whatsapp_id (New Fix!)
            if (!member) {
                member = await prisma.member.findFirst({
                    where: { whatsapp_id: id }
                });
            }

            // 3. Update whatsapp_id if we matched by phone but didn't have ID yet
            if (member && !member.whatsapp_id) {
                await prisma.member.update({
                    where: { id: member.id },
                    data: { whatsapp_id: id }
                }).catch(() => {});
            }

            await prisma.whatsAppLog.create({
                data: {
                    member_id: member?.id || null,
                    city_id: this.cityId,
                    direction: 'in',
                    content: msg.body,
                    status: 'received',
                    timestamp: new Date()
                }
            });

            console.log(`[WhatsApp] Logged reply from ${id} (Member ID: ${member?.id || 'Unknown'})`);
        }
    }

    private async handleOutgoingFromPhone(msg: any) {
        // Find member
        const id = msg.to.split('@')[0];
        
        // De-duplication: If we just sent this from the panel, don't log it again
        const recentLog = await prisma.whatsAppLog.findFirst({
            where: {
                member_id: { not: null },
                direction: 'out',
                timestamp: { gte: new Date(Date.now() - 5000) } // Last 5 seconds
            },
            orderBy: { timestamp: 'desc' }
        });

        // Simple content match within 5s
        if (recentLog && recentLog.content === msg.body) return;

        let member = await prisma.member.findFirst({
            where: { 
                OR: [
                    { phone: id },
                    { phone: `+${id}` },
                    { phone: { contains: id.length > 10 ? id.slice(-10) : id } }
                ]
            }
        });

        // Try whatsapp_id lookup
        if (!member) {
            member = await prisma.member.findFirst({
                where: { whatsapp_id: id }
            });
        }

        // Update whatsapp_id if missing
        if (member && !member.whatsapp_id) {
            await prisma.member.update({
                where: { id: member.id },
                data: { whatsapp_id: id }
            }).catch(() => {});
        }

        await prisma.whatsAppLog.create({
            data: {
                member_id: member?.id || null,
                city_id: this.cityId,
                direction: 'out',
                content: msg.body,
                status: 'sent',
                timestamp: new Date()
            }
        });
        
        console.log(`[WhatsApp] Captured outgoing from phone to ${id} (Member: ${member?.id || 'Unknown'})`);
    }

    public async initialize() {
        try {
            console.log('Initializing WhatsApp Client...');
            await this.client.initialize();
        } catch (error) {
            console.error('Failed to initialize WhatsApp client:', error);
        }
    }

    /**
     * Send a single message with retry logic for "detached frame" errors
     */
    public async sendMessage(to: string, content: string, memberId?: number, retryCount = 0, broadcastId?: number): Promise<any> {
        try {
            // 1. Clean the number
            let cleanTo = to.replace(/\D/g, '');
            if (cleanTo.length === 10) cleanTo = '91' + cleanTo;

            // 2. STABILITY: Try to use saved whatsapp_id from Member table first
            let formattedTo: string | null = null;
            if (memberId) {
                const member = await prisma.member.findUnique({
                    where: { id: memberId },
                    select: { whatsapp_id: true }
                });
                if (member?.whatsapp_id) {
                    formattedTo = member.whatsapp_id.includes('@') 
                        ? member.whatsapp_id 
                        : `${member.whatsapp_id}@lid`;
                    console.log(`[WhatsApp] Using saved WhatsApp ID: ${formattedTo}`);
                }
            }

            // 3. Fallback to getNumberId if no ID saved
            if (!formattedTo) {
                console.log(`[WhatsApp] Resolving WhatsApp ID for: ${cleanTo}`);
                const numberId = await this.client.getNumberId(cleanTo);
                if (!numberId) throw new Error(`Number ${to} is not on WhatsApp.`);
                formattedTo = numberId._serialized;
            }

            // 4. Send
            const response = await this.client.sendMessage(formattedTo, content);
            
            // 5. Save the resolved ID back to the member record for next time
            if (memberId && formattedTo) {
                const lid = formattedTo.split('@')[0];
                await prisma.member.update({
                    where: { id: memberId },
                    data: { whatsapp_id: lid }
                }).catch(() => {});
            }

            await prisma.whatsAppLog.create({
                data: {
                    member_id: memberId || null,
                    broadcast_id: broadcastId || null,
                    city_id: this.cityId,
                    direction: 'out',
                    content: content,
                    status: 'sent',
                    timestamp: new Date()
                }
            });

            return response;
        } catch (error: any) {
            const errorMsg = error.message.toLowerCase();
            console.error(`[WhatsApp] sendMessage Error (Attempt ${retryCount + 1}):`, error.message);
            
            // Broad detection for environmental/browser errors
            const isDetached = errorMsg.includes('detached frame') || 
                               errorMsg.includes('execution context was destroyed') ||
                               errorMsg.includes('navigating frame was detached') ||
                               errorMsg.includes('page closed') ||
                               errorMsg.includes('target closed');

            if (isDetached && retryCount < 3) {
                console.log(`[WhatsApp] 🔄 DETACHED FRAME DETECTED (Attempt ${retryCount + 1}). RECOVERING...`);
                
                try {
                    if (retryCount === 2) {
                        // THIRD STRIKE: Full Restart
                        console.log(`[WhatsApp] ☢️ PERSISTENT DETACHED FRAME. PERFORMING FULL CLIENT RESTART...`);
                        await this.restart().catch(() => {});
                        await new Promise(r => setTimeout(r, 15000)); // Wait for full init
                    } else {
                        // STANDARD: Refresh
                        await this.refresh().catch(() => {}); 
                        const waitTime = (retryCount + 1) * 8000;
                        console.log(`[WhatsApp] Waiting ${waitTime}ms for session stabilization...`);
                        await new Promise(r => setTimeout(r, waitTime)); 
                    }
                } catch (recoveryErr) {
                    console.error('[WhatsApp] Recovery failed:', recoveryErr);
                }
                
                return this.sendMessage(to, content, memberId, retryCount + 1, broadcastId);
            }
            
            throw error;
        }
    }

    /**
     * Bulk message sender with randomized delays
     */
    public async sendBulk(messages: { to: string; content: string; memberId?: number }[], broadcastName?: string, existingBroadcastId?: number) {
        console.log(`[WhatsApp] Starting bulk send to ${messages.length} contacts (Retry: ${!!existingBroadcastId})...`);
        
        let broadcast: any;

        if (existingBroadcastId) {
            broadcast = await prisma.whatsAppBroadcast.findUnique({ where: { id: existingBroadcastId } });
            if (!broadcast) throw new Error('Broadcast not found');
            
            await prisma.whatsAppBroadcast.update({
                where: { id: existingBroadcastId },
                data: { status: 'ONGOING', updated_at: new Date() }
            });
        } else {
            broadcast = await prisma.whatsAppBroadcast.create({
                data: {
                    name: broadcastName || 'Unnamed Broadcast',
                    content: messages[0]?.content || '',
                    total_count: messages.length,
                    status: 'ONGOING',
                    city_id: this.cityId
                }
            });
        }

        let sentCount = broadcast.sent_count || 0;
        let failCount = 0;
        
        for (const msg of messages) {
            try {
                // 1. STABILITY: Ensure page is healthy before each message
                const isHealthy = await this.checkHealth();
                if (!isHealthy) {
                    console.log('[WhatsApp] Page unhealthy during bulk, attempting refresh...');
                    await this.refresh();
                    await new Promise(r => setTimeout(r, 5000));
                }

                // 2. Fetch member details for personalization and stability
                let personalizedContent = msg.content;
                let currentMemberId = msg.memberId;
                
                if (currentMemberId) {
                    const member = await prisma.member.findUnique({
                        where: { id: currentMemberId },
                        select: { first_name: true, last_name: true, whatsapp_id: true }
                    });
                    
                    if (member) {
                        const replacements: any = {
                            '{first_name}': member.first_name || '',
                            '{firstname}': member.first_name || '',
                            '{last_name}': member.last_name || '',
                            '{lastname}': member.last_name || ''
                        };
                        for (const key in replacements) {
                            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                            personalizedContent = personalizedContent.replace(regex, replacements[key]);
                        }
                    }
                }

                // 3. Send message (sendMessage will use the whatsapp_id from DB internally)
                await this.sendMessage(msg.to, personalizedContent, currentMemberId, 0, broadcast.id);
                sentCount++;
                
                // Update progress in DB every message
                await prisma.whatsAppBroadcast.update({
                    where: { id: broadcast.id },
                    data: { sent_count: sentCount }
                });

                // Randomized delay 8-15 seconds
                const delay = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000;
                console.log(`Message sent to ${msg.to}. Waiting ${delay}ms before next...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error: any) {
                failCount++;
                console.error(`Bulk send failed for ${msg.to}:`, error);
                
                // Log the failure so it shows in the breakdown
                await prisma.whatsAppLog.create({
                    data: {
                        member_id: msg.memberId || null,
                        broadcast_id: broadcast.id,
                        city_id: this.cityId,
                        direction: 'out',
                        content: msg.content,
                        status: `failed: ${error.message?.slice(0, 40)}`,
                        timestamp: new Date()
                    }
                });

                // COOLDOWN after failure: Wait 15s to let the browser settle
                console.log(`[WhatsApp] Failure cooldown... waiting 15s before next member.`);
                await new Promise(resolve => setTimeout(resolve, 15000));
            }
        }

        // Final update
        const finalStatus = sentCount >= broadcast.total_count ? 'COMPLETED' : sentCount === 0 ? 'FAILED' : 'PARTIAL';
        
        await prisma.whatsAppBroadcast.update({
            where: { id: broadcast.id },
            data: { 
                status: finalStatus,
                updated_at: new Date()
            }
        });

        console.log(`[WhatsApp] Bulk send finished. Status: ${finalStatus}. ${sentCount} sent, ${failCount} failed.`);
    }

    public async logout() {
        try {
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            await this.client.logout();
            await this.client.destroy();
        } catch (error) {
            console.error('Error during WhatsApp logout:', error);
        }
    }
}

export const whatsapp = WhatsAppService.getInstance();
