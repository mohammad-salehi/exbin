export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    result: { token: string };
    error: null;
}