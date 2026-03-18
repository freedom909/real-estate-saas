export interface OAuthProfile {

  provider: string

  providerAccountId: string

  email?: string

  emailVerified?: boolean

  name?: string

  avatar?: string

  raw?: any

}