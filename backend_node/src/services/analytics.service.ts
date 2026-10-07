import prisma from '../lib/prisma.js';
import type { Request } from 'express';

interface AuthLogPayload {
    memberId?: number | null;
    adminId?: number | null;
    cityId?: number | null;
    event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'OTP_SENT' | 'TOKEN_LOGIN' | 'LOGOUT';
    identifier?: string | null;
    channel?: 'WHATSAPP' | 'EMAIL' | 'TOKEN' | 'PASSWORD' | string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}

interface PageViewPayload {
    memberId?: number | null;
    adminId?: number | null;
    cityId?: number | null;
    sessionId?: string | null;
    path: string;
    entityType?: string | null;
    entityId?: number | null;
    referrer?: string | null;
    deviceType?: string | null;
    durationSeconds?: number | null;
    ipAddress?: string | null;
    createdAt?: Date;
}

export class AnalyticsService {
    private static pageViewBuffer: PageViewPayload[] = [];
    private static flushTimer: NodeJS.Timeout | null = null;
    private static isFlushing = false;

    /**
     * Extracts client IP address safely considering reverse proxies (Nginx, Cloudflare, etc.)
     */
    public static getClientIp(req: Request): string {
        const cleanIp = (raw: string | null | undefined): string | null => {
            if (!raw) return null;
            let ip = raw.trim();
            if (ip.startsWith('::ffff:')) {
                ip = ip.substring(7);
            }
            return ip || null;
        };

        // 1. Cloudflare / CDN headers
        const cfIp = req.headers['cf-connecting-ip'] || req.headers['true-client-ip'];
        if (typeof cfIp === 'string') {
            const cleaned = cleanIp(cfIp);
            if (cleaned) return cleaned;
        }

        // 2. X-Real-IP (standard Nginx proxy header)
        const realIp = req.headers['x-real-ip'];
        if (typeof realIp === 'string') {
            const cleaned = cleanIp(realIp);
            if (cleaned) return cleaned;
        }

        // 3. X-Forwarded-For (client, proxy1, proxy2)
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            const first = forwarded.split(',')[0];
            const cleaned = cleanIp(first);
            if (cleaned) return cleaned;
        } else if (Array.isArray(forwarded) && forwarded.length > 0 && typeof forwarded[0] === 'string') {
            const first = forwarded[0].split(',')[0];
            const cleaned = cleanIp(first);
            if (cleaned) return cleaned;
        }

        // 4. Express req.ip (when trust proxy is configured)
        if (req.ip) {
            const cleaned = cleanIp(req.ip);
            if (cleaned && cleaned !== '127.0.0.1' && cleaned !== '::1') {
                return cleaned;
            }
        }

