import { create } from "zustand";

export type User = {

id: string;

email?: string;

name?: string;

picture?: string;

};

export type AuthPayload = {

accessToken: string;

refreshToken: string;

user: User;

};

type AuthState = {

accessToken: string | null;

refreshToken: string | null;

user: User | null;

setAuth: (payload: {

accessToken: string;

refreshToken: string;

}) => void;

setUser: (user: User) => void;

logout: () => void;

};

export const useAuthStore = create<AuthState>((set) => ({

accessToken: null,

refreshToken: null,

user: null,

setAuth: ({ accessToken, refreshToken }) =>

set({ accessToken, refreshToken }),

setUser: (user) =>

set({ user }),

logout: () =>

set({

accessToken: null,

refreshToken: null,

user: null,

}),

}));