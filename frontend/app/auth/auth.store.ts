// src/wisdom-web/app/auth/auth.store.ts

import { AuthPayload } from "@/app/store/auth.store";

interface AuthState { 
   user?:{
   id:string;
   email:string;
   name?:string;
   picture?:string;
 };
    accessToken: string | null;
    refreshToken: string | null;
    
    status: string | null;
    challengeId: string | null;
    setAuth(payload: AuthPayload): void;
    logout: () => void;
    clear: () => void;
    setUser:(user:AuthPayload['user'])=>void;
}