        // 5. Remote socket fallback
        const remote = cleanIp(req.socket?.remoteAddress);
        return remote || req.ip || 'unknown';
    }

    /**
     * Converts a Date or ISO timestamp to Indian Standard Time (Asia/Kolkata, UTC+5:30)
     */
    public static toISTString(date: Date | string | null | undefined): string {
        if (!date) return '—';
        let d: Date;
        if (typeof date === 'string') {
            let s = date.trim();
            if (!s.endsWith('Z') && !s.includes('+') && !/[0-9]-[0-9]{2}:[0-9]{2}$/.test(s)) {
                s = s.replace(' ', 'T') + 'Z';
            }
            d = new Date(s);
        } else {
            d = date;
        }
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    /**
     * Logs an authentication event directly and asynchronously (fire & forget)
     */
    public static async logAuthEvent(payload: AuthLogPayload): Promise<void> {
        try {
            await (prisma as any).authLog.create({
                data: {
                    member_id: payload.memberId || null,
                    admin_id: payload.adminId || null,
                    city_id: payload.cityId || 1,
                    event: payload.event,
                    identifier: payload.identifier || null,
                    channel: payload.channel || null,
                    ip_address: payload.ipAddress?.slice(0, 45) || null,
                    user_agent: payload.userAgent?.slice(0, 500) || null,
                    created_at: new Date()
                }
            });
        } catch (error) {
            console.error('[AnalyticsService] Failed to record auth log:', error);
        }
    }

    /**
     * Queues a page view event in the micro-batch buffer
     */
    public static queuePageView(payload: PageViewPayload): void {
        if (!payload.createdAt) {
            payload.createdAt = new Date();
        }
        this.pageViewBuffer.push(payload);

        if (this.pageViewBuffer.length >= 10) {
            this.flushPageViews();
        } else if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => {
                this.flushPageViews();
            }, 3000);
        }
    }

    /**
     * Flushes buffered page views in a single batch
     */
    private static async flushPageViews(): Promise<void> {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        if (this.pageViewBuffer.length === 0 || this.isFlushing) return;

        const batch = [...this.pageViewBuffer];
        this.pageViewBuffer = [];
        this.isFlushing = true;

        try {
            await (prisma as any).pageView.createMany({
                data: batch.map(item => ({
                    member_id: item.memberId || null,
                    admin_id: item.adminId || null,
                    city_id: item.cityId || 1,
                    session_id: item.sessionId || null,
                    path: item.path.slice(0, 255),
                    entity_type: item.entityType?.slice(0, 50) || null,
                    entity_id: item.entityId || null,
                    referrer: item.referrer?.slice(0, 500) || null,
                    device_type: item.deviceType?.slice(0, 30) || null,
                    ip_address: item.ipAddress?.slice(0, 45) || null,
                    duration_seconds: item.durationSeconds || 0,
                    created_at: item.createdAt || new Date()
                }))
            });
        } catch (error) {
            console.error('[AnalyticsService] Failed to flush page views batch:', error);
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Super Admin Analytics Overview
     */
    public static async getOverview(cityId?: number, days: number = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const cityFilter = cityId ? { city_id: cityId } : {};

        // 1. Total, Distinct Active Users, Categorized Pages & Split Auth Logs
        const [
            totalPageViews,
            totalLogins,
            topFrontendGrouped,
            topAdminGrouped,
            topPagesGrouped,
            deviceBreakdown,
            recentMemberAuthLogs,
            recentAdminAuthLogs
        ] = await Promise.all([
            (prisma as any).pageView.count({
                where: {
                    created_at: { gte: since },
                    ...cityFilter
                }
            }),
            (prisma as any).authLog.count({
                where: {
                    event: 'LOGIN_SUCCESS',
                    created_at: { gte: since },
                    ...cityFilter
                }
            }),
            // Top Frontend / Member Pages (exclude /admin and /superadmin)
            (prisma as any).pageView.groupBy({
                by: ['path'],
                where: {
                    created_at: { gte: since },
                    ...cityFilter,
                    NOT: [
                        { path: { startsWith: '/admin' } },
                        { path: { startsWith: '/superadmin' } }
                    ]
                },
                _count: { path: true },
                orderBy: {
                    _count: { path: 'desc' }
                },
                take: 20
            }),
            // Top Admin Pages (starts with /admin or /superadmin)
            (prisma as any).pageView.groupBy({
                by: ['path'],
                where: {
                    created_at: { gte: since },
                    ...cityFilter,
                    OR: [
                        { path: { startsWith: '/admin' } },
                        { path: { startsWith: '/superadmin' } }
                    ]
                },
                _count: { path: true },
                orderBy: {
                    _count: { path: 'desc' }
                },
                take: 20
            }),
            // All top pages (combined)
            (prisma as any).pageView.groupBy({
                by: ['path'],
                where: {
                    created_at: { gte: since },
                    ...cityFilter
                },
                _count: { path: true },
                orderBy: {
                    _count: { path: 'desc' }
                },
                take: 20
            }),
            (prisma as any).pageView.groupBy({
                by: ['device_type'],
                where: {
                    created_at: { gte: since },
                    ...cityFilter
                },
                _count: { device_type: true }
            }),
            // Recent Member Auth Logs
            (prisma as any).authLog.findMany({
                where: {
                    created_at: { gte: since },
                    ...cityFilter,
                    admin_id: null
                },
                orderBy: { created_at: 'desc' },
                take: 50,
                include: {
                    member: {
                        select: { id: true, first_name: true, last_name: true, email: true, phone: true }
                    },
                    city: {
                        select: { id: true, name: true }
                    }
                }
            }),
            // Recent Admin Auth Logs
            (prisma as any).authLog.findMany({
                where: {
                    created_at: { gte: since },
                    ...cityFilter,
                    admin_id: { not: null }
                },
                orderBy: { created_at: 'desc' },
                take: 50,
                include: {
                    admin: {
                        select: { id: true, full_name: true, email: true, role: true, is_super_admin: true }
                    },
                    city: {
                        select: { id: true, name: true }
                    }
                }
            })
        ]);

        // Calculate Daily and Weekly Active Unique Members
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [dauResult, wauResult, mauResult] = await Promise.all([
            (prisma as any).pageView.findMany({
                where: {
                    created_at: { gte: oneDayAgo },
                    member_id: { not: null },
                    ...cityFilter
                },
                distinct: ['member_id'],
                select: { member_id: true }
            }),
            (prisma as any).pageView.findMany({
                where: {
                    created_at: { gte: sevenDaysAgo },
                    member_id: { not: null },
                    ...cityFilter
                },
                distinct: ['member_id'],
                select: { member_id: true }
            }),
            (prisma as any).pageView.findMany({
                where: {
                    created_at: { gte: since },
                    member_id: { not: null },
                    ...cityFilter
                },
                distinct: ['member_id'],
                select: { member_id: true }
            })
        ]);

        const formatMemberLog = (log: any) => ({
            id: log.id,
            event: log.event,
            channel: log.channel,
            identifier: log.identifier,
            ipAddress: log.ip_address,
            userAgent: log.user_agent,
            createdAt: log.created_at,
            createdAtIST: AnalyticsService.toISTString(log.created_at),
            cityName: log.city?.name || 'All Cities',
            userName: log.member 
                ? `${log.member.first_name || ''} ${log.member.last_name || ''}`.trim() || log.member.email || log.member.phone || `Member #${log.member.id}`
                : 'Guest / Anonymous'
        });

        const formatAdminLog = (log: any) => ({
            id: log.id,
            event: log.event,
            channel: log.channel,
            identifier: log.identifier,
            ipAddress: log.ip_address,
            userAgent: log.user_agent,
            createdAt: log.created_at,
            createdAtIST: AnalyticsService.toISTString(log.created_at),
            cityName: log.city?.name || 'All Cities',
            userName: log.admin?.full_name || log.admin?.email || 'Admin',
            adminRole: log.admin?.role || (log.admin?.is_super_admin ? 'Super Admin' : 'Admin')
        });

        const memberLogs = recentMemberAuthLogs.map(formatMemberLog);
        const adminLogs = recentAdminAuthLogs.map(formatAdminLog);

        return {
            summary: {
                totalPageViews,
                totalLogins,
                dau: dauResult.length,
                wau: wauResult.length,
                mau: mauResult.length,
            },
            topFrontendPages: topFrontendGrouped.map((item: any) => ({
                path: item.path,
                count: item._count.path
            })),
            topAdminPages: topAdminGrouped.map((item: any) => ({
                path: item.path,
                count: item._count.path
            })),
            topPages: topPagesGrouped.map((item: any) => ({
                path: item.path,
                count: item._count.path
            })),
            devices: deviceBreakdown.map((d: any) => ({
                device: d.device_type || 'Unknown',
                count: d._count.device_type
            })),
            memberLogs,
            adminLogs,
            recentLogs: [...adminLogs, ...memberLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 50)
        };
    }

    /**
     * Details for a specific page: total view count and latest 50 visitors
     */
    public static async getPageDetails(path: string, cityId?: number, limit: number = 50) {
        const cityFilter = cityId ? { city_id: cityId } : {};

        const [totalCount, visits] = await Promise.all([
            (prisma as any).pageView.count({
                where: {
                    path,
                    ...cityFilter
                }
            }),
            (prisma as any).pageView.findMany({
                where: {
                    path,
                    ...cityFilter
                },
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    member: {
                        select: { id: true, first_name: true, last_name: true, email: true, phone: true, profile_photo: true }
                    },
                    admin: {
                        select: { id: true, full_name: true, email: true, role: true, is_super_admin: true }
                    },
                    city: {
                        select: { id: true, name: true }
                    }
                }
            })
        ]);

        return {
            path,
            totalCount,
            visitors: visits.map((v: any) => {
                let userType: 'member' | 'admin' | 'guest' = 'guest';
                let userName = 'Guest / Visitor';
                let identifier = v.session_id ? `Session: ${v.session_id.substring(0, 12)}...` : 'Anonymous';

                if (v.member) {
                    userType = 'member';
                    const fullName = `${v.member.first_name || ''} ${v.member.last_name || ''}`.trim();
                    userName = fullName || v.member.email || v.member.phone || `Member #${v.member.id}`;
                    identifier = v.member.email || v.member.phone || `Member #${v.member.id}`;
                } else if (v.admin) {
                    userType = 'admin';
                    userName = v.admin.full_name || v.admin.email || `Admin #${v.admin.id}`;
                    identifier = v.admin.email || `Role: ${v.admin.role || 'admin'}`;
                }

                return {
                    id: v.id,
                    userType,
                    userName,
                    identifier,
                    deviceType: v.device_type || 'desktop',
                    ipAddress: v.ip_address || null,
                    referrer: v.referrer || null,
                    durationSeconds: v.duration_seconds || 0,
                    createdAt: v.created_at,
                    createdAtIST: AnalyticsService.toISTString(v.created_at),
                    cityName: v.city?.name || 'All Cities'
                };
            })
        };
    }
}
