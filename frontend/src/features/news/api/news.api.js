import httpClient from '../../../shared/api/httpClient';

export const fetchNewsFeed = async (page = 1) => {
    const { data } = await httpClient.get(`/member/news/feed?page=${page}`);
    return data;
};

export const createPost = async (postData) => {
    const { data } = await httpClient.post('/member/news/post', postData);
    return data;
};

export const likePost = async (postId) => {
    const { data } = await httpClient.post(`/member/news/post/${postId}/like`);
    return data;
};

export const deletePost = async (postId) => {
    const { data } = await httpClient.delete(`/member/news/post/${postId}`);
    return data;
};
