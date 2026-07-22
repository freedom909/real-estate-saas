// File: /pages/api/auth/register.js
import { signIn } from 'next-auth/react';
import localAuthService from "@/userService/localAuthService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password, name, nickname, picture, role } = req.body;

  try {
    const result = await localAuthService.register({
      email,
      password,
      name,
      nickname,
      picture,
      role
    });

    if (result.success) {
        await signIn("credentials", {
            redirect: true,
            email: formData.email,
            password: formData.password,
            callbackUrl: "/dashboard"
        });
      return res.status(201).json({ success: true, user: result.user });
    } else {
      return res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
