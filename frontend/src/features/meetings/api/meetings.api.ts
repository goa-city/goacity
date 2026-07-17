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
