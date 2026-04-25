import httpClient from '../../../shared/api/httpClient';

export const fetchUpcomingMeetings = async () => {
    const { data } = await httpClient.get('/member/meetings/upcoming');
    return data;
};

export const fetchPastMeetings = async () => {
    const { data } = await httpClient.get('/member/meetings/past');
    return data;
};

export const rsvpMeeting = async (meetingId, status) => {
    const { data } = await httpClient.post(`/member/meeting/${meetingId}/rsvp`, { status });
    return data;
};
