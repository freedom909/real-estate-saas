// domain/entities/identity.entity.ts

// domain/entities/identity.entity.ts

export class Identity {
  constructor(
    public id: string,
    public userId: string,
    public provider: string,
    public providerId: string,
    public email?: string | null,
    public createdAt: Date = new Date()
  ) {}

  isSame(provider: string, providerId: string) {
    return this.provider === provider && this.providerId === providerId;
  }
}