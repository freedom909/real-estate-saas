// application/services/IOTPService.ts
export interface IOTPService {
  generate(length?: number): Promise<{
    code: string;
    hash: string;
  }>;

  sendOTP(target: {
    userId: string;
    email?: string;
    phone?: string;
  }, code: string): Promise<void>;

  verify(input: string, storedHash: string): Promise<boolean>;
}