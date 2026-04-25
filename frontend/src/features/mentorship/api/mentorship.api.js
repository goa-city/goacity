import httpClient from '../../../shared/api/httpClient';

export const fetchMentors = async (search = '', area = '') => {
    const { data } = await httpClient.get(`/member/directory?willing_to_mentor=true&search=${search}&area=${area}`);
    return data.data || [];
};

export const requestMentorship = async (requestData) => {
    const { data } = await httpClient.post('/member/mentorship/request', requestData);
    return data;
};

export const fetchMyMentorships = async () => {
    const { data } = await httpClient.get('/member/mentorship');
    return data;
};

export const updateMentorshipGoals = async (id, goals) => {
    const { data } = await httpClient.put(`/member/mentorship/${id}/goals`, { goals });
    return data;
};
