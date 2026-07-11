// store/auth.store.ts

import { create } from "zustand";

export interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: User;
    status: string;
    challengeId: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "OWNER" | "AGENT" | "CUSTOMER";
}

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
    status: string | null;
    challengeId: string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    status: null,
    challengeId: null,

    setAuth: (payload: AuthPayload) =>
        set({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            user: payload.user,
            status: payload.status,
            challengeId: payload.challengeId,
        }),
    setUser: (user: User | null) =>
        set({
            user: user || undefined,
        }),

    clear: () =>
        set({
            accessToken: null,
            refreshToken: null,
            user: undefined,
            status: null,
            challengeId: null,
        }),

    logout: () =>
        set({
            accessToken: null,
            refreshToken: null,
            status: null,
            user: undefined,
            challengeId: null,
        }),
}));