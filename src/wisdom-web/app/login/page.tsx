"use client";

import { oauthLogin } from "app/services/auth.service";

import { useAuthStore } from "app/store/auth.store";

import { useEffect, useRef } from "react";

export default function LoginPage() {

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

const initialized = useRef(false);

useEffect(() => {

if (initialized.current) return;

const script = document.createElement("script");

script.src = "https://accounts.google.com/gsi/client"
;

script.async = true;

script.defer = true;

script.onload = () => {

window.google.accounts.id.initialize({

client_id: GOOGLE_CLIENT_ID,

callback: async (response: any) => {

try {

const idToken = response.credential;

const result = await oauthLogin("GOOGLE", idToken);

if (!result?.accessToken) return;

const fullUser = {

id: result.user.id,

email: result.user.email,

name: result.user.name,

};

localStorage.setItem("accessToken", result.accessToken);

localStorage.setItem("refreshToken", result.refreshToken);

localStorage.setItem("user", JSON.stringify(fullUser));

useAuthStore.getState().setAuth({

accessToken: result.accessToken,

refreshToken: result.refreshToken,

});

useAuthStore.getState().setUser(fullUser);

window.location.href = "/listing";

} catch (err) {

console.error("Login callback error:", err);

}

},

});

initialized.current = true;

window.google.accounts.id.renderButton(

document.getElementById("googleButton"),

{

theme: "outline",

size: "large",

}

);

};

document.body.appendChild(script);

return () => {

document.body.removeChild(script);

};

}, []);

return (

<div style={{ padding: 80 }}>

<h1>Google Login Test</h1>

<div id="googleButton"></div>

</div>

);

}