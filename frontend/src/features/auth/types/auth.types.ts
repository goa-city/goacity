export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'member' | 'admin' | 'superadmin';
    city_id: number;
    city?: {
        name: string;
        slug: string;
        theme_config?: any;
    };
    profile_photo?: string;
    willing_to_mentor?: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
    city_slug?: string;
}

export interface LoginCredentials {
    email: string;
    password?: string;
    otp?: string;
}
