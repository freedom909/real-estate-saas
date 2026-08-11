"use client";

// Legacy page — replaced by /app/login/page.tsx
// Kept as stub to prevent Turbopack build errors

export default function Auth() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold mb-4">Redirecting to login...</h1>
      <a href="/login" className="text-blue-600 underline">Go to Login</a>
    </div>
  );
}
