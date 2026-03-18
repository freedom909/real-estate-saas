import UserProviderModel, {
  UserProvider,
  UserProviderDocument
} from "../models/userProvider.model.js"

interface UserProviderRepo {
  findByProviderId(
    provider: string,
    providerUserId: string
  ): Promise<UserProviderDocument | null>

  create(data: {
    userId: string
    provider: string
    providerUserId: string
  }): Promise<UserProviderDocument | null>
}

const UserProviderRepoImpl: UserProviderRepo = {
  findByProviderId(provider, providerUserId) {
    return UserProviderModel
      .findOne({ provider, providerUserId })
      .exec()
  },

  async create({ userId, provider, providerUserId }) {
    try {
      return await UserProviderModel.create({
        userId,
        provider,
        providerUserId
      })
    } catch (err: any) {
      if (err.code === 11000) return null
      throw err
    }
  }
}

export default UserProviderRepoImpl
