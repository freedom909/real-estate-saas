"use client";

import { handleFacebookLogin } from "@/app/components/login/handleFacebook.login";

export default function FacebookSignInButton() {
  return (
    <button
      onClick={handleFacebookLogin}
      className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-6 py-2.5 rounded-lg w-full flex items-center justify-center gap-3 shadow-sm transition-all duration-200 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
      </svg>
      <span>Continue with Facebook</span>
    </button>
  );
}
