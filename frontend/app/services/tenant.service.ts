// src/wisdom-web/app/services/tenant.service.ts
import { Tenant } from "@/graphql/generated";
import axios from "axios";
import {client }from "../lib/apolloClient";
const API_URL = "/4000/graphql/tenants";
export async function getTenant() {
    const { data } = await client.query({
        query: GET_TENANT,
    });

    return data?.tenant;
}