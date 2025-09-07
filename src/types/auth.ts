// src/types/auth.ts

/** درخواست لاگین */
export interface LoginRequest {
    username: string;
    password: string;
}

/** ریسپانس موفق */
export interface LoginResponse {
    result: { token: string };
    error: null;
}