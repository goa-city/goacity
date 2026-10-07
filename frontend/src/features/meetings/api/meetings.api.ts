import api from '../../../api/axios';

export const fetchUpcomingMeetings = async () => {
    const { data } = await api.get('/member/meetings/upcoming');
    return data;
};

export const fetchPastMeetings = async () => {
    const { data } = await api.get('/member/meetings/past');
    return data;
};

export const rsvpMeeting = async (meetingIdOrSlug: number | string, status: string) => {
    const { data } = await api.post(`/member/meeting/${meetingIdOrSlug}/rsvp`, { status });
    return data;
};

export const fetchSingleMeeting = async (id: string | number) => {
    const { data } = await api.get(`/meetings/${id}`);
    return data;
};

export const checkInMeeting = async (meetingIdOrSlug: number | string) => {
    const { data } = await api.post(`/member/meeting/${meetingIdOrSlug}/checkin`);
    return data;
};

export const registerGuestMeeting = async (meetingIdOrSlug: number | string, formData: FormData) => {
    const { data } = await api.post(`/meetings/${meetingIdOrSlug}/register-guest`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

export const toggleVideoReaction = async (meetingId: number | string, clipId: string, reaction_type: 'like' | 'love') => {
    const { data } = await api.post(`/member/meetings/${meetingId}/videos/${clipId}/react`, { reaction_type });
    return data;
};

export const logVideoAnalytics = async (meetingId: number | string, clipId: string, payload: { action: string; duration_seconds: number }) => {
    const { data } = await api.post(`/member/meetings/${meetingId}/videos/${clipId}/analytics`, payload);
    return data;
};

export const fetchVideoAnalytics = async (meetingId: number | string) => {
    const isSuperAdminRoute = window.location.pathname.startsWith('/superadmin') || !!localStorage.getItem('superAdminToken');
    const endpoint = isSuperAdminRoute
        ? `/superadmin/meetings/${meetingId}/video-analytics`
        : `/admin/meetings/${meetingId}/video-analytics`;
    const { data } = await api.get(endpoint);
    return data;
};

export const fetchMeetingsWithVideos = async () => {
    const { data } = await api.get('/superadmin/meetings-with-videos');
    return data;
};

export const uploadRecapGallery = async (meetingId: number | string, formData: FormData) => {
    const { data } = await api.post(`/admin/meetings/${meetingId}/recap-gallery`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

export interface PublishRecapNewsPayload {
    custom_note?: string;
    type?: 'all' | 'video' | 'gallery';
    video_id?: string;
    video_title?: string;
    video_description?: string;
}

export const publishRecapToNews = async (meetingId: number | string, payload?: string | PublishRecapNewsPayload) => {
    const body = typeof payload === 'string' ? { custom_note: payload } : (payload || {});
    const { data } = await api.post(`/admin/meetings/${meetingId}/publish-recap-to-news`, body);
    return data;
};

