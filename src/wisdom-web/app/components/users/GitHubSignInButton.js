"use client";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";

export default function GithubSignInButton() {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-6 py-2.5 rounded-lg w-full flex items-center justify-center gap-3 shadow-sm transition-all duration-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
    >
      <FaGithub className="w-5 h-5" />
      <span>Continue with Github</span>
    </button>
  );
}