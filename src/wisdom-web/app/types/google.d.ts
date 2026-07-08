// src/wisdom-web/app/types/google.d.ts
export {};
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    renderButton(arg0: HTMLElement | null, arg1: { theme: string; size: string; }): unknown;
                    initialize(options: any): void;
           
                    prompt(): void;
                };
            };
        };
    }
}