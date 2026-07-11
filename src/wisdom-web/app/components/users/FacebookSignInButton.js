'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function FacebookSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('facebook', { 
        callbackUrl: '/dashboard',
      });

      if (result?.url) {
        window.location.href = result.url;
      }
      
      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleFacebookSignIn}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 bg-blue-700 text-white px-6 py-1.5 rounded ${
          loading ? 'opacity-70' : 'hover:bg-blue-800'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
        </svg>
        <span>
          {loading ? 'Signing in...' : 'Sign in with Facebook'}
        </span>
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
}