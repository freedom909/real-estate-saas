import { create } from "zustand";

import { persist } from "zustand/middleware";

export interface AuthPayload {

accessToken: string;

refreshToken: string;

user: {

id: string;

email: string;

name?: string;

};

}

interface AuthState {

    accessToken: string | null;

    refreshToken: string | null;

    user: any | null;

    setAuth: (auth: AuthPayload) => void;

    logout: () => void;

}

export const useAuthStore = create<AuthState>()(

    persist(

        (set) => ({

            accessToken: null,

            refreshToken: null,

            user: null,

            setAuth: (auth) =>

                set({

                    accessToken: auth.accessToken,

                    refreshToken: auth.refreshToken,

                }),

            logout: () =>

                set({

                    accessToken: null,

                    refreshToken: null,

                    user: null,

                }),

        }),

        {

            name: "auth-storage",

        }

    )

);

