import api from '../../../api/axios';

export const fetchMentors = async (search = '', area = '') => {
    const { data } = await api.get(`/member/directory?willing_to_mentor=true&search=${search}&area=${area}`);
    return data.data || [];
};

export const requestMentorship = async (requestData: any) => {
    const { data } = await api.post('/member/mentorship/request', requestData);
    return data;
};

export const fetchMyMentorships = async () => {
    const { data } = await api.get('/member/mentorship');
    return data;
};

export const updateMentorshipGoals = async (id: number, goals: any) => {
    const { data } = await api.put(`/member/mentorship/${id}/goals`, { goals });
    return data;
};
