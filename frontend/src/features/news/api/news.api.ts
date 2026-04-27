import api from '../../../api/axios';

export const fetchNewsFeed = async (page = 1) => {
    const { data } = await api.get(`/member/news/feed?page=${page}`);
    return data;
};

export const createPost = async (postData: any) => {
    const { data } = await api.post('/member/news/post', postData);
    return data;
};

export const likePost = async (postId: number) => {
    const { data } = await api.post(`/member/news/post/${postId}/like`);
    return data;
};

export const deletePost = async (postId: number) => {
    const { data } = await api.delete(`/member/news/post/${postId}`);
    return data;
};
