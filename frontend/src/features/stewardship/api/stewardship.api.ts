import api from '../../../api/axios';

export const fetchStewardshipSummary = async () => {
    const { data } = await api.get('/member/stewardship/summary');
    return data;
};

export const fetchStewardshipLogs = async () => {
    const { data } = await api.get('/member/stewardship/logs');
    return data;
};

export const createStewardshipLog = async (logData: any) => {
    const { data } = await api.post('/member/stewardship/log', logData);
    return data;
};

export const fetchVerifiedOrgs = async () => {
    const { data } = await api.get('/member/verified-orgs');
    return data;
};
