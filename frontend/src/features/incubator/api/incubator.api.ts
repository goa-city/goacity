import api from '../../../api/axios';

export const fetchActiveIdeas = async () => {
    const { data } = await api.get('/member/incubator');
    return data;
};

export const submitIdea = async (ideaData: any) => {
    const { data } = await api.post('/member/incubator', {
        ...ideaData,
        needs: ideaData.needs_json
    });
    return data;
};

export const submitIdeaFeedback = async (ideaId: string, feedbackData: any) => {
    const { data } = await api.post(`/member/incubator/${ideaId}/feedback`, feedbackData);
    return data;
};

export const fetchIdeaById = async (id: string) => {
    const { data } = await api.get(`/member/incubator/${id}`);
    return data.data;
};
