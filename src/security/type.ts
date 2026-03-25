// 

export interface LoginContext {
  ip: string;
  userAgent: string;
  deviceId: string;
  isFirstLogin: boolean;
}

export interface StrategyResult {
  mode: "normal" | "strict" | "verify";
  showSecurityBanner: boolean;
  showOnboarding: boolean;
}