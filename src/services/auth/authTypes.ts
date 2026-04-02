export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignInResponse {
    accessToken: string;
    user?: {
        email: string;
        firstName: string;
        lastName: string;
        businessName: string;
        role?: string;
    };
}

export interface SignUpRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
}

export interface SignUpResponse {
    message?: string;
    user?: {
        email: string;
        firstName: string;
        lastName: string;
        businessName: string;
        role?: string;
    };
}
