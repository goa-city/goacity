import api from '../../../api/axios';

export const fetchActiveIdeas = async () => {
    const { data } = await api.get('/member/incubator/ideas');
    return data;
};

export const submitIdea = async (ideaData: any) => {
    const { data } = await api.post('/member/incubator/submit', ideaData);
    return data;
};

export const submitIdeaFeedback = async (ideaId: number, feedbackData: any) => {
    const { data } = await api.post(`/member/incubator/idea/${ideaId}/feedback`, feedbackData);
    return data;
};
