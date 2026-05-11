import api from '../../../api/axios';

export const fetchNewsFeed = async (page = 1) => {
    const { data } = await api.get(`/member/news/feed?page=${page}`);
    return data;
};

export const createPost = async (postData: any) => {
    let payload = postData;
    let headers = {};

    if (postData.media) {
        payload = new FormData();
        Object.keys(postData).forEach(key => {
            payload.append(key, postData[key]);
        });
        headers = { 'Content-Type': 'multipart/form-data' };
    }

    const { data } = await api.post('/member/news/post', payload, { 
        headers,
        timeout: 300000 // 5 minutes to allow for video conversion
    });
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

export const updatePost = async ({ id, content }: { id: number, content: string }) => {
    const { data } = await api.put(`/member/news/post/${id}`, { content });
    return data;
};
