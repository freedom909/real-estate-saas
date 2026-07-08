// src/wisdom-web/app/services/user.service.ts
import { User } from "@/graphql/generated";
import axios from "axios";
import client from "../lib/apolloClient";
const API_URL = "/4000/graphql/user";
export async function getUser() {
    const { data } = await client.query({
        query: GET_USER,
    });

    return data?.user;
}