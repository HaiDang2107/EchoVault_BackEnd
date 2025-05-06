export interface JwtPayload {
    username: string;
    sessionToken: string;
    sub: string; // sub là ID người dùng (hoặc có thể là ID bất kỳ)
    role: string;
}