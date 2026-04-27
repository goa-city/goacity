import api from '../../../api/axios';

export const fetchUpcomingMeetings = async () => {
    const { data } = await api.get('/member/meetings/upcoming');
    return data;
};

export const fetchPastMeetings = async () => {
    const { data } = await api.get('/member/meetings/past');
    return data;
};

export const rsvpMeeting = async (meetingId: number, status: string) => {
    const { data } = await api.post(`/member/meeting/${meetingId}/rsvp`, { status });
    return data;
};

export const fetchSingleMeeting = async (id: string | number) => {
    const { data } = await api.get(`/meetings/${id}`);
    return data;
};

export const checkInMeeting = async (meetingId: number) => {
    const { data } = await api.post(`/member/meeting/${meetingId}/checkin`);
    return data;
};
