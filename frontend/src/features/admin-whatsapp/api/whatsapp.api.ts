import axios from '../../../api/axios';

export const getWhatsAppStatus = async () => {
    const response = await axios.get('/admin/whatsapp/status');
    return response.data;
};

export const sendWhatsAppMessage = async (to: string, content: string, memberId?: number) => {
    const response = await axios.post('/admin/whatsapp/send', { to, content, memberId });
    return response.data;
};

export const getWhatsAppLogs = async (memberId: number) => {
    const response = await axios.get(`/admin/whatsapp/logs/${memberId}`);
    return response.data;
};

export const broadcastWhatsApp = async (messages: any[], streamNames?: string[]) => {
    const response = await axios.post('/admin/whatsapp/broadcast', { messages, streamNames });
    return response.data;
};

export const getWhatsAppBroadcasts = async () => {
    const response = await axios.get('/admin/whatsapp/broadcasts');
    return response.data;
};

export const getWhatsAppBroadcastById = async (id: number) => {
    const response = await axios.get(`/admin/whatsapp/broadcasts/${id}`);
    return response.data;
};

export const sendMeetingAlert = async (meetingId: number) => {
    const response = await axios.post('/admin/whatsapp/meeting-alert', { meetingId });
    return response.data;
};

export const refreshWhatsApp = async () => {
    const response = await axios.post('/admin/whatsapp/refresh');
    return response.data;
};

export const restartWhatsApp = async () => {
    const response = await axios.post('/admin/whatsapp/restart');
    return response.data;
};
export const retryWhatsAppBroadcast = async (id: number) => {
    const response = await axios.post(`/admin/whatsapp/broadcasts/${id}/retry`);
    return response.data;
};
