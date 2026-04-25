import prisma from '../lib/prisma.js';

export class NotificationService {
    /**
     * Store a new FCM token for a user
     */
    static async updateToken(userId: number, fcmToken: string) {
        return prisma.member.update({
            where: { id: userId },
            data: { fcm_token: fcmToken }
        });
    }

    /**
     * Send a notification to a specific user
     */
    static async sendToUser(userId: number, payload: { title: string; message: string; type?: string }) {
        // 1. Log to database
        const notification = await prisma.notification.create({
            data: {
                member_id: userId,
                title: payload.title,
                message: payload.message,
                type: payload.type || 'general'
            },
            include: { member: true }
        });

        // 2. Trigger FCM (Placeholder for Firebase Admin SDK integration)
        if (notification.member.fcm_token) {
            console.log(`[FCM] Sending push to ${notification.member.fcm_token}: ${payload.title}`);
            // Logic to call Firebase Admin SDK will go here
        }

        return notification;
    }

    /**
     * Broadcast to all members of a specific city
     */
    static async broadcastToCity(cityId: number, payload: { title: string; message: string; type?: string }) {
        const members = await prisma.member.findMany({
            where: { city_id: cityId, fcm_token: { not: null } },
            select: { id: true, fcm_token: true }
        });

        const notifications = await Promise.all(
            members.map(member => this.sendToUser(member.id, payload))
        );

        return { count: notifications.length };
    }
}
