import api from '../../../api/axios';

export const fetchNewsFeed = async (page = 1) => {
    const { data } = await api.get(`/member/news/feed?page=${page}`);
    return data;
};

export const createPost = async (postData: any, onUploadProgress?: (progressEvent: any) => void) => {
    let payload = postData;

    if (postData.media) {
        payload = new FormData();
        Object.keys(postData).forEach(key => {
            if (postData[key] !== undefined && postData[key] !== null) {
                payload.append(key, postData[key]);
            }
        });
    }

    const { data } = await api.post('/member/news/post', payload, { 
        timeout: 600000, // 10 minutes for large videos (up to 500MB)
        onUploadProgress,
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
