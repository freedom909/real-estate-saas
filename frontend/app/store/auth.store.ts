// frontend/app/store/auth.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";


export interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: "CUSTOMER" | "AGENT" | "ADMIN" | "SUPER_ADMIN" | "OWNER" | "STAFF" | "MODERATOR" | "HOST" | "GUEST";
        name?: string;
        picture?: string;
    };
}

interface AuthState {
   accessToken: string | null;
    refreshToken: string | null;
    user: AuthPayload["user"] | null;
    // zustand persist hydration
    _hasHydrated: boolean;

    _setHasHydrated: (value: boolean) => void;
    // optional oauth state
    status: string | null;
    challengeId: string | null;
    setAuth: (payload: AuthPayload) => void;
    setUser: (user: AuthPayload["user"]) => void;
    logout: () => void;
    clear: () => void;

}


export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            _hasHydrated: false,
            status: null,
            challengeId: null,

            setAuth: (payload) => {
                set({

                    accessToken: payload.accessToken,

                    refreshToken: payload.refreshToken,

                    user: payload.user,
                });
            },




            setUser: (user) => {
               set({
                    user,
                });
            },

            logout: () => {
                set({

                    accessToken: null,

                    refreshToken: null,
                    user: null,
                    status: null,
                    challengeId: null,
                });
            },

            clear: () => {
                set({

                    accessToken: null,

                    refreshToken: null,

                    user: null,

                    status: null,

                    challengeId: null,
                });
            },

            _setHasHydrated: (value) => {
                set({
                    _hasHydrated: value,
                });
            }
        }),
        {
            name: "auth-storage",
           onRehydrateStorage: () => {
                return (state) => {
                   state?._setHasHydrated(true);
               };
            }
        }
    )

);