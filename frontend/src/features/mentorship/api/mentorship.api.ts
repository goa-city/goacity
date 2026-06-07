import api from '../../../api/axios';

// --- MENTOR PROFILE ---
export const fetchMentorProfile = async () => {
    const { data } = await api.get('/member/mentorship/profile');
    return data;
};

export const updateMentorProfile = async (profileData: any) => {
    const { data } = await api.post('/member/mentorship/profile', profileData);
    return data;
};

// --- RECOMMENDATIONS ---
export const fetchMenteeRecommendations = async (responseId: number) => {
    const { data } = await api.get(`/member/mentorship/recommendations?response_id=${responseId}`);
    return data;
};

// --- RELATIONSHIPS ---
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

export const fetchMentorshipById = async (id: string) => {
    const { data } = await api.get(`/member/mentorship/${id}`);
    return data;
};

// --- WORKSPACE: GOALS ---
export const addMentorshipGoal = async (id: string, goalData: any) => {
    const { data } = await api.post(`/member/mentorship/${id}/goals`, goalData);
    return data;
};

export const updateMentorshipGoal = async (goalId: string, goalData: any) => {
    const { data } = await api.put(`/member/mentorship/goals/${goalId}`, goalData);
    return data;
};

// --- WORKSPACE: SESSIONS ---
export const logMentorshipSession = async (id: string, sessionData: any) => {
    const { data } = await api.post(`/member/mentorship/${id}/sessions`, sessionData);
    return data;
};

export const updateMentorshipSession = async (sessionId: string, sessionData: any) => {
    const { data } = await api.put(`/member/mentorship/sessions/${sessionId}`, sessionData);
    return data;
};

export const submitSessionPayment = async (id: string, paymentData: any) => {
    const { data } = await api.post(`/member/mentorship/sessions/${id}/pay`, paymentData);
    return data;
};

export const verifySessionPayment = async (id: string) => {
    const { data } = await api.post(`/member/mentorship/sessions/${id}/verify`);
    return data;
};

// --- WORKSPACE: MATERIALS ---
export const addMentorshipMaterial = async (id: string, materialData: FormData) => {
    const { data } = await api.post(`/member/mentorship/${id}/materials`, materialData);
    return data;
};

export const submitMaterialResponse = async (materialId: string, responseData: FormData) => {
    const { data } = await api.post(`/member/mentorship/materials/${materialId}/response`, responseData);
    return data;
};

export const deleteMentorshipMaterial = async (materialId: string) => {
    const { data } = await api.delete(`/member/mentorship/materials/${materialId}`);
    return data;
};

// --- WORKSPACE: TASKS ---
export const addMentorshipTask = async (id: string, taskData: any) => {
    const { data } = await api.post(`/member/mentorship/${id}/tasks`, taskData);
    return data;
};

export const updateMentorshipTask = async (taskId: string, taskData: any) => {
    const { data } = await api.put(`/member/mentorship/tasks/${taskId}`, taskData);
    return data;
};

// --- STATUS & PHASES ---
export const updateMentorshipPhase = async (id: string, phase: string) => {
    const { data } = await api.put(`/member/mentorship/${id}/phase`, { phase });
    return data;
};

export const updateMentorshipStatus = async (id: string, status: string) => {
    const { data } = await api.put(`/member/mentorship/${id}/status`, { status });
    return data;
};

export const deleteMentorshipSession = async (sessionId: string) => {
    const { data } = await api.delete(`/member/mentorship/sessions/${sessionId}`);
    return data;
};

export const deleteMentorshipGoal = async (goalId: string) => {
    const { data } = await api.delete(`/member/mentorship/goals/${goalId}`);
    return data;
};

