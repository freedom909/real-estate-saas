// src/wisdom-web/app/components/login/OAuthButton.tsx


// src/wisdom-web/app/components/login/OAuthButton.tsx

"use client";

import { ReactNode } from "react";

export interface OAuthButtonProps {
    /** OAuth 提供商 */
    provider: "google" | "github";
    label: string;
    icon: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export default function OAuthButton({
    provider,
    label,
    icon,
    onClick,
    disabled = false,
    loading = false,
}: OAuthButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-gray-800
                shadow-sm
                transition
                hover:bg-gray-50
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
            data-provider={provider}
        >
            <span className="text-xl">
                {loading ? "..." : icon}
            </span>

            <span>
                {loading ? "Loading..." : label}
            </span>
        </button>
    );
}