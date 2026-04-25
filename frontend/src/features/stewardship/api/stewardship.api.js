import httpClient from '../../../shared/api/httpClient';

export const fetchStewardshipSummary = async () => {
    const { data } = await httpClient.get('/member/stewardship/summary');
    return data;
};

export const fetchStewardshipLogs = async () => {
    const { data } = await httpClient.get('/member/stewardship/logs');
    return data;
};

export const createStewardshipLog = async (logData) => {
    const { data } = await httpClient.post('/member/stewardship/log', logData);
    return data;
};

export const fetchVerifiedOrgs = async () => {
    const { data } = await httpClient.get('/member/verified-orgs');
    return data;
};
