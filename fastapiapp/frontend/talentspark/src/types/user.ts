export interface LoginRequest {
    email:string;
    password:string;
}

export interface LoginResponse {
    access_token:string;
    token_type:string;
}

export interface RegisterRequest {
    name:string;
    email:string;
    password:string;
    role:string;
}

export interface RegisterResponse {
    id:number;
    name:string;
    email:string;
    role:string;
}

    