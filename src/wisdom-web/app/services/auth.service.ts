// src/wisdom-web/app/services/auth.service.ts
import {client} from "../lib/apolloClient";
import { gql } from "@apollo/client/core";
import { OAUTH_LOGIN } from "../graphql/auth/auth.mutations";
import {  useAuthStore } from "../store/auth.store";
const API_URL = "/4000/graphql/mutations";

export async function logout() {
    await client.clearStore();
    useAuthStore.getState().accessToken = "";
    return true;
}

export async function refreshToken() {   
    const { data } = await client.mutate({
        mutation: gql`
            mutation RefreshToken {
                refreshToken {
                    accessToken
                    refreshToken
                }
            }
        `,
    });
    useAuthStore.getState().setAuth(data.refreshToken);
    return true;
}

export async function oauthLogin(provider: string, idToken: string) {
    const { data } = await client.mutate({
        mutation: OAUTH_LOGIN,
        variables: {
            provider,
            idToken,
        },
    });
    return data.oauthLogin;
}

export async function getCurrentUser() {
    if (!useAuthStore.getState().accessToken) {
        return null;
    }
    const { data } = await client.query({
        query: gql`
            query CurrentUser {
                user {
                    id
                }
            }
        `,
    });
    return data.user;
}