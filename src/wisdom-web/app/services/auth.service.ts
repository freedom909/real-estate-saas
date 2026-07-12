// src/auth.service.ts

import { client } from "../lib/apolloClient";

import { gql } from "@apollo/client/core";

import { OAUTH_LOGIN } from "../graphql/auth/auth.mutations";

import { AuthPayload, useAuthStore } from "../store/auth.store";

export async function logout() {

    await client.clearStore();

    useAuthStore.getState().logout();

    return true;

}

export async function refreshToken() {

    const { data } = await client.mutate<{

        refreshToken: {
            user: { id: string; email: string; name?: string | undefined; };

            accessToken: string;

            refreshToken: string;
       

        };

    }>({

        mutation: gql`

mutation RefreshToken {

refreshToken {

accessToken

refreshToken

}

}

`,

    });

    if (data?.refreshToken) {

        useAuthStore.getState().setAuth({

            accessToken: data.refreshToken.accessToken,

            refreshToken: data.refreshToken.refreshToken,
            user: data.refreshToken.user,

        });

    }

    return true;

}

export async function oauthLogin(

    provider: string,

    idToken: string

): Promise<AuthPayload> {

    const { data } = await client.mutate<{

        oauthLogin: AuthPayload;

    }>({

        mutation: OAUTH_LOGIN,

        variables: {

            provider,

            idToken,

        },

    });
    const authPayload = data!.oauthLogin;
    useAuthStore.getState().setAuth(authPayload);

    console.log("保存的 token:", authPayload.accessToken);
    return authPayload;

}

export async function getCurrentUser() {

    return useAuthStore.getState().user;

}