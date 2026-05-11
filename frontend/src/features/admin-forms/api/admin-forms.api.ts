import httpClient from '../../../shared/api/httpClient';

export interface FormField {
    id?: number;
    field_key: string;
    label: string;
    field_type: string;
    subtitle?: string;
    placeholder?: string;
    required: boolean;
    is_optional?: boolean;
    is_profile: boolean;
    options?: any;
    conditional_logic?: any;
    conditions?: any;
    sort_order?: number;
}

export interface Form {
    id: number;
    title: string;
    description: string;
    code: string;
    fields?: FormField[];
    fields_per_page?: number;
    visibility?: 'members' | 'public';
    redirect_url?: string;
    notify_admin?: boolean;
    notify_admin_ids?: string;
}

export interface AdminUser {
    id: number;
    full_name: string;
    email: string;
}

export const fetchAdminForms = async (): Promise<Form[]> => {
    const { data } = await httpClient.get<Form[]>('/admin/forms');
    return data;
};

export const fetchAdminFormDetail = async (id: number): Promise<Form> => {
    const { data } = await httpClient.get<Form>(`/admin/forms?id=${id}`);
    return data;
};

export const fetchAdmins = async (): Promise<AdminUser[]> => {
    const { data } = await httpClient.get<AdminUser[]>('/admin/admins');
    return data;
};

export const saveFormStructure = async (id: number, formData: Partial<Form>): Promise<void> => {
    await httpClient.put(`/admin/forms`, { id, ...formData });
};

export const createForm = async (formData: Partial<Form>): Promise<Form> => {
    const { data } = await httpClient.post<Form>('/admin/forms', formData);
    return data;
};
