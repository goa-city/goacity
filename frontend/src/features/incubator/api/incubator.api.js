import httpClient from '../../../shared/api/httpClient';

export const fetchActiveIdeas = async () => {
    const { data } = await httpClient.get('/member/incubator/ideas');
    return data;
};

export const submitIdea = async (ideaData) => {
    const { data } = await httpClient.post('/member/incubator/submit', ideaData);
    return data;
};

export const submitIdeaFeedback = async (ideaId, feedbackData) => {
    const { data } = await httpClient.post(`/member/incubator/idea/${ideaId}/feedback`, feedbackData);
    return data;
};
