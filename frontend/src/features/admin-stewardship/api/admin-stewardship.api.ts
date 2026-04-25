import httpClient from '../../../shared/api/httpClient';

export interface StewardshipLog {
    id: number;
    user_id: number;
    type: 'Financial' | 'Skill';
    amount?: number;
    hours?: number;
    date: string;
    skill_category?: string;
    impact_note?: string;
    status: 'Pending' | 'Verified' | 'Rejected';
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

export const fetchPendingLogs = async (): Promise<StewardshipLog[]> => {
    const { data } = await httpClient.get<StewardshipLog[]>('/admin/stewardship/pending');
    return data;
};

export const verifyStewardshipLog = async (id: number): Promise<void> => {
    await httpClient.post(`/admin/stewardship/${id}/verify`);
};

export const rejectStewardshipLog = async (id: number, reason: string): Promise<void> => {
    await httpClient.post(`/admin/stewardship/${id}/reject`, { reason });
};
