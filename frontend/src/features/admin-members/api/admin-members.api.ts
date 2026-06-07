import httpClient from '../../../shared/api/httpClient';

export interface AdminMember {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    is_onboarded: number;
    created_at: string;
    streams: Array<{ id: number; name: string; color: string }>;
    is_mentor?: boolean;
}

export interface MemberDetail extends AdminMember {
    profile_attributes: Array<{ label: string; value: string }>;
    form_responses: Array<{
        response_id: number;
        form_id: number;
        submitted_at: string;
        status: string;
        form_title: string;
        answers: Array<{ label: string; value: string }>;
    }>;
    stream_ids: number[];
    meeting_count: number;
}

export const fetchAdminMembers = async (status?: string): Promise<AdminMember[]> => {
    const { data } = await httpClient.get<AdminMember[]>(`/admin/users${status ? `?status=${status}` : ''}`);
    return data;
};

export const fetchAdminMemberDetail = async (id: number): Promise<MemberDetail> => {
    const { data } = await httpClient.get<MemberDetail>(`/admin/users?id=${id}`);
    return data;
};

export const updateAdminMember = async (id: number, memberData: any): Promise<void> => {
    await httpClient.put(`/admin/users`, { id, ...memberData });
};

export const deleteAdminMember = async (id: number): Promise<void> => {
    await httpClient.delete(`/admin/users?id=${id}`);
};
