// src/wisdom-web/app/auth/auth.provider.tsx

"use client";

import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/apolloClient";
import TenantSync from "./tenant-sync";
import { useAuthStore } from "../store/auth.store";
import { useEffect } from "react";

function SyncAuthFromCookies() {

  const setAuth = useAuthStore(
    (s)=>s.setAuth
  );


  const hasHydrated = useAuthStore(
    (s)=>s._hasHydrated
  );

  function getCookie(name:string){
    const match=document.cookie.match(
      new RegExp("(^| )"+name+"=([^;]+)")
    );

    return match
      ? decodeURIComponent(match[2])
      : null;
  }


  useEffect(()=>{


    if(!hasHydrated) return;


    const token = useAuthStore.getState().accessToken;


    if(token){
      console.log(
        "Already authenticated"
      );
      return;
    }


    const accessToken=getCookie(
      "accessToken"
    );

    const refreshToken=getCookie(
      "refreshToken"
    );


    if(!accessToken || !refreshToken)
      return;



    let userId="";
    let userRole = "CUSTOMER";
    let userEmail = "";

    try{

      const payload =
        JSON.parse(
          atob(
            accessToken.split(".")[1]
          )
        );

      userId=payload.sub || "";
      userRole = payload.role || "CUSTOMER";
      userEmail = payload.email || getCookie("userEmail") || "";

    }catch(e){}

    setAuth({

      accessToken,

      refreshToken,

      user:{
        id:userId,
        email:userEmail,
        name:getCookie("userName") || "",
        picture:getCookie("userPicture") || "",
        role:userRole,
      }
    });
  },[hasHydrated]);
  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
      <SyncAuthFromCookies />
      <TenantSync />
      {children}
    </ApolloProvider>
  );
}
