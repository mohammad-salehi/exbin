export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    result: {
      role: any;
      lastName: any;
      firstName: any;
      username: any; token: string 
};
    error: null;
}

export interface forgot_password_request {
    username: string
}

export interface forgot_password_response {
    result: string,
    error?: null | string
}

export interface recovery_password_request {
    username: string,
    verificationCode: number,
    newPassword: string
}
