
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
    try {
        console.log(`[EMAIL] Attempting to send via Resend to ${to}`);
        const { data, error } = await resend.emails.send({
            from: 'Goa.City <noreply@goa.city>',
            to,
            subject,
            html,
            attachments: attachments || []
        });

        if (error) {
            console.error('Resend Error:', JSON.stringify(error, null, 2));
            return false;
        }

        console.log(`[EMAIL] Resend Success: ${data?.id}`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};
